import Station from "../models/Station.js"; // ⚠️ add .js

// 🟢 CREATE STATION
const createStation = async (req, res) => {
  try {
    const { name, address, location, fuelTypes } = req.body;

    const adminId = req.body.adminId;

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const station = await Station.create({
      adminId,
      name,
      address,
      location,
      fuelTypes,
    });

    res.status(201).json({
      message: "Station created successfully",
      station,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 GET ALL / GEO SEARCH
const getStations = async (req, res) => {
  try {
    const { lng, lat, radius } = req.query;

    let stations;

    if (lng && lat) {
      stations = await Station.find({
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: radius ? parseInt(radius) : 5000,
          },
        },
      });
    } else {
      stations = await Station.find();
    }

    res.status(200).json({
      count: stations.length,
      stations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 GET BY ID
const getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);

    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    res.status(200).json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 RECOMMENDATIONS
const getRecommendations = async (req, res) => {
  try {
    const { lng, lat } = req.query;

    const stations = await Station.find();

    const scored = stations.map((station) => {
      let distanceScore = 1;

      if (
        lng &&
        lat &&
        station.location &&
        station.location.coordinates
      ) {
        const dx = station.location.coordinates[0] - parseFloat(lng);
        const dy = station.location.coordinates[1] - parseFloat(lat);

        const distance = Math.sqrt(dx * dx + dy * dy);

        distanceScore = 1 / (distance + 0.001);
      }

      const queueLength = 1;
      const fuelAvailable = 1;

      const score =
        (1 / queueLength) +
        distanceScore +
        fuelAvailable;

      return {
        station,
        score,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    res.status(200).json({
      count: scored.length,
      recommendations: scored,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ ES6 EXPORT
export {
  createStation,
  getStations,
  getStationById,
  getRecommendations,
};