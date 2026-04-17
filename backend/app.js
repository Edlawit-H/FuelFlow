import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import stationRoutes from './routes/station.routes.js';
import queueUserRoutes from './routes/queue.user.routes.js';
import queueAdminRoutes from './routes/queue.admin.routes.js';
import tokenRoutes from './routes/token.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FuelFlow API is running' });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stations', stationRoutes);
app.use('/api/v1/stations/:id/queues/:fuelType', queueAdminRoutes);
app.use('/api/v1/stations', queueUserRoutes);
app.use('/api/v1/queue', queueUserRoutes);
app.use('/api/v1/tokens', tokenRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler — must be last
app.use(errorHandler);

export default app;
