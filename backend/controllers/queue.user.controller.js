import * as queueService from "../services/queue.service.js";

export const joinQueue = async (req, res, next) => {
  try {
    const { id, fuelType } = req.params;
    const result = await queueService.joinQueue(req.user.id, id, fuelType);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const leaveQueue = async (req, res, next) => {
  try {
    const result = await queueService.leaveQueue(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getMyStatus = async (req, res, next) => {
  try {
    const result = await queueService.getMyStatus(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
