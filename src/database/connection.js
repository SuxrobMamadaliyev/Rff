// -----------------------------------------------------------------------------
// MongoDB connection handling via Mongoose.
// -----------------------------------------------------------------------------
import mongoose from 'mongoose';
import config from '../config/index.js';
import logger from '../utils/logger.js';

mongoose.set('strictQuery', true);

/**
 * Establish the MongoDB connection. Resolves once connected, throws on failure.
 * @returns {Promise<typeof mongoose>}
 */
export const connectDatabase = async () => {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error', err));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(config.db.uri, {
    serverSelectionTimeoutMS: 10000,
  });

  return mongoose;
};

/**
 * Gracefully close the MongoDB connection (used on shutdown).
 * @returns {Promise<void>}
 */
export const disconnectDatabase = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};

export default connectDatabase;
