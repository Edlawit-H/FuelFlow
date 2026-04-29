import Token from '../models/Token.js';
import { AppError } from '../middleware/errorHandler.js';

export const createToken = async (data) => {
  const token = new Token({
    userId: data.userId,
    stationId: data.stationId,
    queueEntryId: data.queueEntryId,
    fuelType: data.fuelType
  });
  return await token.save();
};

export const validateToken = async (pinCode, stationId) => {
  const token = await Token.findOne({ pinCode }).populate('queueEntryId');

  if (!token) {
    throw new AppError(404, 'Token not found');
  }

  if (token.stationId.toString() !== stationId) {
    throw new AppError(403, 'Wrong station');
  }

  if (token.status !== 'active') {
    throw new AppError(409, 'Code already used');
  }

  // Check QueueEntry position === 1
  if (!token.queueEntryId || token.queueEntryId.position !== 1) {
    throw new AppError(409, 'Not your turn yet');
  }

  token.status = 'used';
  await token.save();

  return {
    position: token.queueEntryId.position,
    joinedAt: token.issuedAt,
    fuelType: token.fuelType
  };
};

export const invalidateToken = async (queueEntryId) => {
  return await Token.findOneAndUpdate(
    { queueEntryId },
    { status: 'invalidated' },
    { new: true }
  );
};