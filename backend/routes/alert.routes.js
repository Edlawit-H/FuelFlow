import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { getMyAlerts, markAllRead, markOneRead } from '../controllers/alert.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', getMyAlerts);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markOneRead);

export default router;
