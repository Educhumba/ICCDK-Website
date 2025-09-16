const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require("../models/user");
const AdminLog = require("../models/adminLogs");
const transporter = require("../config/mail");
const { ADMIN_ROLES } = require("../utils/constants");

// =========================
// Create Admin (super_admin only)
// =========================
router.post("/create-admin", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "super_admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { name, email, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: `An account with the email "${email}" already exists. 
Please check the list of admins and update their role instead.`,
      });
    }

    const tempPassword = crypto.randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "moderator",
      status: "active",
      is_verified: true,
      force_password_reset: true,
      last_active: new Date(),
    });

    await transporter.sendMail({
      from: `"ICDK Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your New Admin Account Access",
      text: `Hello ${name},

An administrator account has been created for you on the ICCD Kenya platform. 

Role Assigned: ${role || "moderator"}

You can log in using the temporary password below:
Temporary Password: ${tempPassword}

For security purposes, you will be required to change this password immediately after your first login.

Welcome aboard, and please keep this information secure.

Regards,  
ICDK Admin Team`,
    });

    await AdminLog.create({
      admin_id: req.session.user.id,
      entity_type: "Admin",
      entity_id: newAdmin.id,
      action: "CREATE",
      details: `Created new ${role} - ${email}`,
    });

    res.json({ message: "Admin created successfully", admin: newAdmin });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// List Admins (super_admin only)
// =========================
router.get("/admins", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "super_admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const admins = await User.findAll({
      where: { role: ADMIN_ROLES },
      attributes: ["id", "name", "email", "role", "status", "last_active", "force_password_reset"],
    });

    res.json({ admins });
  } catch (err) {
    console.error("List admins error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// Delete Admin (super_admin only)
// =========================
router.delete("/admins/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "super_admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const admin = await User.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await admin.destroy();

    await AdminLog.create({
      admin_id: req.session.user.id,
      entity_id: admin.id,
      entity_type: "Admin",
      action: "DELETE",
      details: `Deleted admin - ${admin.email}`,
    });

    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Delete admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// Toggle Admin Status (super_admin only)
// =========================
router.patch("/admins/:id/status", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "super_admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const admin = await User.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Toggle status
    const newStatus = admin.status === "active" ? "inactive" : "active";
    admin.status = newStatus;
    await admin.save();

    await AdminLog.create({
      admin_id: req.session.user.id,
      entity_id: admin.id,
      entity_type: "Admin",
      action: "UPDATE_STATUS",
      details: `Changed status of ${admin.email} to ${newStatus}`,
    });

    res.json({ message: `Admin status updated to ${newStatus}`, status: newStatus });
  } catch (err) {
    console.error("Update admin status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
