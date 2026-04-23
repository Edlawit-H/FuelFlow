// TODO: Dev 5
import Token from '../models/Token.js';
import QueueEntry from '../models/QueueEntry.js';

/**
 * Generates a new token and QR payload
 */
export const createToken = async (data) => {
  const { userId, stationId, queueEntryId, fuelType } = data;
  
  const token = new Token({
    userId,
    stationId,
    queueEntryId,
    fuelType
  });

  // Build the QR Payload for the frontend [cite: 150]
  token.qrPayload = JSON.stringify({
    tokenId: token.tokenId,
    stationId,
    fuelType,
    issuedAt: token.issuedAt
  });

  return await token.save(); 
};

/**
 * Validates a token and checks if it's the user's turn
 */
export const validateToken = async (tokenId, adminStationId) => {
  const token = await Token.findOne({ tokenId }).populate('queueEntryId');

  if (!token) throw new Error('Token not found'); 
  
  // Check if scanning at the correct station [cite: 154, 155]
  if (token.stationId.toString() !== adminStationId.toString()) {
    throw new Error('Wrong station'); 
  }

  // Check if token was already used [cite: 156]
  if (token.status !== 'active') {
    throw new Error(`Token already ${token.status}`);
  }

  // Only validate if they are at position #1 [cite: 157]
  if (token.queueEntryId.position !== 1) {
    throw new Error('Not your turn yet');
  }

  token.status = 'used'; 
  await token.save();
  
  return token;
};

/**
 * Invalidates token if user leaves queue
 */
export const invalidateToken = async (queueEntryId) => {
  return await Token.findOneAndUpdate(
    { queueEntryId },
    { status: 'invalidated' },
    { new: true }
  );
};