import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import stationRoutes from './routes/station.routes.js';
import queueUserRoutes from './routes/queue.user.routes.js';
import queueAdminRoutes from './routes/queue.admin.routes.js';
import tokenRoutes from './routes/token.routes.js';
import queueRoutes from "./routes/station.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stations', stationRoutes);
app.use('/api/v1/stations/:id/queues/:fuelType', queueAdminRoutes);
app.use('/api/v1/stations', queueUserRoutes);
app.use('/api/v1/queue', queueUserRoutes);
app.use('/api/v1/tokens', tokenRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);
app.use("/api/queue", queueRoutes);



export default app;
