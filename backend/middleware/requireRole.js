import { AppError } from './errorHandler.js';

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Unauthorized'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, `Forbidden — required: ${roles.join(' or ')}`));
    }
    next();
  };
};

export default requireRole;
