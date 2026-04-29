import * as stationService from '../services/station.service.js';

export const createStation = async (req, res, next) => {
  try {
    const station = await stationService.createStation(req.user.id, req.body);
    res.status(201).json(station);
  } catch (error) {
    next(error);
  }
};

export const updateStation = async (req, res, next) => {
  try {
    const station = await stationService.updateStation(req.params.id, req.user.id, req.body);
    res.status(200).json(station);
  } catch (error) {
    next(error);
  }
};

export const getStation = async (req, res, next) => {
  try {
    const station = await stationService.getStation(req.params.id);
    res.status(200).json(station);
  } catch (error) {
    next(error);
  }
};

export const listStations = async (req, res, next) => {
  try {
    const { lat, lng, radius_km } = req.query;
    const stations = await stationService.listStations({ lat, lng, radiusKm: radius_km });
    res.status(200).json(stations);
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const { lat, lng, fuelType } = req.query;
    const result = await stationService.getRecommendations({ lat, lng, fuelType });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
