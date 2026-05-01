import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import {
  getStationAnalytics,
  getGlobalAnalytics,
  getPeakHours,
} from '../controllers/analytics.controller.js';

const router = Router();

router.use(authenticate);

// Station admin can view their own station analytics
router.get('/stations/:stationId', requireRole('station_admin'), getStationAnalytics);
router.get('/stations/:stationId/fuel/:fuelType/peak-hours', requireRole('station_admin'), getPeakHours);

// Global analytics — accessible to all admins
router.get('/global', requireRole('station_admin'), getGlobalAnalytics);

export default router;
