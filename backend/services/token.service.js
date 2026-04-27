import Token from '../models/Token.js';

/**
 * Task: createToken logic
 */
export const createToken = async (data) => {
  const token = new Token({
    userId: data.userId,
    stationId: data.stationId,
    queueEntryId: data.queueEntryId,
    fuelType: data.fuelType
  });
  return await token.save();
};

/**
 * Task: POST /tokens/validate logic (Fraud Prevention)
 */
export const validateToken = async (pinCode, stationId) => {
  const token = await Token.findOne({ pinCode }).populate('queueEntryId');

  if (!token) {
    throw { status: 404, message: "Token not found" };
  }

  if (token.stationId.toString() !== stationId) {
    throw { status: 403, message: "Wrong station" };
  }

  if (token.status !== 'active') {
    throw { status: 409, message: "Code already used" };
  }

  // Check QueueEntry position === 1
  if (!token.queueEntryId || token.queueEntryId.position !== 1) {
    throw { status: 409, message: "Not your turn yet" };
  }

  token.status = 'used';
  await token.save();

  return {
    position: token.queueEntryId.position,
    joinedAt: token.issuedAt,
    fuelType: token.fuelType
  };
};

/**
 * Task: invalidateToken logic
 */
export const invalidateToken = async (queueEntryId) => {
  return await Token.findOneAndUpdate(
    { queueEntryId },
    { status: 'invalidated' },
    { new: true }
  );
};