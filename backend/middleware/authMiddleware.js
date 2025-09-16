const db = require("../config/db");

async function authMiddleware(req, res, next) {
  try {
    // Check if session exists
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No active session" });
    }

    // Optionally refresh session activity (if you want to track it in DB)
    // Example: update last_activity in your sessions table
    try {
      await db.query("UPDATE sessions SET last_activity=NOW() WHERE sid=?", [req.sessionID]);
    } catch (err) {
      console.warn("Could not update session activity:", err.message);
    }

    // Attach user object to request
    req.user = req.session.user;

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = authMiddleware;

//This is the authentication middleware for ADMINS login