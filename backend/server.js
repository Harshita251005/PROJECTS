import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

// app config
const app = express();
const port = process.env.PORT || 8000;
connectDB();
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors());

// api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

// default route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Harshita's Doctor Appointment Booking System API 🚀",
    status: "API is running successfully",
    frontend: "http://localhost:3000",
    admin_portal: "http://localhost:5173",
    portfolio: "https://harshitagoyal.vercel.app/",
    documentation: "http://localhost:8000/api-docs",
    developer: "Developed with ❤️ by Harshita Goyal",
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.listen(port, () => {
  console.log(`
  🚀 Doctor Appointment API is live!
  👩‍💻 Developed by: Harshita Goyal
  🌐 Running on: http://localhost:${port}
  `);
});
