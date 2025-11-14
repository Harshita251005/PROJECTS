import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

// API for adding doctor
const addDoctor = async (req, res) => {
  try {
    console.log("=== ADD DOCTOR REQUEST ===");
    console.log("Body:", req.body);
    console.log("File:", req.file);
    
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // checking for all data to add-doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address ||
      !imageFile
    ) {
      console.log("Missing fields:", {
        name: !name,
        email: !email,
        password: !password,
        speciality: !speciality,
        degree: !degree,
        experience: !experience,
        about: !about,
        fees: !fees,
        address: !address,
        imageFile: !imageFile,
      });
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email!" });
    }

    // validating password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long!",
      });
    }

    // hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload image to cloudinary
    let imageUrl;
    try {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      imageUrl = imageUpload.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image: " + uploadError.message,
      });
    }

    // create doctor object
    let parsedAddress;
    try {
      // Handle address parsing - it might be string or already object
      parsedAddress = typeof address === "string" ? JSON.parse(address) : address;
    } catch (parseError) {
      console.error("Address parsing error:", parseError);
      // If parsing fails, return error
      return res.status(400).json({
        success: false,
        message: "Address must be valid JSON format",
      });
    }

    const doctorData = {
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees: Number(fees),
      address: parsedAddress, // use parsed address
      image: imageUrl, // store the image URL
      date: Date.now(), // store the current date
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    console.log("✅ Doctor added successfully:", { name, email });

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
    });
  } catch (error) {
    console.error("❌ Error adding doctor:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check for duplicate email error
    if (error.code === 11000) {
      console.error("E11000 duplicate key error for:", error.keyValue);
      return res.status(400).json({
        success: false,
        message: `Doctor with email "${error.keyValue.email}" already exists`,
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add doctor. Please try again.",
    });
  }
};

// API for Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // checking for all data to login
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter email and password!" });
    }

    // Debug logging
    const envEmail = process.env.ADMIN_EMAIL || "NOT SET";
    const envPassword = process.env.ADMIN_PASSWORD || "NOT SET";
    
    console.log("=== ADMIN LOGIN ATTEMPT ===");
    console.log("Received Email:", email, "| Length:", email.length);
    console.log("Received Password:", password, "| Length:", password.length);
    console.log("Expected Email:", envEmail, "| Length:", envEmail.length);
    console.log("Expected Password:", envPassword, "| Length:", envPassword.length);
    console.log("Email Match:", email === envEmail);
    console.log("Password Match:", password === envPassword);
    console.log("============================");

    if (email === envEmail && password === envPassword) {
      console.log("✅ Admin login successful!");
      const token = jwt.sign(
        { role: "admin", email: email },
        process.env.JWT_SECRET
      );
      return res.status(200).json({
        success: true,
        token,
      });
    } else {
      console.log("❌ Credential mismatch!");
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API for getting all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({})
      .select("-password")
      .sort({ date: -1 });
    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API for appointment cancellation
const appointmentCancelAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    // cancel appointment
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    //releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId).select("-password");
    if (doctorData) {
      let slots_booked = doctorData.slots_booked;
      if (slots_booked[slotDate]) {
        slots_booked[slotDate] = slots_booked[slotDate].filter(
          (time) => time !== slotTime
        );

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
      }
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get dashboard data for admin dashboard
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      patients: users.length,
      appointments: appointments.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.status(200).json({
      success: true,
      dashData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  addDoctor,
  loginAdmin,
  getAllDoctors,
  appointmentsAdmin,
  appointmentCancelAdmin,
  adminDashboard,
};
