import Queue from "../models/Queue.js";
import QueueEntry from "../models/QueueEntry.js";
import Token from "../models/Token.js";
import * as tokenService from "./token.service.js";
import * as analyticsService from "./analytics.service.js";
import { AppError } from "../middleware/errorHandler.js";
import { io } from "../app.js";


// ================= USER FUNCTIONS ================= //

//  JOIN QUEUE
export const joinQueue = async (userId, stationId, fuelType) => {
  const existing = await QueueEntry.findOne({
    userId,
    status: "active",
  });

  if (existing) throw new AppError(409, 'Already in queue');

  const queue = await Queue.findOneAndUpdate(
    { stationId, fuelType, fuelAvailable: true, isPaused: false },
    { $inc: { counter: 1 } },
    { new: true }
  );

  if (!queue) {
    const check = await Queue.findOne({ stationId, fuelType });
    if (!check) throw new AppError(404, 'Queue not found');
    if (!check.fuelAvailable) throw new AppError(409, 'Fuel not available');
    if (check.isPaused) throw new AppError(409, 'Queue is paused');
    throw new AppError(409, 'Cannot join queue');
  }

  const position = queue.counter;
  const estimatedWaitMinutes = (position - 1) * queue.serveTimeMinutes;

  const entry = await QueueEntry.create({
    queueId: queue._id,
    stationId,
    userId,
    fuelType,
    position,
    estimatedWaitMinutes,
  });

  // TOKEN CREATION (Dev 5 integration)
  const token = await tokenService.createToken({
    userId,
    stationId,
    queueEntryId: entry._id,
    fuelType,
    joinedAt: entry.joinedAt,
  });

  // Analytics recording (non-blocking)
  analyticsService.recordJoin(stationId, fuelType, estimatedWaitMinutes).catch(() => {});

  // WebSocket: broadcast queue update to station room
  try {
    io.to(`station:${stationId}`).emit('queue-update', {
      stationId,
      fuelType,
      queueLength: queue.counter,
      event: 'join',
    });
    // Also notify the joining user directly
    io.to(`user:${userId}`).emit('queue-update', {
      stationId,
      fuelType,
      event: 'joined',
      position,
      estimatedWaitMinutes,
    });
  } catch { /* non-critical */ }

  return { entry, token };
};


// LEAVE QUEUE
export const leaveQueue = async (userId) => {
  const entry = await QueueEntry.findOne({
    userId,
    status: "active",
  });

  if (!entry) throw new AppError(404, 'No active queue');

  entry.status = "left";
  await entry.save();

  // shift positions
  await QueueEntry.updateMany(
    { queueId: entry.queueId, position: { $gt: entry.position } },
    { $inc: { position: -1 } }
  );

  // recalculate EWT for remaining active entries
  const queue = await Queue.findById(entry.queueId);
  const remaining = await QueueEntry.find({ queueId: entry.queueId, status: "active" });
  for (const e of remaining) {
    e.estimatedWaitMinutes = (e.position - 1) * queue.serveTimeMinutes;
    await e.save();
  }

  // invalidate token
  await tokenService.invalidateToken(entry._id);

  // WebSocket: broadcast queue update
  try {
    io.to(`station:${entry.stationId}`).emit('queue-update', {
      stationId: entry.stationId,
      fuelType: entry.fuelType,
      event: 'leave',
    });
  } catch { /* non-critical */ }

  return { message: "Left queue" };
};


// MY STATUS (POLLING)
export const getMyStatus = async (userId) => {
  const entry = await QueueEntry.findOne({
    userId,
    status: "active",
  }).populate("stationId");

  if (!entry) return { active: false };

  const queue = await Queue.findById(entry.queueId);

  const token = await Token.findOne({ queueEntryId: entry._id });

  return {
    active: true,
    entry: {
      id: entry._id,
      position: entry.position,
      estimatedWaitMinutes: entry.estimatedWaitMinutes,
      fuelType: entry.fuelType,
      stationId: entry.stationId._id,
      stationName: entry.stationId.name,
      joinedAt: entry.joinedAt,
      status: entry.status,
      noShowEligible: entry.noShowEligible,
    },
    queue: {
      isPaused: queue.isPaused,
      fuelAvailable: queue.fuelAvailable,
    },
    token: token
      ? {
          tokenId: token.tokenId,
          pinCode: token.pinCode,
        }
      : null,
  };
};


// ================= ADMIN FUNCTIONS ================= //

