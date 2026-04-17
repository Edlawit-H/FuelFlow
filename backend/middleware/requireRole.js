import { AppError } from './errorHandler.js';

/**
 * Role guard middleware factory.
 * Usage: requireRole('station_admin') or requireRole('user', 'station_admin')
 *
 * @param {...string} roles - One or more allowed roles
 * @returns Express middleware that blocks requests from users without the required role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    // authenticate middleware must run before requireRole
    if (!req.user) {
      return next(new AppError(401, 'Unauthorized — no user on request'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          `Forbidden — required role: ${roles.join(' or ')}, your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

export default requireRole;
