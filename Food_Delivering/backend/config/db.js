// backend/config/db.js
import mongoose from "mongoose";

export const connectDB = async () =>{
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/food-delivery";
  await mongoose.connect(uri).then(()=> console.log('DB connected'));
}
