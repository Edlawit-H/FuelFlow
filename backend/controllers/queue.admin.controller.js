import * as queueService from '../services/queue.service.js';

export const getQueueList = async (req, res, next) => {
  try {
    const { id: stationId, fuelType } = req.params;
    const entries = await queueService.getQueueList(stationId, fuelType);
    res.status(200).json(entries);
  } catch (error) {
    next(error);
  }
};

export const pauseQueue = async (req, res, next) => {
  try {
    const { id: stationId, fuelType } = req.params;
    await queueService.pauseQueue(stationId, fuelType);
    res.status(200).json({ message: 'Queue paused' });
  } catch (error) {
    next(error);
  }
};

export const resumeQueue = async (req, res, next) => {
  try {
    const { id: stationId, fuelType } = req.params;
    await queueService.resumeQueue(stationId, fuelType);
    res.status(200).json({ message: 'Queue resumed' });
  } catch (error) {
    next(error);
  }
};

export const setFuelAvailability = async (req, res, next) => {
  try {
    const { id: stationId, fuelType } = req.params;
    const { fuelAvailable } = req.body;
    await queueService.setFuelAvailability(stationId, fuelType, fuelAvailable);
    res.status(200).json({ message: 'Fuel availability updated' });
  } catch (error) {
    next(error);
  }
};

export const setServeTime = async (req, res, next) => {
  try {
    const { id: stationId, fuelType } = req.params;
    const { serveTimeMinutes } = req.body;
    await queueService.setServeTime(stationId, fuelType, serveTimeMinutes);
    res.status(200).json({ message: 'Serve time updated' });
  } catch (error) {
    next(error);
  }
};

export const serveUser = async (req, res, next) => {
  try {
    const { id: stationId, fuelType, entryId } = req.params;
    await queueService.serveUser(stationId, fuelType, entryId);
    res.status(200).json({ message: 'User marked as served' });
  } catch (error) {
    next(error);
  }
};

export const removeNoShow = async (req, res, next) => {
  try {
    const { id: stationId, fuelType, entryId } = req.params;
    await queueService.removeNoShow(stationId, fuelType, entryId);
    res.status(200).json({ message: 'No-show removed' });
  } catch (error) {
    next(error);
  }
};
