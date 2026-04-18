// TODO: Dev 4 implements all functions

export const joinQueue = async (userId, stationId, fuelType) => {};
export const leaveQueue = async (userId, stationId, fuelType) => {};
export const getMyStatus = async (userId) => {};
export const serveUser = async (stationId, fuelType, entryId, adminId) => {};
export const removeNoShow = async (stationId, fuelType, entryId, adminId) => {};
export const pauseQueue = async (stationId, fuelType, adminId) => {};
export const resumeQueue = async (stationId, fuelType, adminId) => {};
export const setFuelAvailability = async (stationId, fuelType, adminId, fuelAvailable) => {};
export const setServeTime = async (stationId, fuelType, adminId, minutes) => {};
export const getQueueList = async (stationId, fuelType, adminId) => {};
export const runNoShowDetection = () => {};
