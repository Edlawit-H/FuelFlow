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