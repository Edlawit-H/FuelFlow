import express from 'express';
import {
  register,
  login,
  me,
  registerAdmin,
  updateMe,
  deleteMe
} from '../controllers/auth.controller.js';

import authenticate from '../middleware/authenticate.js';

const router = express.Router();

/* ---------------- AUTH ROUTES ---------------- */
router.post('/register', register);
router.post('/login', login);
router.post('/register-admin', registerAdmin);

/* ---------------- PROTECTED ROUTE ---------------- */
router.get('/me', authenticate, me);
router.patch('/me', authenticate, updateMe);
router.delete('/me', authenticate, deleteMe);

export default router;