import * as analyticsService from '../services/analytics.service.js';

export const getStationAnalytics = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { days } = req.query;
    const data = await analyticsService.getStationAnalytics(stationId, days ? parseInt(days) : 7);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getGlobalAnalytics = async (req, res, next) => {
  try {
    const { days } = req.query;
    const data = await analyticsService.getGlobalAnalytics(days ? parseInt(days) : 7);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getPeakHours = async (req, res, next) => {
  try {
    const { stationId, fuelType } = req.params;
    const { days } = req.query;
    const data = await analyticsService.getPeakHours(stationId, fuelType, days ? parseInt(days) : 7);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
