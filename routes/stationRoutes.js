import express from "express";

const router = express.Router();

import {
  createStation,
  getStations,
  getStationById,
  getRecommendations
} from "../controllers/stationController.js"; // ⚠️ add .js

router.post("/", createStation);
router.get("/", getStations);
router.get("/recommendations", getRecommendations);
router.get("/:id", getStationById);

export default router;