import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import config from './config/config.js';
import { init as initRealtime } from './services/realtime.service.js';

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Create HTTP server from Express app
  const server = http.createServer(app);

  // Attach Socket.IO to HTTP server
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Initialize real-time service with Socket.IO instance
  initRealtime(io);

  // Start listening
  server.listen(config.port, () => {
    console.log(`FuelFlow server running on port ${config.port}`);
  });
};

startServer();
