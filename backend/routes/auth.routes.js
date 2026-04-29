import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import { register, login, registerAdmin, me, updateMe, deleteMe } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/register-admin', registerAdmin);
router.get('/me', authenticate, me);
router.patch('/me', authenticate, updateMe);
router.delete('/me', authenticate, deleteMe);

export default router;
