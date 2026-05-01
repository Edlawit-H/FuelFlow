import mongoose from 'mongoose';
import config from './config.js';

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 10000, // 10s to find a server
      socketTimeoutMS: 45000,          // 45s socket idle timeout
      maxPoolSize: 10,
      retryWrites: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Don't exit — nodemon will restart if needed, but a transient
    // Atlas drop should not kill the whole process in production.
    // Re-throw so startServer knows the initial connect failed.
    throw error;
  }
};

// Log connection lifecycle events so we can see drops in the console
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected — Mongoose will auto-reconnect');
});
mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});

export default connectDB;
