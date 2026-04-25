// TODO: Dev 4
import * as queueService from "../services/queue.service.js";

export const joinQueue = async (req, res) => {
  try {
    const { id, fuelType } = req.params;

    const result = await queueService.joinQueue(
      req.user.id,
      id,
      fuelType
    );

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const leaveQueue = async (req, res) => {
  try {
    const result = await queueService.leaveQueue(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

export const getMyStatus = async (req, res) => {
  try {
    const result = await queueService.getMyStatus(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};