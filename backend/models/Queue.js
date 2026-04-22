// TODO: Dev 4
import mongoose from "mongoose";

const queueSchema = new mongoose.Schema({
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true,
  },
  fuelType: {
    type: String,
    required: true,
  },
  isPaused: {
    type: Boolean,
    default: false,
  },
  fuelAvailable: {
    type: Boolean,
    default: true,
  },
  serveTimeMinutes: {
    type: Number,
    default: 5,
  },
  timeoutWindowMinutes: {
    type: Number,
    default: 15,
  },
  counter: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

queueSchema.index({ stationId: 1, fuelType: 1 }, { unique: true });

export default mongoose.model("Queue", queueSchema);