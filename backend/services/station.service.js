import Station from '../models/Station.js';
import Queue from '../models/Queue.js';
import { AppError } from '../middleware/errorHandler.js';
import config from '../config/config.js';
import { calculateEWT } from '../utils/ewt.js';

export const createStation = async (adminId, { name, address, location, fuelTypes }) => {
  const station = await Station.create({ adminId, name, address, location, fuelTypes });

  // auto-create one Queue per fuel type
  await Promise.all(fuelTypes.map(fuelType =>
    Queue.create({ stationId: station._id, fuelType })
  ));

  return station;
};

export const updateStation = async (stationId, adminId, data) => {
  const station = await Station.findById(stationId);
  if (!station) throw new AppError(404, 'Station not found');
  if (station.adminId.toString() !== adminId) throw new AppError(403, 'Forbidden');

  if (data.name) station.name = data.name;
  if (data.address) station.address = data.address;
  await station.save();
  return station;
};

export const getStation = async (stationId) => {
  const station = await Station.findById(stationId);
  if (!station) throw new AppError(404, 'Station not found');

  const queues = await Queue.find({ stationId: station._id });
  const queueSummary = queues.map(q => ({
    fuelType: q.fuelType,
    isPaused: q.isPaused,
    fuelAvailable: q.fuelAvailable,
    queueLength: q.counter,
    estimatedWaitMinutes: calculateEWT(q.counter + 1, q.serveTimeMinutes),
  }));

  return { ...station.toObject(), queues: queueSummary };
};

export const listStations = async ({ lat, lng, radiusKm }) => {
  let stations;
  const radius = (radiusKm || config.defaultRadiusKm) * 1000;

  if (lat && lng) {
    stations = await Station.find({
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radius,
        },
      },
    });
  } else {
    stations = await Station.find().sort({ name: 1 });
  }

  const result = await Promise.all(stations.map(async (station) => {
    const queues = await Queue.find({ stationId: station._id });
    const queueSummary = queues.map(q => ({
      fuelType: q.fuelType,
      isPaused: q.isPaused,
      fuelAvailable: q.fuelAvailable,
      queueLength: q.counter,
      estimatedWaitMinutes: calculateEWT(q.counter + 1, q.serveTimeMinutes),
    }));
    const allUnavailable = queueSummary.every(q => !q.fuelAvailable);
    return { ...station.toObject(), queues: queueSummary, allUnavailable };
  }));

  // available stations first
  return result.sort((a, b) => a.allUnavailable - b.allUnavailable);
};

export const getRecommendations = async ({ lat, lng, fuelType }) => {
  const { recommendationW1: w1, recommendationW2: w2, recommendationW3: w3, recommendationW4: w4 } = config;

  const stations = await Station.find();

  const scored = await Promise.all(stations.map(async (station) => {
    const queueFilter = { stationId: station._id };
    if (fuelType) queueFilter.fuelType = fuelType;

    const queues = await Queue.find({ ...queueFilter, fuelAvailable: true, isPaused: false });
    if (queues.length === 0) return null;

    let distanceKm = 1;
    if (lat && lng && station.location?.coordinates) {
      const dx = station.location.coordinates[0] - parseFloat(lng);
      const dy = station.location.coordinates[1] - parseFloat(lat);
      distanceKm = Math.sqrt(dx * dx + dy * dy) * 111 || 0.001;
    }

    const bestQueue = queues.reduce((best, q) => q.counter < best.counter ? q : best, queues[0]);
    const queueLength = bestQueue.counter || 0;
    const ewt = calculateEWT(queueLength + 1, bestQueue.serveTimeMinutes);

    const score =
      (w1 / (queueLength || 0.001)) +
      (w2 / (ewt || 0.001)) +
      (w3 * 1) +
      (w4 / distanceKm);

    return { station, score, queueLength, estimatedWaitMinutes: ewt, distanceKm };
  }));

  return scored
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
};
