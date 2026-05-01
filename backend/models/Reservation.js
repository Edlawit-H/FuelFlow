import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  fuelType: {
    type: String,
    required: true,
  },
  slotDate: {
    type: String, // 'YYYY-MM-DD'
    required: true,
  },
  slotHour: {
    type: Number, // 0-23
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'expired', 'used'],
    default: 'pending',
  },
  pinCode: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
});

reservationSchema.index({ stationId: 1, fuelType: 1, slotDate: 1, slotHour: 1 });
reservationSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Reservation', reservationSchema);
