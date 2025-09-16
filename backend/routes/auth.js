const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const User = require("../models/user");
const AdminLog = require("../models/adminLogs");
const transporter = require("../config/mail");
const { ADMIN_ROLES } = require("../utils/constants");

// =========================
// Admin Login
// =========================
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email, role: ADMIN_ROLES } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Check if account is suspended
    if (user.status === "inactive") {
      return res.status(403).json({
        message: "Your account has been suspended. Please contact the system administrator."
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    await AdminLog.create({
      admin_id: user.id,
      entity_id: user.id,
      entity_type: "Admin",
      action: "LOGIN",
      details: `Admin ${user.email} logged in`,
    });

    res.json({ message: "Login successful", user: req.session.user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =========================
// Admin Logout
// =========================
router.post("/admin/logout", async (req, res) => {
  try {
    if (req.session.user) {
      await AdminLog.create({
        admin_id: req.session.user.id,
        entity_id: req.session.user.id,
        entity_type: "Admin",
        action: "LOGOUT",
        details: `Admin ${req.session.user.email} logged out`,
      });
    }

    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// Request Reset Code
// =========================
router.post("/admin/request-reset", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email, role: ADMIN_ROLES } });
    if (!user) return res.status(404).json({ message: "Admin not found" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.reset_code = code;
    user.reset_expires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await transporter.sendMail({
      from: `"ICDK Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Code",
      text: `Your reset code is ${code}`,
    });

    await AdminLog.create({
      admin_id: user.id,
      entity_id: user.id,
      entity_type: "Admin",
      action: "REQUEST_RESET",
      details: `Password reset requested for ${email}`,
    });

    res.json({ message: "Reset code sent" });
  } catch (err) {
    console.error("Request reset error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// Confirm Reset Password
// =========================
router.post("/admin/confirm-reset", async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const user = await User.findOne({
      where: { email, reset_code: code, reset_expires: { [Op.gt]: new Date() } },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired reset code" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.reset_code = null;
    user.reset_expires = null;
    user.force_password_reset = false;
    await user.save();

    await AdminLog.create({
      admin_id: user.id,
      entity_id: user.id,
      entity_type: "Admin",
      action: "RESET_PASSWORD",
      details: `Password reset completed for ${email}`,
    });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Confirm reset error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// Session Check
// =========================
router.get("/admin/check", (req, res) => {
  if (req.session.user) return res.json({ loggedIn: true, user: req.session.user });
  res.status(401).json({ loggedIn: false });
});

module.exports = router;
