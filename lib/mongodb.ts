import mongoose from 'mongoose';

/**
 * Global connection cache to prevent multiple connections during development.
 * In Next.js, modules can be cached, but during hot reloads, new connections
 * may be attempted. This ensures we reuse the existing connection.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Uses connection caching to prevent multiple connections in development.
 *
 * @returns Promise resolving to the Mongoose instance
 * @throws Error if MONGODB_URI is not defined or connection fails
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return cached connection if it exists and is ready
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing promise if connection is in progress
  if (cached.promise) {
    return cached.promise;
  }

  // Validate MongoDB URI
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  // Create new connection promise
  const opts: mongoose.ConnectOptions = {
    bufferCommands: false, // Disable mongoose buffering
  };

  cached.promise = mongoose
    .connect(mongoUri, opts)
    .then((mongooseInstance) => {
      cached.conn = mongooseInstance;
      return mongooseInstance;
    })
    .catch((error) => {
      // Reset promise on error to allow retry
      cached.promise = null;
      throw error;
    });

  return cached.promise;
}

export default connectDB;
