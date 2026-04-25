// TODO: Dev 4
import mongoose from "mongoose";

const queueEntrySchema = new mongoose.Schema({
  queueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Queue",
    required: true,
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fuelType: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "served", "left", "no_show"],
    default: "active",
  },
  noShowEligible: {
    type: Boolean,
    default: false,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  servedAt: Date,
  estimatedWaitMinutes: Number,
});

queueEntrySchema.index({ queueId: 1, position: 1 });
queueEntrySchema.index({ userId: 1, status: 1 });

export default mongoose.model("QueueEntry", queueEntrySchema);