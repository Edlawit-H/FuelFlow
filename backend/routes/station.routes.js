import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import {
  createStation,
  updateStation,
  getStation,
  listStations,
  getRecommendations,
} from '../controllers/station.controller.js';

const router = Router();

router.get('/recommendations', authenticate, getRecommendations);
router.get('/', authenticate, listStations);
router.get('/:id', authenticate, getStation);
router.post('/', authenticate, requireRole('station_admin'), createStation);
router.patch('/:id', authenticate, requireRole('station_admin'), updateStation);

export default router;
