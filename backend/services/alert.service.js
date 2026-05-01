/**
 * Alert Service
 * Creates and retrieves smart alerts for users.
 */

import Alert from '../models/Alert.js';
import QueueEntry from '../models/QueueEntry.js';
import Queue from '../models/Queue.js';
import config from '../config/config.js';

// ─── Create an alert ─────────────────────────────────────────────────────────

export const createAlert = async (userId, type, message, { stationId, fuelType } = {}) => {
  try {
    // Avoid duplicate unread alerts of the same type for the same user
    const existing = await Alert.findOne({ userId, type, read: false, stationId });
    if (existing) return existing;

    return await Alert.create({ userId, type, message, stationId, fuelType });
  } catch {
    return null;
  }
};

// ─── Get user alerts ─────────────────────────────────────────────────────────

export const getUserAlerts = async (userId, limit = 20) => {
  return Alert.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('stationId', 'name');
};

// ─── Mark alerts as read ─────────────────────────────────────────────────────

export const markAllRead = async (userId) => {
  await Alert.updateMany({ userId, read: false }, { $set: { read: true } });
};

export const markOneRead = async (userId, alertId) => {
  await Alert.findOneAndUpdate({ _id: alertId, userId }, { $set: { read: true } });
};

// ─── Smart alert generation (run periodically) ───────────────────────────────

export const runSmartAlerts = () => {
  const threshold = config.notificationThreshold || 3;

  setInterval(async () => {
    try {
      // Find all active queue entries
      const entries = await QueueEntry.find({ status: 'active' }).populate('stationId');

      for (const entry of entries) {
        const queue = await Queue.findById(entry.queueId);
        if (!queue) continue;

        // Alert: turn soon
        if (entry.position <= threshold) {
          await createAlert(
            entry.userId,
            'turn_soon',
            `Your turn is coming up! You are #${entry.position} in the queue at ${entry.stationId?.name || 'your station'}.`,
            { stationId: entry.stationId?._id, fuelType: entry.fuelType }
          );
        }

        // Alert: no-show warning
        if (entry.noShowEligible && entry.position === 1) {
          await createAlert(
            entry.userId,
            'no_show_warning',
            `You are at position #1 and may be marked as a no-show. Please proceed to the pump now.`,
            { stationId: entry.stationId?._id, fuelType: entry.fuelType }
          );
        }

        // Alert: queue paused
        if (queue.isPaused) {
          await createAlert(
            entry.userId,
            'queue_paused',
            `The queue at ${entry.stationId?.name || 'your station'} has been paused. Please wait.`,
            { stationId: entry.stationId?._id, fuelType: entry.fuelType }
          );
        }

        // Alert: leave now (EWT approaching, user should head to station)
        const ewt = entry.estimatedWaitMinutes || 0;
        if (ewt > 0 && ewt <= 10 && entry.position > 1) {
          await createAlert(
            entry.userId,
            'leave_now',
            `Leave now! Your estimated wait is only ${ewt} minutes at ${entry.stationId?.name || 'your station'}.`,
            { stationId: entry.stationId?._id, fuelType: entry.fuelType }
          );
        }
      }
    } catch { /* non-critical */ }
  }, 60000); // every minute
};
