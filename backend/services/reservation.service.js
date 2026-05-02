import Reservation from '../models/Reservation.js';
import Queue from '../models/Queue.js';
import Station from '../models/Station.js';
import { AppError } from '../middleware/errorHandler.js';
import crypto from 'crypto';

const SLOTS_PER_HOUR = 5; // max reservations per station/fuel/hour slot

// ─── Create a reservation ────────────────────────────────────────────────────

export const createReservation = async (userId, { stationId, fuelType, slotDate, slotHour }) => {
  // Validate station exists and offers this fuel type
  const station = await Station.findById(stationId);
  if (!station) throw new AppError(404, 'Station not found');
  if (!station.fuelTypes.includes(fuelType)) throw new AppError(400, 'Fuel type not offered at this station');

  // Check slot capacity
  const existing = await Reservation.countDocuments({
    stationId,
    fuelType,
    slotDate,
    slotHour,
    status: { $in: ['pending', 'confirmed'] },
  });

  if (existing >= SLOTS_PER_HOUR) {
    throw new AppError(409, `Slot full — max ${SLOTS_PER_HOUR} reservations per hour`);
  }

  // Check user doesn't already have a reservation for this slot
  const userConflict = await Reservation.findOne({
    userId,
    slotDate,
    slotHour,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (userConflict) throw new AppError(409, 'You already have a reservation in this time slot');

  // Set expiry to 30 minutes after the slot starts
  const slotStart = new Date(`${slotDate}T${String(slotHour).padStart(2, '0')}:00:00`);
  const expiresAt = new Date(slotStart.getTime() + 30 * 60 * 1000);

  const pinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  const reservation = await Reservation.create({
    userId,
    stationId,
    fuelType,
    slotDate,
    slotHour,
    status: 'confirmed',
    pinCode,
    expiresAt,
  });

  return reservation;
};

// ─── Get user's reservations ─────────────────────────────────────────────────

export const getUserReservations = async (userId) => {
  return Reservation.find({ userId, status: { $in: ['pending', 'confirmed'] } })
    .populate('stationId', 'name address')
    .sort({ slotDate: 1, slotHour: 1 });
};

// ─── Cancel a reservation ────────────────────────────────────────────────────

export const cancelReservation = async (userId, reservationId) => {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) throw new AppError(404, 'Reservation not found');
  if (reservation.userId.toString() !== userId) throw new AppError(403, 'Forbidden');
  if (!['pending', 'confirmed'].includes(reservation.status)) {
    throw new AppError(409, 'Reservation cannot be cancelled');
  }

  reservation.status = 'cancelled';
  await reservation.save();
  return { message: 'Reservation cancelled' };
};

// ─── Get available slots for a station/fuel/date ─────────────────────────────

export const getAvailableSlots = async (stationId, fuelType, date) => {
  const station = await Station.findById(stationId);
  if (!station) throw new AppError(404, 'Station not found');

  const booked = await Reservation.aggregate([
    {
      $match: {
        stationId: station._id,
        fuelType,
        slotDate: date,
        status: { $in: ['pending', 'confirmed'] },
      },
    },
    { $group: { _id: '$slotHour', count: { $sum: 1 } } },
  ]);

  const bookedMap = {};
  booked.forEach((b) => { bookedMap[b._id] = b.count; });

  const slots = [];
  for (let h = 6; h <= 22; h++) {
    const booked = bookedMap[h] || 0;
    slots.push({
      hour: h,
      label: `${String(h).padStart(2, '0')}:00`,
      available: SLOTS_PER_HOUR - booked,
      total: SLOTS_PER_HOUR,
      isFull: booked >= SLOTS_PER_HOUR,
    });
  }

  return slots;
};

// ─── Admin: get reservations for a station ───────────────────────────────────

export const getStationReservations = async (stationId, date) => {
  const filter = { stationId, status: { $in: ['pending', 'confirmed'] } };
  if (date) filter.slotDate = date;

  return Reservation.find(filter)
    .populate('userId', 'phone email')
    .sort({ slotDate: 1, slotHour: 1, createdAt: 1 });
};

// ─── Expire old reservations (run periodically) ──────────────────────────────

export const expireReservations = async () => {
  const now = new Date();
  const result = await Reservation.updateMany(
    { status: { $in: ['pending', 'confirmed'] }, expiresAt: { $lt: now } },
    { $set: { status: 'expired' } }
  );
  return result.modifiedCount;
};
