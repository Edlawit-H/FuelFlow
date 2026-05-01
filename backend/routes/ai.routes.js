import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import {
  getSmartRecommendations,
  getFuelShortageRisk,
  getDemandForecast,
  estimateFuelConsumption,
  getTravelSuggestions,
  getCongestionLevel,
} from '../controllers/ai.controller.js';

const router = Router();

// All AI endpoints require authentication
router.use(authenticate);

router.get('/recommendations', getSmartRecommendations);
router.get('/travel-suggestions', getTravelSuggestions);
router.get('/fuel-consumption', estimateFuelConsumption);
router.get('/stations/:stationId/fuel/:fuelType/shortage-risk', getFuelShortageRisk);
router.get('/stations/:stationId/fuel/:fuelType/demand-forecast', getDemandForecast);
router.get('/stations/:stationId/fuel/:fuelType/congestion', getCongestionLevel);

export default router;
