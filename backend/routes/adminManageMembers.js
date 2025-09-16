const express = require("express");
const router = express.Router();

const Application = require("../models/Application");
const AdminLog = require("../models/adminLogs");

// =========================
// List Members (super_admin only)
// =========================
router.get("/members", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "super_admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const members = await Application.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "number",
        "category",
        "date_established",
        "organization_size",
        "years_activity",
        "submission_date"
      ],
      order: [["submission_date", "DESC"]],
    });

    res.json(members);
  } catch (err) {
    console.error("List members error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// Update Member (super_admin only)
// =========================
router.put("/members/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "super_admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const member = await Application.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const updates = req.body;
    await member.update(updates);

    await AdminLog.create({
      admin_id: req.session.user.id,
      entity_type: "Member",
      entity_id: member.id,
      action: "UPDATE",
      details: `Updated member - ${member.email}`,
    });

    res.json({ message: "Member updated successfully", member });
  } catch (err) {
    console.error("Update member error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// Delete Member (super_admin only)
// =========================
router.delete("/members/:id", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "super_admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const member = await Application.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    await member.destroy();

    await AdminLog.create({
      admin_id: req.session.user.id,
      entity_type: "Member",
      entity_id: member.id,
      action: "DELETE",
      details: `Deleted member - ${member.email}`,
    });

    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    console.error("Delete member error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
