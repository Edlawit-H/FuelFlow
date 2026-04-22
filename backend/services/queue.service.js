// TODO: Dev 4

//export const joinQueue = async (userId, stationId, fuelType) => {};
//export const leaveQueue = async (userId, stationId, fuelType) => {};
//export const getMyStatus = async (userId) => {};
export const serveUser = async (stationId, fuelType, entryId, adminId) => {};
export const removeNoShow = async (stationId, fuelType, entryId, adminId) => {};
export const pauseQueue = async (stationId, fuelType, adminId) => {};
export const resumeQueue = async (stationId, fuelType, adminId) => {};
export const setFuelAvailability = async (stationId, fuelType, adminId, fuelAvailable) => {};
export const setServeTime = async (stationId, fuelType, adminId, minutes) => {};
export const getQueueList = async (stationId, fuelType, adminId) => {};
export const runNoShowDetection = () => {};



export const joinQueue = async (userId, stationId, fuelType) => {
  const existing = await QueueEntry.findOne({
    userId,
    status: "active",
  });

  if (existing) throw new Error("Already in queue");

  const queue = await Queue.findOne({ stationId, fuelType });

  if (!queue.fuelAvailable) throw new Error("Fuel not available");
  if (queue.isPaused) throw new Error("Queue paused");

  const updatedQueue = await Queue.findOneAndUpdate(
    { _id: queue._id },
    { $inc: { counter: 1 } },
    { new: true }
  );

  const entry = await QueueEntry.create({
    queueId: queue._id,
    stationId,
    userId,
    fuelType,
    position: updatedQueue.counter,
  });

  return entry;
};




export const leaveQueue = async (userId) => {
  const entry = await QueueEntry.findOne({
    userId,
    status: "active",
  });

  if (!entry) throw new Error("No active queue");

  entry.status = "left";
  await entry.save();

  await QueueEntry.updateMany(
    {
      queueId: entry.queueId,
      position: { $gt: entry.position },
    },
    { $inc: { position: -1 } }
  );

  return { message: "Left queue" };
};



export const getMyStatus = async (userId) => {
  const entry = await QueueEntry.findOne({
    userId,
    status: "active",
  });

  if (!entry) return { active: false };

  return {
    active: true,
    entry,
  };
};