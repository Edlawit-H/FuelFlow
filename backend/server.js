import dotenv from 'dotenv';
dotenv.config();
console.log("MONGODB:", process.env.MONGODB_URI);

import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import config from './config/config.js';
const startServer = async () => {
  try {
    console.log("Connecting DB...");
    await connectDB();

    console.log("DB connected");

    const server = http.createServer(app);

    server.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });

  } catch (err) {
    console.error("Startup error:", err);
  }
};

startServer();