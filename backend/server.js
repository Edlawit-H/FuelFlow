import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import config from './config/config.js';
import { runNoShowDetection } from './services/queue.service.js';

runNoShowDetection();

const startServer = async () => {
  await connectDB();
  const server = http.createServer(app);
  server.listen(config.port, () => {
    console.log(`FuelFlow server running on port ${config.port}`);
  });
};

startServer();
