import mongoose from "mongoose";

const stationSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  address: {
    type: String,
    required: true,
    trim: true,
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },

  fuelTypes: {
    type: [String],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 🌍 Enable geo queries
stationSchema.index({ location: "2dsphere" });

// ✅ ES6 export
export default mongoose.model("Station", stationSchema);