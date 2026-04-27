import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import QueueEntry from '../models/QueueEntry.js';
import { AppError } from '../middleware/errorHandler.js';
import config from '../config/config.js';

export const register = async ({ phone, password, role = 'user' }) => {
  const existing = await User.findOne({ phone });
  if (existing) throw new AppError(409, 'Phone already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ phone, passwordHash, role });
  return { id: user._id, phone: user.phone, role: user.role };
};

export const login = async ({ phone, password }) => {
  const user = await User.findOne({ phone });
  if (!user) throw new AppError(401, 'Invalid phone or password');

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new AppError(401, 'Invalid phone or password');

  const token = jwt.sign(
    { id: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  return { token };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw new AppError(404, 'User not found');
  return { id: user._id, phone: user.phone, email: user.email, role: user.role };
};

export const updateMe = async (userId, { phone, email, password }) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');

  if (phone !== undefined) {
    if (!phone.trim()) throw new AppError(400, 'Phone cannot be empty');
    user.phone = phone.trim();
  }
  if (email !== undefined) user.email = email.trim() || undefined;
  if (password) user.passwordHash = await bcrypt.hash(password, 10);

  await user.save();
  return { id: user._id, phone: user.phone, email: user.email, role: user.role };
};

export const deleteMe = async (userId) => {
  const activeEntry = await QueueEntry.findOne({ userId, status: 'active' });
  if (activeEntry) throw new AppError(400, 'Leave your queue before deleting your account');

  await User.findByIdAndDelete(userId);
};
