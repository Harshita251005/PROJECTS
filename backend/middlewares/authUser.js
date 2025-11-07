import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    // ✅ Extract token from "Authorization" header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Token missing or invalid" });
    }

    // ✅ Remove "Bearer " prefix and get the token
    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user info to request object
    req.user = { userId: decoded.id };

    next(); // Continue to controller
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};

export default authUser;
