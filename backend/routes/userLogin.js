const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Members = require("../models/members");
require("dotenv").config();

// POST /api/login
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const member = await Members.findOne({ where: { email } });
    if (!member) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // 2. Check if verified
    if (!member.is_verified) {
      return res.status(400).json({ success: false, message: "Please verify your email first" });
    }

    // 3. Compare password
    const match = await bcrypt.compare(password, member.password);
    if (!match) {
      return res.status(400).json({ success: false, message: "Incorrect password" });
    }

    // 4. Generate JWT (expires in 7 days)
    const token = jwt.sign(
      { id: member.id, email: member.email }, // payload
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Send response
    res.json({
      success: true,
      message: "Login successful",
      token, // frontend will store this
      user: {
        id: member.id,
        email: member.email,
        organization: member.organization,
        name: member.name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Error during login" });
  }
});

module.exports = router;
