import * as tokenService from '../services/token.service.js';


export const validateToken = async (req, res) => {
  try {
    const { pinCode, stationId } = req.body;
    
    const result = await tokenService.validateTokenLogic(pinCode, stationId);
    
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({ 
      message: error.message || "Server Error" 
    });
  }
};