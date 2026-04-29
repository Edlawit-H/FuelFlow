// TODO: Dev 3
import mongoose from "mongoose";

const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
    },

    fuelTypes: {
      type: [String], 
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    queues: [
      {
        fuelType: String,
        currentCount: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

const Station = mongoose.model("Station", stationSchema);

export default Station;