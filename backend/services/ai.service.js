/**
 * FuelFlow AI Service
 * Rule-based intelligence layer — no external ML dependencies.
 * All functions degrade gracefully if data is insufficient.
 */

import Queue from '../models/Queue.js';
import QueueEntry from '../models/QueueEntry.js';
import StationAnalytics from '../models/StationAnalytics.js';
import Station from '../models/Station.js';
import { calculateEWT } from '../utils/ewt.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function currentHour() {
  return new Date().getHours();
}

/**
 * Haversine distance in km between two [lng, lat] coordinate pairs.
 */
function haversineKm([lng1, lat1], [lng2, lat2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── 1. Dynamic EWT (enhanced) ──────────────────────────────────────────────

/**
 * Returns a dynamic EWT that factors in:
 *  - base formula (position * serveTime)
 *  - historical average for this hour
 *  - current congestion multiplier
 */
export const dynamicEWT = async (stationId, fuelType, position, serveTimeMinutes) => {
  const base = calculateEWT(position, serveTimeMinutes);

  try {
    const today = todayStr();
    const hour = currentHour();
    const analytics = await StationAnalytics.findOne({ stationId, fuelType, date: today });

    if (!analytics) return base;

    const historicalAvg = analytics.avgWaitMinutes || base;
    const congestionMultiplier =
      analytics.congestionLevel === 'high' ? 1.3
      : analytics.congestionLevel === 'medium' ? 1.1
      : 1.0;

    // Blend base with historical average
    const blended = base * 0.6 + historicalAvg * 0.4;
    return Math.round(blended * congestionMultiplier);
  } catch {
    return base;
  }
};

// ─── 2. Fuel Shortage Prediction ────────────────────────────────────────────

/**
 * Predicts whether a station will run out of fuel within the next N hours.
 * Rule: if the join rate in the last 2 hours is accelerating AND queue > threshold → HIGH risk.
 */
export const predictFuelShortage = async (stationId, fuelType) => {
  try {
    const today = todayStr();
    const hour = currentHour();
    const analytics = await StationAnalytics.findOne({ stationId, fuelType, date: today });

    const queue = await Queue.findOne({ stationId, fuelType });
    if (!queue) return { risk: 'unknown', message: 'No queue data' };

    const currentQueueLength = queue.counter;

    if (!analytics) {
      // No history — use queue length heuristic
      const risk = currentQueueLength > 20 ? 'high' : currentQueueLength > 10 ? 'medium' : 'low';
      return { risk, queueLength: currentQueueLength, message: `Queue length: ${currentQueueLength}` };
    }

    // Look at last 3 hours of joins
    const recentHours = [Math.max(0, hour - 2), Math.max(0, hour - 1), hour];
    const recentJoins = recentHours.reduce((sum, h) => sum + (analytics.hourlyJoins[h] || 0), 0);
    const avgJoinsPerHour = recentJoins / 3;

    // Trend: is it accelerating?
    const prev = analytics.hourlyJoins[Math.max(0, hour - 1)] || 0;
    const curr = analytics.hourlyJoins[hour] || 0;
    const accelerating = curr > prev * 1.2;

    let risk = 'low';
    if (currentQueueLength > 25 || (avgJoinsPerHour > 15 && accelerating)) risk = 'high';
    else if (currentQueueLength > 12 || avgJoinsPerHour > 8) risk = 'medium';

    return {
      risk,
      queueLength: currentQueueLength,
      avgJoinsPerHour: Math.round(avgJoinsPerHour),
      accelerating,
      message: `Risk: ${risk}. Avg ${Math.round(avgJoinsPerHour)} joins/hr.`,
    };
  } catch {
    return { risk: 'unknown', message: 'Prediction unavailable' };
  }
};

// ─── 3. Demand Forecasting ───────────────────────────────────────────────────

/**
 * Returns hourly demand forecast for the next 6 hours based on historical data.
 * Falls back to a simple sine-wave pattern if no history exists.
 */
export const forecastDemand = async (stationId, fuelType) => {
  const hour = currentHour();
  const forecast = [];

  try {
    // Get last 7 days of analytics for this station/fuel
    const records = await StationAnalytics.find({ stationId, fuelType })
      .sort({ date: -1 })
      .limit(7);

    for (let i = 0; i < 6; i++) {
      const targetHour = (hour + i) % 24;

      if (records.length === 0) {
        // Fallback: typical fuel demand curve (peaks at 7-9am and 5-7pm)
        const typical = [2, 1, 1, 1, 2, 4, 8, 12, 10, 8, 7, 8, 9, 8, 7, 8, 10, 12, 10, 8, 6, 5, 4, 3];
        forecast.push({ hour: targetHour, predictedJoins: typical[targetHour], confidence: 'low' });
      } else {
        const avgJoins =
          records.reduce((sum, r) => sum + (r.hourlyJoins[targetHour] || 0), 0) / records.length;
        forecast.push({
          hour: targetHour,
          predictedJoins: Math.round(avgJoins),
          confidence: records.length >= 5 ? 'high' : records.length >= 3 ? 'medium' : 'low',
        });
      }
    }
  } catch {
    for (let i = 0; i < 6; i++) {
      forecast.push({ hour: (hour + i) % 24, predictedJoins: 0, confidence: 'unavailable' });
    }
  }

  return forecast;
};

// ─── 4. Smart Station Recommendation ────────────────────────────────────────

/**
 * Enhanced recommendation engine:
 * Score = (1/distance) * W_dist + (1/queueLen) * W_queue + availability * W_avail + (1/ewt) * W_ewt
 * Also factors in predicted demand for the next hour.
 */
export const smartRecommend = async ({ lat, lng, fuelType, maxResults = 5 }) => {
  try {
    const stations = await Station.find();

    const scored = await Promise.all(
      stations.map(async (station) => {
        const queueFilter = { stationId: station._id };
        if (fuelType) queueFilter.fuelType = fuelType;

        const queues = await Queue.find({ ...queueFilter, fuelAvailable: true, isPaused: false });
        if (queues.length === 0) return null;

        let distanceKm = 5; // default if no coords
        if (lat && lng && station.location?.coordinates) {
          distanceKm = haversineKm(
            station.location.coordinates,
            [parseFloat(lng), parseFloat(lat)]
          ) || 0.1;
        }

        const bestQueue = queues.reduce((b, q) => (q.counter < b.counter ? q : b), queues[0]);
        const queueLength = bestQueue.counter || 0;
        const ewt = await dynamicEWT(station._id, bestQueue.fuelType, queueLength + 1, bestQueue.serveTimeMinutes);

        // Demand forecast — penalise stations predicted to get busy
        const forecast = await forecastDemand(station._id, bestQueue.fuelType);
        const nextHourDemand = forecast[1]?.predictedJoins || 0;
        const demandPenalty = nextHourDemand > 10 ? 0.8 : 1.0;

        const score =
          (3 / distanceKm) +
          (2 / (queueLength + 1)) +
          (5 / (ewt + 1)) * demandPenalty;

        return {
          station,
          score,
          queueLength,
          estimatedWaitMinutes: ewt,
          distanceKm: Math.round(distanceKm * 10) / 10,
          fuelType: bestQueue.fuelType,
          nextHourDemand,
        };
      })
    );

    return scored
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  } catch {
    return [];
  }
};

// ─── 5. Fuel Consumption Estimation ─────────────────────────────────────────

/**
 * Estimates fuel consumption for a trip.
 * vehicleType: 'car' | 'suv' | 'truck' | 'motorcycle'
 * distanceKm: trip distance
 * Returns litres needed and cost estimate.
 */
export const estimateFuelConsumption = ({ vehicleType = 'car', distanceKm, fuelPricePerLitre = 0 }) => {
  const consumptionRates = {
    motorcycle: 3.5,  // L/100km
    car: 8.0,
    suv: 12.0,
    truck: 18.0,
  };

  const rate = consumptionRates[vehicleType] || consumptionRates.car;
  const litresNeeded = (distanceKm * rate) / 100;
  const estimatedCost = litresNeeded * fuelPricePerLitre;

  return {
    vehicleType,
    distanceKm,
    litresNeeded: Math.round(litresNeeded * 10) / 10,
    consumptionRatePer100km: rate,
    estimatedCost: Math.round(estimatedCost * 100) / 100,
  };
};

// ─── 6. Smart Travel Suggestions ────────────────────────────────────────────

/**
 * Given origin coords and a list of stations, returns:
 *  - fuel-efficient route (closest station with fuel)
 *  - time-efficient route (station with shortest queue, even if farther)
 *  - carpool suggestion (if multiple users are heading to same station)
 */
export const travelSuggestions = async ({ lat, lng, fuelType }) => {
  try {
    const stations = await Station.find();
    const results = [];

    for (const station of stations) {
      const queues = await Queue.find({
        stationId: station._id,
        fuelAvailable: true,
        isPaused: false,
        ...(fuelType ? { fuelType } : {}),
      });

      if (queues.length === 0) continue;

      let distanceKm = 5;
      if (lat && lng && station.location?.coordinates) {
        distanceKm = haversineKm(station.location.coordinates, [parseFloat(lng), parseFloat(lat)]) || 0.1;
      }

      const bestQueue = queues.reduce((b, q) => (q.counter < b.counter ? q : b), queues[0]);
      const ewt = await dynamicEWT(station._id, bestQueue.fuelType, bestQueue.counter + 1, bestQueue.serveTimeMinutes);

      results.push({ station, distanceKm, ewt, queueLength: bestQueue.counter, fuelType: bestQueue.fuelType });
    }

    if (results.length === 0) return { fuelEfficient: null, timeEfficient: null, alternatives: [] };

    const fuelEfficient = [...results].sort((a, b) => a.distanceKm - b.distanceKm)[0];
    const timeEfficient = [...results].sort((a, b) => a.ewt - b.ewt)[0];

    // Alternative transport suggestion: if all queues > 20 min, suggest alternatives
    const minEWT = Math.min(...results.map((r) => r.ewt));
    const alternatives = minEWT > 20
      ? ['Consider public transport', 'Carpool with nearby drivers', 'Delay trip by 1-2 hours']
      : [];

    return {
      fuelEfficient: {
        stationId: fuelEfficient.station._id,
        stationName: fuelEfficient.station.name,
        distanceKm: fuelEfficient.distanceKm,
        ewt: fuelEfficient.ewt,
        reason: 'Closest station with available fuel',
      },
      timeEfficient: {
        stationId: timeEfficient.station._id,
        stationName: timeEfficient.station.name,
        distanceKm: timeEfficient.distanceKm,
        ewt: timeEfficient.ewt,
        reason: 'Shortest estimated wait time',
      },
      alternatives,
    };
  } catch {
    return { fuelEfficient: null, timeEfficient: null, alternatives: [] };
  }
};

// ─── 7. Congestion Level ─────────────────────────────────────────────────────

/**
 * Returns congestion level for a station/fuelType right now.
 */
export const getCongestionLevel = async (stationId, fuelType) => {
  try {
    const queue = await Queue.findOne({ stationId, fuelType });
    if (!queue) return 'unknown';

    const count = queue.counter;
    if (count >= 20) return 'high';
    if (count >= 8) return 'medium';
    return 'low';
  } catch {
    return 'unknown';
  }
};
