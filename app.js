import express from "express";
import cors from "cors";
import stationRoutes from "./routes/stationRoutes.js"; // ⚠️ must add .js

const app = express();

app.use(cors());
app.use(express.json());

app.use("/stations", stationRoutes);

app.get("/", (req, res) => {
  res.send("FuelFlow API is running 🚀");
});

export default app;