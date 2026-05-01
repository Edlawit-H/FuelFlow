import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'turn_soon',       // position <= threshold
      'leave_now',       // EWT approaching, user should leave
      'queue_paused',    // queue was paused
      'fuel_available',  // fuel became available
      'congestion_high', // station congestion spike
      'no_show_warning', // user is about to be marked no-show
    ],
    required: true,
  },
  message: { type: String, required: true },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
  fuelType: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

alertSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model('Alert', alertSchema);
