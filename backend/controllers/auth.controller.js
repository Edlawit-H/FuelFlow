import * as authService from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const registerAdmin = async (req, res, next) => {
  try {
    const result = await authService.register({ ...req.body, role: 'station_admin' });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const result = await authService.getMe(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const result = await authService.updateMe(req.user.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteMe = async (req, res, next) => {
  try {
    await authService.deleteMe(req.user.id);
    res.status(200).json({ message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
};
