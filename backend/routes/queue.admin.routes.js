import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import {
  getQueueList,
  pauseQueue,
  resumeQueue,
  setFuelAvailability,
  setServeTime,
  serveUser,
  removeNoShow,
} from '../controllers/queue.admin.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate, requireRole('station_admin'));

router.get('/', getQueueList);
router.post('/pause', pauseQueue);
router.post('/resume', resumeQueue);
router.patch('/availability', setFuelAvailability);
router.patch('/serve-time', setServeTime);
router.post('/entries/:entryId/serve', serveUser);
router.post('/entries/:entryId/no-show', removeNoShow);

export default router;
