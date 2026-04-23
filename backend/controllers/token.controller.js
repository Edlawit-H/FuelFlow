
import * as tokenService from '../services/token.service.js';

export const validateToken = async (req, res) => {
  try {
    const { tokenId } = req.body;
    // req.user.stationId is attached by Dev 1's authenticate middleware [cite: 12]
    const adminStationId = req.user.stationId; 

    const validatedToken = await tokenService.validateToken(tokenId, adminStationId);

    res.status(200).json({
      status: 'success',
      data: {
        position: validatedToken.queueEntryId.position,
        joinedAt: validatedToken.issuedAt,
        fuelType: validatedToken.fuelType
      }
    });
  } catch (error) {
    res.status(400).json({ 
      status: 'fail', 
      message: error.message 
    });
  }
};