import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import fs from "fs";
import path from "path";

// app config
const app = express();
const port = process.env.PORT || 8000;
connectDB();
connectCloudinary();

// ensure uploads directory exists for multer
try {
  const uploadDir = path.join(process.cwd(), "backend", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Created uploads directory:", uploadDir);
  }
} catch (err) {
  console.warn("Could not create uploads dir:", err.message);
}

// middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  // include both lowercase and camelCase token header names used by frontend
  allowedHeaders: ["Content-Type", "Authorization", "atoken", "aToken", "dtoken"],
};
app.use(cors(corsOptions));

// api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

// global error handler (to return JSON for multer or other errors)
app.use((err, req, res, next) => {
  console.error("Global error handler:", err && err.message ? err.message : err);
  if (err.name === "MulterError" || err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: err.message || "File upload error" });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
});

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
