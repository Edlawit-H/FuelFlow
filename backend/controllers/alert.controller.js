import * as alertService from '../services/alert.service.js';

export const getMyAlerts = async (req, res, next) => {
  try {
    const alerts = await alertService.getUserAlerts(req.user.id);
    res.status(200).json(alerts);
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await alertService.markAllRead(req.user.id);
    res.status(200).json({ message: 'All alerts marked as read' });
  } catch (error) {
    next(error);
  }
};

export const markOneRead = async (req, res, next) => {
  try {
    await alertService.markOneRead(req.user.id, req.params.id);
    res.status(200).json({ message: 'Alert marked as read' });
  } catch (error) {
    next(error);
  }
};
