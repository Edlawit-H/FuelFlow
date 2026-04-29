import * as tokenService from '../services/token.service.js';

export const validateToken = async (req, res, next) => {
  try {
    const { pinCode, stationId } = req.body;
    const result = await tokenService.validateToken(pinCode, stationId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
