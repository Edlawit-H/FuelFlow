import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import {
  createReservation,
  getMyReservations,
  cancelReservation,
  getAvailableSlots,
  getStationReservations,
} from '../controllers/reservation.controller.js';

const router = Router();

router.use(authenticate);

// User routes
router.post('/', createReservation);
router.get('/my', getMyReservations);
router.delete('/:id', cancelReservation);

// Slot availability — public (authenticated)
router.get('/slots/:stationId/:fuelType', getAvailableSlots);

// Admin route
router.get('/station/:stationId', requireRole('station_admin'), getStationReservations);

export default router;
