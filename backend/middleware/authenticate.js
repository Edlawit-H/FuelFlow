import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { AppError } from './errorHandler.js';

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError(401, 'No token provided'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = { id: decoded.id, role: decoded.role };
    next();

  } catch (error) {
    return next(new AppError(401, 'Invalid or expired token'));
  }
};

export default authenticate;