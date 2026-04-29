import Queue from "../models/Queue.js";
import QueueEntry from "../models/QueueEntry.js";
import Token from "../models/Token.js";
import * as tokenService from "./token.service.js";


// ================= USER FUNCTIONS ================= //

//  JOIN QUEUE
export const joinQueue = async (userId, stationId, fuelType) => {
  const existing = await QueueEntry.findOne({
    userId,
    status: "active",
  });

  if (existing) throw { status: 409, message: "Already in queue" };

  // single atomic operation — checks fuelAvailable and isPaused in filter
  const queue = await Queue.findOneAndUpdate(
    { stationId, fuelType, fuelAvailable: true, isPaused: false },
    { $inc: { counter: 1 } },
    { new: true }
  );

  if (!queue) {
    const check = await Queue.findOne({ stationId, fuelType });
    if (!check) throw { status: 404, message: "Queue not found" };
    if (!check.fuelAvailable) throw { status: 409, message: "Fuel not available" };
    if (check.isPaused) throw { status: 409, message: "Queue is paused" };
    throw { status: 409, message: "Cannot join queue" };
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

  return { entry, token };
};


// LEAVE QUEUE
export const leaveQueue = async (userId) => {
  const entry = await QueueEntry.findOne({
    userId,
    status: "active",
  });

  if (!entry) throw { status: 404, message: "No active queue" };

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

  if (!entry) throw { status: 404, message: "Entry not found" };

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
};


// REMOVE NO SHOW
export const removeNoShow = async (stationId, fuelType, entryId) => {
  const entry = await QueueEntry.findById(entryId);

  if (!entry) throw { status: 404, message: "Entry not found" };

  entry.status = "no_show";
  await entry.save();

  await QueueEntry.updateMany(
    {
      queueId: entry.queueId,
      position: { $gt: entry.position },
    },
    { $inc: { position: -1 } }
  );
};


// PAUSE QUEUE
export const pauseQueue = async (stationId, fuelType) => {
  await Queue.findOneAndUpdate(
    { stationId, fuelType },
    { isPaused: true }
  );
};


// RESUME QUEUE
export const resumeQueue = async (stationId, fuelType) => {
  await Queue.findOneAndUpdate(
    { stationId, fuelType },
    { isPaused: false }
  );
};


// SET FUEL AVAILABILITY
export const setFuelAvailability = async (stationId, fuelType, fuelAvailable) => {
  await Queue.findOneAndUpdate(
    { stationId, fuelType },
    { fuelAvailable }
  );
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