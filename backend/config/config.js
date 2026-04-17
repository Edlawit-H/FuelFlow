import dotenv from 'dotenv';
dotenv.config();

const config = Object.freeze({
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  fcmServerKey: process.env.FCM_SERVER_KEY,

  // Queue defaults
  defaultServeTimeMinutes: Number(process.env.DEFAULT_SERVE_TIME_MINUTES) || 5,
  defaultTimeoutWindowMinutes: Number(process.env.DEFAULT_TIMEOUT_WINDOW_MINUTES) || 15,
  defaultRadiusKm: Number(process.env.DEFAULT_RADIUS_KM) || 10,
  notificationThreshold: Number(process.env.NOTIFICATION_THRESHOLD) || 3,

  // Recommendation engine weights
  recommendationW1: Number(process.env.RECOMMENDATION_W1) || 1,  // queue length weight
  recommendationW2: Number(process.env.RECOMMENDATION_W2) || 1,  // wait time weight
  recommendationW3: Number(process.env.RECOMMENDATION_W3) || 10, // availability weight
  recommendationW4: Number(process.env.RECOMMENDATION_W4) || 2,  // distance weight
});

export default config;
