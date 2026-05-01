/**
 * Analytics Service
 * Records and retrieves station performance data.
 */

import StationAnalytics from '../models/StationAnalytics.js';
import QueueEntry from '../models/QueueEntry.js';
import Queue from '../models/Queue.js';
import Station from '../models/Station.js';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function dateStr(d) {
  return new Date(d).toISOString().slice(0, 10);
}

// ─── Record a join event ─────────────────────────────────────────────────────

export const recordJoin = async (stationId, fuelType, waitMinutes = 0) => {
  try {
    const date = todayStr();
    const hour = new Date().getHours();

    await StationAnalytics.findOneAndUpdate(
      { stationId, fuelType, date },
      {
        $inc: {
          totalJoins: 1,
          [`hourlyJoins.${hour}`]: 1,
        },
        $set: { stationId, fuelType, date },
      },
      { upsert: true, new: true }
    );
  } catch { /* non-critical */ }
};

// ─── Record a serve event ────────────────────────────────────────────────────

export const recordServe = async (stationId, fuelType, waitMinutes = 0) => {
  try {
    const date = todayStr();
    const hour = new Date().getHours();

    const doc = await StationAnalytics.findOneAndUpdate(
      { stationId, fuelType, date },
      {
        $inc: {
          totalServed: 1,
          [`hourlyServed.${hour}`]: 1,
        },
        $set: { stationId, fuelType, date },
      },
      { upsert: true, new: true }
    );

    // Recalculate avgWaitMinutes
    if (doc && waitMinutes > 0) {
      const newAvg = doc.avgWaitMinutes
        ? (doc.avgWaitMinutes * (doc.totalServed - 1) + waitMinutes) / doc.totalServed
        : waitMinutes;
      await StationAnalytics.updateOne(
        { stationId, fuelType, date },
        { $set: { avgWaitMinutes: Math.round(newAvg) } }
      );
    }

    // Update peak hour and congestion
    await updatePeakAndCongestion(stationId, fuelType, date);
  } catch { /* non-critical */ }
};

// ─── Record a no-show event ──────────────────────────────────────────────────

export const recordNoShow = async (stationId, fuelType) => {
  try {
    const date = todayStr();
    await StationAnalytics.findOneAndUpdate(
      { stationId, fuelType, date },
      { $inc: { totalNoShows: 1 }, $set: { stationId, fuelType, date } },
      { upsert: true }
    );
  } catch { /* non-critical */ }
};

// ─── Update peak hour and congestion level ───────────────────────────────────

async function updatePeakAndCongestion(stationId, fuelType, date) {
  try {
    const doc = await StationAnalytics.findOne({ stationId, fuelType, date });
    if (!doc) return;

    const peakHour = doc.hourlyJoins.indexOf(Math.max(...doc.hourlyJoins));
    const totalToday = doc.totalJoins;
    const congestionLevel =
      totalToday > 80 ? 'high' : totalToday > 30 ? 'medium' : 'low';

    await StationAnalytics.updateOne(
      { stationId, fuelType, date },
      { $set: { peakHour, congestionLevel } }
    );
  } catch { /* non-critical */ }
}

// ─── Get station analytics (admin) ──────────────────────────────────────────

export const getStationAnalytics = async (stationId, days = 7) => {
  try {
    const records = await StationAnalytics.find({ stationId })
      .sort({ date: -1 })
      .limit(days * 2); // up to 2 fuel types per day

    return records;
  } catch {
    return [];
  }
};

// ─── Get global analytics (super admin / multi-station overview) ─────────────

export const getGlobalAnalytics = async (days = 7) => {
  try {
    const stations = await Station.find().select('_id name');
    const result = [];

    for (const station of stations) {
      const records = await StationAnalytics.find({ stationId: station._id })
        .sort({ date: -1 })
        .limit(days * 2);

      const totalJoins = records.reduce((s, r) => s + r.totalJoins, 0);
      const totalServed = records.reduce((s, r) => s + r.totalServed, 0);
      const avgWait =
        records.length > 0
          ? Math.round(records.reduce((s, r) => s + r.avgWaitMinutes, 0) / records.length)
          : 0;

      // Peak hour across all records
      const combinedHourly = new Array(24).fill(0);
      records.forEach((r) => r.hourlyJoins.forEach((v, i) => { combinedHourly[i] += v; }));
      const peakHour = combinedHourly.indexOf(Math.max(...combinedHourly));

      result.push({
        stationId: station._id,
        stationName: station.name,
        totalJoins,
        totalServed,
        avgWaitMinutes: avgWait,
        peakHour,
        efficiency: totalJoins > 0 ? Math.round((totalServed / totalJoins) * 100) : 0,
        hourlyTrend: combinedHourly,
      });
    }

    return result.sort((a, b) => b.totalJoins - a.totalJoins);
  } catch {
    return [];
  }
};

// ─── Get peak hours for a station ───────────────────────────────────────────

export const getPeakHours = async (stationId, fuelType, days = 7) => {
  try {
    const records = await StationAnalytics.find({ stationId, fuelType })
      .sort({ date: -1 })
      .limit(days);

    if (records.length === 0) return [];

    const combined = new Array(24).fill(0);
    records.forEach((r) => r.hourlyJoins.forEach((v, i) => { combined[i] += v; }));

    return combined.map((count, hour) => ({ hour, avgJoins: Math.round(count / records.length) }));
  } catch {
    return [];
  }
};
