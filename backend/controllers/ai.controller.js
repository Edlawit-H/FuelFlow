import * as aiService from '../services/ai.service.js';

export const getSmartRecommendations = async (req, res, next) => {
  try {
    const { lat, lng, fuelType, maxResults } = req.query;
    const results = await aiService.smartRecommend({
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      fuelType,
      maxResults: maxResults ? parseInt(maxResults) : 5,
    });
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

export const getFuelShortageRisk = async (req, res, next) => {
  try {
    const { stationId, fuelType } = req.params;
    const result = await aiService.predictFuelShortage(stationId, fuelType);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getDemandForecast = async (req, res, next) => {
  try {
    const { stationId, fuelType } = req.params;
    const result = await aiService.forecastDemand(stationId, fuelType);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const estimateFuelConsumption = async (req, res, next) => {
  try {
    const { vehicleType, distanceKm, fuelPricePerLitre } = req.query;
    if (!distanceKm) {
      return res.status(400).json({ error: 'distanceKm is required' });
    }
    const result = aiService.estimateFuelConsumption({
      vehicleType,
      distanceKm: parseFloat(distanceKm),
      fuelPricePerLitre: fuelPricePerLitre ? parseFloat(fuelPricePerLitre) : 0,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getTravelSuggestions = async (req, res, next) => {
  try {
    const { lat, lng, fuelType } = req.query;
    const result = await aiService.travelSuggestions({
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      fuelType,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCongestionLevel = async (req, res, next) => {
  try {
    const { stationId, fuelType } = req.params;
    const level = await aiService.getCongestionLevel(stationId, fuelType);
    res.status(200).json({ stationId, fuelType, congestionLevel: level });
  } catch (error) {
    next(error);
  }
};
