import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const URL = process.env.MONGODB_URI;

const connection = async () => {
  if (!URL) {
    throw new Error("MONGODB_URI is not set. Add it to server/.env");
  }
  try {
    await mongoose.connect(URL);
    console.log("Database connected");
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default connection;
