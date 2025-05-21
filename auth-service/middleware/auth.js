// auth-service/middleware/auth.js

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid Token." });
  }
};