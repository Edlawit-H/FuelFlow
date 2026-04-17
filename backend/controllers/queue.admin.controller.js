// DEV 1 — Admin Queue HTTP layer
// Calls queue.service.js (owned by Dev 4) for all business logic

import * as queueService from '../services/queue.service.js';

export const getQueueList = async (req, res, next) => {
  try {
    const { id: stationId, fuelType } = req.params;
    const adminId = req.user.id;
    const queue = await queueService.getQueueList(stationId, fuelType, adminId);
    res.status(200).json(queue);
  } catch (error) {
    next(error);
  }
};

export const pauseQueue = async (req, res, next) => {
  try {
    const { id: stationId, fuelType } = req.params;
    const adminId = req.user.id;
    await queueService.pauseQueue(stationId, fuelType, adminId);
    res.status(200).json({ message: 'Queue paused' });
  } catch (error) {
    next(error);
  }
};

export const resumeQueue = async (req, res, next) => {
  try {
    const { id: stationId, fuelType } = req.params;
    const adminId = req.user.id;
    await queueService.resumeQueue(stationId, fuelType, adminId);
    res.status(200).json({ message: 'Queue resumed' });
  } catch (error) {
    next(error);
  }
};

export const setFuelAvailability = async (req, res, next) => {
  try {
    const { id: stationId, fuelType } = req.params;
    const { fuelAvailable } = req.body;
    const adminId = req.user.id;
    await queueService.setFuelAvailability(stationId, fuelType, adminId, fuelAvailable);
    res.status(200).json({ message: 'Fuel availability updated' });
  } catch (error) {
    next(error);
  }
};

export const setServeTime = async (req, res, next) => {
  try {
    const { id: stationId, fuelType } = req.params;
    const { serveTimeMinutes } = req.body;
    const adminId = req.user.id;
    await queueService.setServeTime(stationId, fuelType, adminId, serveTimeMinutes);
    res.status(200).json({ message: 'Serve time updated' });
  } catch (error) {
    next(error);
  }
};

export const serveUser = async (req, res, next) => {
  try {
    const { id: stationId, fuelType, entryId } = req.params;
    const adminId = req.user.id;
    await queueService.serveUser(stationId, fuelType, entryId, adminId);
    res.status(200).json({ message: 'User marked as served' });
  } catch (error) {
    next(error);
  }
};

export const removeNoShow = async (req, res, next) => {
  try {
    const { id: stationId, fuelType, entryId } = req.params;
    const adminId = req.user.id;
    await queueService.removeNoShow(stationId, fuelType, entryId, adminId);
    res.status(200).json({ message: 'No-show removed from queue' });
  } catch (error) {
    next(error);
  }
};
