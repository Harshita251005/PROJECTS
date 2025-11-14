import express from "express";
import {
  addDoctor,
  adminDashboard,
  appointmentCancelAdmin,
  appointmentsAdmin,
  getAllDoctors,
  loginAdmin,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";
import { loginLimiter, uploadLimiter } from "../middlewares/rateLimiter.js";

const adminRouter = express.Router();

// Route to add a doctor (with upload limiter)
adminRouter.post("/add-doctor", authAdmin, uploadLimiter, upload.single("image"), addDoctor);
adminRouter.post("/login", loginLimiter, loginAdmin);
adminRouter.get("/all-doctors", authAdmin, getAllDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancelAdmin);
adminRouter.get("/dashboard", authAdmin, adminDashboard);

export default adminRouter;
