// TODO: Dev 5
import { Router } from 'express';
const router = Router();
export default router;


import express from 'express';
import { validateToken } from '../controllers/token.controller.js';
import authenticate from '../middleware/authenticate.js'; // Dev 1 [cite: 12]
import requireRole from '../middleware/requireRole.js'; // Dev 1 [cite: 13]

const router = express.Router();

// Only station admins can validate tokens 
router.post(
  '/validate',
  authenticate,
  requireRole('station_admin'),
  validateToken
);

export default router;