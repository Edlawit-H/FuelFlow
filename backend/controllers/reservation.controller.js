import * as reservationService from '../services/reservation.service.js';

export const createReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.createReservation(req.user.id, req.body);
    res.status(201).json(reservation);
  } catch (error) {
    next(error);
  }
};

export const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await reservationService.getUserReservations(req.user.id);
    res.status(200).json(reservations);
  } catch (error) {
    next(error);
  }
};

export const cancelReservation = async (req, res, next) => {
  try {
    const result = await reservationService.cancelReservation(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlots = async (req, res, next) => {
  try {
    const { stationId, fuelType } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });
    const slots = await reservationService.getAvailableSlots(stationId, fuelType, date);
    res.status(200).json(slots);
  } catch (error) {
    next(error);
  }
};

export const getStationReservations = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { date } = req.query;
    const reservations = await reservationService.getStationReservations(stationId, date);
    res.status(200).json(reservations);
  } catch (error) {
    next(error);
  }
};