// SERVE USER
export const serveUser = async (stationId, fuelType, entryId) => {
  const entry = await QueueEntry.findById(entryId);

  if (!entry) throw new AppError(404, 'Entry not found');

  const waitMinutes = entry.joinedAt
    ? Math.floor((Date.now() - new Date(entry.joinedAt)) / 60000)
    : 0;

  entry.status = "served";
  entry.servedAt = new Date();
  await entry.save();

  await QueueEntry.updateMany(
    {
      queueId: entry.queueId,
      position: { $gt: entry.position },
    },
    { $inc: { position: -1 } }
  );

  // Analytics
  analyticsService.recordServe(stationId, fuelType, waitMinutes).catch(() => {});

  // Recalculate EWT for remaining entries and emit to each user's room
  const remaining = await QueueEntry.find({ queueId: entry.queueId, status: 'active' }).sort({ position: 1 });
  const queue = await Queue.findById(entry.queueId);
  for (const e of remaining) {
    e.estimatedWaitMinutes = (e.position - 1) * (queue?.serveTimeMinutes || 5);
    await e.save();
    // Push directly to the driver's personal room
    try {
      io.to(`user:${e.userId}`).emit('queue-update', {
        stationId,
        fuelType,
        event: 'position_update',
        position: e.position,
        estimatedWaitMinutes: e.estimatedWaitMinutes,
      });
    } catch { /* non-critical */ }
  }

  // WebSocket: broadcast to station room
  try {
    io.to(`station:${stationId}`).emit('queue-update', { stationId, fuelType, event: 'serve' });
  } catch { /* non-critical */ }
};


// REMOVE NO SHOW
export const removeNoShow = async (stationId, fuelType, entryId) => {
  const entry = await QueueEntry.findById(entryId);

  if (!entry) throw new AppError(404, 'Entry not found');

  entry.status = "no_show";
  await entry.save();

  await QueueEntry.updateMany(
    {
      queueId: entry.queueId,
      position: { $gt: entry.position },
    },
    { $inc: { position: -1 } }
  );

  // Analytics
  analyticsService.recordNoShow(stationId, fuelType).catch(() => {});

  // WebSocket
  try {
    io.to(`station:${stationId}`).emit('queue-update', { stationId, fuelType, event: 'no_show' });
  } catch { /* non-critical */ }
};


// PAUSE QUEUE
export const pauseQueue = async (stationId, fuelType) => {
  await Queue.findOneAndUpdate({ stationId, fuelType }, { isPaused: true });
  try {
    io.to(`station:${stationId}`).emit('queue-update', { stationId, fuelType, event: 'pause' });
  } catch { /* non-critical */ }
};


// RESUME QUEUE
export const resumeQueue = async (stationId, fuelType) => {
  await Queue.findOneAndUpdate({ stationId, fuelType }, { isPaused: false });
  try {
    io.to(`station:${stationId}`).emit('queue-update', { stationId, fuelType, event: 'resume' });
  } catch { /* non-critical */ }
};


// SET FUEL AVAILABILITY
export const setFuelAvailability = async (stationId, fuelType, fuelAvailable) => {
  await Queue.findOneAndUpdate({ stationId, fuelType }, { fuelAvailable });
  try {
    io.to(`station:${stationId}`).emit('queue-update', { stationId, fuelType, event: 'fuel_availability', fuelAvailable });
  } catch { /* non-critical */ }
};


// SET SERVE TIME
export const setServeTime = async (stationId, fuelType, minutes) => {
  const queue = await Queue.findOneAndUpdate(
    { stationId, fuelType },
    { serveTimeMinutes: minutes },
    { new: true }
  );

  // recalculate EWT
  const entries = await QueueEntry.find({
    queueId: queue._id,
    status: "active",
  });

  for (let entry of entries) {
    entry.estimatedWaitMinutes =
      entry.position * queue.serveTimeMinutes;
    await entry.save();
  }
};


// GET QUEUE LIST (ADMIN)
export const getQueueList = async (stationId, fuelType) => {
  const queue = await Queue.findOne({ stationId, fuelType });

  const entries = await QueueEntry.find({
    queueId: queue._id,
    status: "active",
  }).sort({ position: 1 });

  const result = await Promise.all(entries.map(async (entry) => {
    const token = await Token.findOne({ queueEntryId: entry._id });
    return {
      ...entry.toObject(),
      pinCode: token ? token.pinCode : null,
      elapsedMinutes: Math.floor((Date.now() - new Date(entry.joinedAt)) / 60000),
    };
  }));

  return result;
};


// NO SHOW DETECTION
export const runNoShowDetection = () => {
  setInterval(async () => {
    const queues = await Queue.find();

    for (let queue of queues) {
      const first = await QueueEntry.findOne({
        queueId: queue._id,
        position: 1,
        status: "active",
      });

      if (!first) continue;

      const elapsed =
        (Date.now() - new Date(first.joinedAt)) / 60000;

      if (elapsed > queue.timeoutWindowMinutes) {
        first.noShowEligible = true;
        await first.save();
      }
    }
  }, 60000);
};