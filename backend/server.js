import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import config from './config/config.js';

const startServer = async () => {
  await connectDB();
  const server = http.createServer(app);
  server.listen(config.port, () => {
    console.log(`FuelFlow server running on port ${config.port}`);
  });
};

startServer();
