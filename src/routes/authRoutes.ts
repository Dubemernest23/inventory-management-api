import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  getAllUsers
} from '../controllers/authController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation';
import { UserRole } from '../types';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.get('/users', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), getAllUsers);

export default router;
