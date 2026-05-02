import { httpServer } from './app.js';
import connectDB from './config/db.js';
import config from './config/config.js';
import { runNoShowDetection } from './services/queue.service.js';
import { runSmartAlerts } from './services/alert.service.js';
import { expireReservations } from './services/reservation.service.js';

const startServer = async (retries = 5) => {
  try {
    await connectDB();
  } catch (err) {
    if (retries > 0) {
      console.warn(`DB connect failed, retrying in 3s… (${retries} attempts left)`);
      await new Promise((r) => setTimeout(r, 3000));
      return startServer(retries - 1);
    }
    console.error('Could not connect to MongoDB after retries. Exiting.');
    process.exit(1);
  }

  // Background jobs — all wrapped so a crash in one doesn't kill the server
  try { runNoShowDetection(); } catch { /* non-critical */ }
  try { runSmartAlerts(); }     catch { /* non-critical */ }

  setInterval(async () => {
    try { await expireReservations(); } catch { /* non-critical */ }
  }, 5 * 60 * 1000);

  httpServer.listen(config.port, () => {
    console.log(`FuelFlow server running on port ${config.port} (WebSocket enabled)`);
  });
};

startServer();

