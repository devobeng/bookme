import mongoose from 'mongoose';
import { mongoUri } from './env.js';

const connectDB = async (): Promise<void> => {
  const connect = async () => {
    try {
      await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error: any) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connect, 5000);
    }
  };

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected!');
  });

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected!');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
  });

  await connect();
};

export default connectDB;
