import mongoose from 'mongoose';

export const connectMongoDB = async () => {

    try{
        await mongoose.connect(process.env.MONGODB_URI,{
            serverSelectionTimeoutMS: 30000, // 30 seconds
            connectTimeoutMS: 10000,         // 10 seconds
            socketTimeoutMS: 60000,          // 1 minute
            heartbeatFrequencyMS: 10000,     // 10 seconds
        });
        console.log(">>> Connected to MongoDB successfully!");
    }catch(error){
        console.log("Error while connecting to MongoDB", error);
        console.error("Stack trace:", error.stack);
        process.exit(1); // Exit the process if connection fails
    }
};