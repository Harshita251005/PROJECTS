import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  getUserProfile,
  listAppointment,
  loginUser,
  makePayment,
  registerUser,
  updateUserProfile,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";
import { registerLimiter, loginLimiter } from "../middlewares/rateLimiter.js";

const userRouter = express.Router();

// Public routes (with rate limiting)
userRouter.post("/register", registerLimiter, registerUser);
userRouter.post("/login", loginLimiter, loginUser);

// Protected routes
userRouter.get("/get-profile", authUser, getUserProfile);

// ✅ FIXED ORDER for update profile
userRouter.post(
  "/update-profile",
  upload.single("image"),  // first multer
  authUser,                // then auth
  updateUserProfile
);

userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/make-payment", authUser, makePayment);

export default userRouter;
