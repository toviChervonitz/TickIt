import mongoose from "mongoose";

const MONGO_URI = process.env.BD_CONNECT!;

export async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGO_URI);
}