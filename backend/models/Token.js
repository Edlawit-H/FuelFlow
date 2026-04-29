import mongoose from 'mongoose';
import crypto from 'crypto';

const tokenSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    unique: true,
    required: true,
    default: () => crypto.randomUUID()
  },
  pinCode: {
    type: String,
    unique: true,
    required: true,
    // Generates 6-char hex e.g., A3F9B2
    default: () => crypto.randomBytes(3).toString('hex').toUpperCase()
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  queueEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QueueEntry',
    required: true
  },
  fuelType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'used', 'invalidated'],
    default: 'active'
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Token', tokenSchema);