import mongoose from 'mongoose';

// One document per station per day — aggregated queue stats
const stationAnalyticsSchema = new mongoose.Schema({
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  date: {
    type: String, // 'YYYY-MM-DD'
    required: true,
  },
  fuelType: {
    type: String,
    required: true,
  },
  // Hourly bucket: index 0-23 = hour of day
  hourlyJoins: {
    type: [Number],
    default: () => new Array(24).fill(0),
  },
  hourlyServed: {
    type: [Number],
    default: () => new Array(24).fill(0),
  },
  totalJoins: { type: Number, default: 0 },
  totalServed: { type: Number, default: 0 },
  totalNoShows: { type: Number, default: 0 },
  avgWaitMinutes: { type: Number, default: 0 },
  peakHour: { type: Number, default: 0 },
  congestionLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
});

stationAnalyticsSchema.index({ stationId: 1, date: 1, fuelType: 1 }, { unique: true });

export default mongoose.model('StationAnalytics', stationAnalyticsSchema);
