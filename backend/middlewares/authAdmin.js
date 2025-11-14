import jwt from "jsonwebtoken";

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
  try {
    // Extract token from multiple possible header locations
    const headerToken =
      // standard lowercased header (node normalizes header names)
      req.headers["atoken"] ||
      // in case frontend used camelCase header name
      req.headers["aToken"] ||
      // Authorization: Bearer <token>
      (req.headers["authorization"] || "").split(" ")[1];

    if (!headerToken) {
      console.warn("authAdmin: token missing in headers", Object.keys(req.headers));
      return res.status(401).json({ success: false, message: "Token is Missing!" });
    }

    // Verify the token
    let tokenDecode;
    try {
      tokenDecode = jwt.verify(headerToken, process.env.JWT_SECRET);
    } catch (verifyErr) {
      console.warn("authAdmin: token verification failed", verifyErr.message);
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Verify admin credentials - check the role and email
    if (tokenDecode.role !== "admin" || tokenDecode.email !== process.env.ADMIN_EMAIL) {
      console.warn("authAdmin: token decoded but not authorized", tokenDecode);
      return res.status(401).json({ success: false, message: "Not Authorized, Try Again!" });
    }

    // attach decoded token to request for downstream use
    req.admin = tokenDecode;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    console.error("authAdmin error:", error.message);
    res.status(401).json({ success: false, message: "Unauthorized access" });
  }
};

export default authAdmin;

