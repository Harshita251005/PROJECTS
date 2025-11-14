import validator from "validator";

// Validate email format
export const validateEmail = (email) => {
  return validator.isEmail(email);
};

// Validate password strength
export const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true, message: "Password is strong" };
};

// Validate phone number
export const validatePhone = (phone) => {
  return validator.isMobilePhone(phone, "any", { strictMode: false });
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return validator.trim(validator.escape(input));
  }
  return input;
};

// Validate user registration input
export const validateUserRegistration = (name, email, password) => {
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push("Name is required");
  }
  if (name && name.length > 100) {
    errors.push("Name must be less than 100 characters");
  }

  if (!email || !validateEmail(email)) {
    errors.push("Valid email is required");
  }

  const passwordValidation = validatePassword(password || "");
  if (!passwordValidation.valid) {
    errors.push(passwordValidation.message);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Validate doctor data
export const validateDoctorData = (doctorData) => {
  const errors = [];

  if (!doctorData.name || doctorData.name.trim().length === 0) {
    errors.push("Doctor name is required");
  }
  if (!validateEmail(doctorData.email)) {
    errors.push("Valid email is required for doctor");
  }
  if (!doctorData.speciality || doctorData.speciality.trim().length === 0) {
    errors.push("Speciality is required");
  }
  if (!doctorData.degree || doctorData.degree.trim().length === 0) {
    errors.push("Degree is required");
  }
  if (!doctorData.experience || isNaN(doctorData.experience) || doctorData.experience < 0) {
    errors.push("Valid experience in years is required");
  }
  if (!doctorData.fees || isNaN(doctorData.fees) || doctorData.fees < 0) {
    errors.push("Valid fees amount is required");
  }
  if (!doctorData.address || typeof doctorData.address !== "object") {
    errors.push("Valid address is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Validate appointment booking
export const validateAppointmentBooking = (userId, docId, slotDate, slotTime) => {
  const errors = [];

  if (!userId || userId.trim().length === 0) {
    errors.push("User ID is required");
  }
  if (!docId || docId.trim().length === 0) {
    errors.push("Doctor ID is required");
  }
  if (!slotDate || slotDate.trim().length === 0) {
    errors.push("Slot date is required");
  }
  if (!slotTime || slotTime.trim().length === 0) {
    errors.push("Slot time is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
