import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/nexplus_coder';

async function dbConnect() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    return mongoose.connect(MONGODB_URI, {
      bufferCommands: true,
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect; 