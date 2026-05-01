import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { errorHandler } from './middleware/errorHandler.js';

// Existing routes
import authRoutes from './routes/auth.routes.js';
import stationRoutes from './routes/station.routes.js';
import queueUserRoutes from './routes/queue.user.routes.js';
import queueAdminRoutes from './routes/queue.admin.routes.js';
import tokenRoutes from './routes/token.routes.js';

// New routes
import aiRoutes from './routes/ai.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import alertRoutes from './routes/alert.routes.js';

const app = express();
const httpServer = createServer(app);

// ─── Socket.IO setup ─────────────────────────────────────────────────────────
export const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  path: '/socket.io',
});

io.on('connection', (socket) => {
  // Client joins a room for a specific station queue
  socket.on('join-station', (stationId) => {
    socket.join(`station:${stationId}`);
  });

  socket.on('leave-station', (stationId) => {
    socket.leave(`station:${stationId}`);
  });

  // Client joins their personal user room for alerts
  socket.on('join-user', (userId) => {
    socket.join(`user:${userId}`);
  });
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', websocket: true });
});

// ─── Existing API routes ──────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stations', stationRoutes);

// User queue routes MUST come before admin queue routes.
// The admin router is mounted at /api/v1/stations/:id/queues/:fuelType and
// would otherwise intercept /join and /leave before the user router sees them.
app.use('/api/v1', queueUserRoutes);
app.use('/api/v1/queue', queueUserRoutes);
app.use('/api/v1/stations/:id/queues/:fuelType', queueAdminRoutes);

app.use('/api/v1/tokens', tokenRoutes);

// ─── New API routes ───────────────────────────────────────────────────────────
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/alerts', alertRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

export { httpServer };
export default app;
