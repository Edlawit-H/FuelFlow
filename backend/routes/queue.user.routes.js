// TODO: Dev 4
//import { Router } from 'express';
//const router = Router();
//export default router;


import express from "express";
import * as controller from "../controllers/queue.user.controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post(
  "/stations/:id/queues/:fuelType/join",
  authenticate,
  controller.joinQueue
);

router.delete(
  "/stations/:id/queues/:fuelType/leave",
  authenticate,
  controller.leaveQueue
);

router.get(
  "/queue/my-status",
  authenticate,
  controller.getMyStatus
);

export default router;





