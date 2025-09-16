const jwt = require("jsonwebtoken");

function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: "No token provided. Admin login required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET); // use SESSION_SECRET for admins
    req.admin = decoded; // attach decoded payload to request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = adminAuth;
