import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import { validateToken } from '../controllers/token.controller.js';

const router = Router();

router.post('/validate', authenticate, requireRole('station_admin'), validateToken);

export default router;
