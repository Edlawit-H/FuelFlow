import express from 'express';
import * as controller from '../controllers/queue.user.controller.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router({ mergeParams: true });

// These are mounted at /api/v1 so paths are relative to that
// POST   /api/v1/stations/:id/queues/:fuelType/join
// DELETE /api/v1/stations/:id/queues/:fuelType/leave
// GET    /api/v1/queue/my-status

router.post(
  '/stations/:id/queues/:fuelType/join',
  authenticate,
  controller.joinQueue
);

router.delete(
  '/stations/:id/queues/:fuelType/leave',
  authenticate,
  controller.leaveQueue
);

router.get(
  '/my-status',
  authenticate,
  controller.getMyStatus
);

export default router;
