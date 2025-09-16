const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Expecting header like: Authorization: Bearer <token>
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach decoded payload (usually user id, email, etc.)
    req.user = decoded;

    next(); // continue to route handler
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

//This is the authentication middleware for USERS login