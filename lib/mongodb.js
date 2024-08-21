import mongoose from 'mongoose';

export const connectMongoDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) return; // If already connected, do nothing
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            connectTimeoutMS: 10000,         // 10 seconds
            socketTimeoutMS: 60000,          // 1 minute
            heartbeatFrequencyMS: 10000,     // 10 seconds
        });
        console.log(">>> Connected to MongoDB successfully!");
    } catch (error) {
        console.error("Error while connecting to MongoDB", error);
        process.exit(1); // Exit process if connection fails
    }
};
