import express from 'express';
import { validateToken } from '../controllers/token.controller.js';
const router = express.Router();

router.post('/validate', validateToken);

export default router;