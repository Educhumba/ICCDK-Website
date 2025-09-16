const express = require("express");
const router = express.Router();
const EventRegistration = require("../models/EventRegistration");
const Event = require("../models/Event");
const Members = require("../models/members");
const PDFDocument = require("pdfkit");
const { Op } = require("sequelize");

const authMiddleware = require("../middleware/authMiddleware");
const adminRole = require("../middleware/adminRole");

// =========================
// Protect all routes: only super_admin + event_admin
// =========================
router.use(authMiddleware);
router.use(adminRole("super_admin", "event_admin"));

// =========================
// Fetch registrations with optional filters
// =========================
router.get("/", async (req, res) => {
  try {
    const { filter, eventId } = req.query;
    let eventWhere = {};

    if (filter === "upcoming") eventWhere.date = { [Op.gte]: new Date() };
    if (filter === "past") eventWhere.date = { [Op.lt]: new Date() };
    if (eventId) eventWhere.id = eventId;

    const registrations = await EventRegistration.findAll({
      include: [
        {
          model: Event,
          as: "event",
          attributes: ["id", "title", "date", "location"],
          where: eventWhere,
        },
        {
          model: Members,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
      order: [["eventId", "ASC"]],
    });

    res.json({ success: true, registrations });
  } catch (err) {
    console.error("Error fetching registrations:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// =========================
// Export registrations as PDF
// =========================
router.get("/export", async (req, res) => {
  try {
    const { filter, eventId } = req.query;
    let eventWhere = {};

    if (filter === "upcoming") eventWhere.date = { [Op.gte]: new Date() };
    if (filter === "past") eventWhere.date = { [Op.lt]: new Date() };
    if (eventId) eventWhere.id = eventId;

    const registrations = await EventRegistration.findAll({
      include: [
        {
          model: Event,
          as: "event",
          attributes: ["id", "title", "date", "location"],
          where: eventWhere,
        },
        {
          model: Members,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
      order: [["eventId", "ASC"]],
    });

    if (!registrations.length) {
      return res.status(404).json({ success: false, error: "No registrations found" });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=event_registrations.pdf"
    );
    doc.pipe(res);

    doc.fontSize(18).text("Event Registrations Report", { align: "center" });
    doc.moveDown(1.5);

    // Group by event
    const grouped = {};
    registrations.forEach((reg) => {
      if (!grouped[reg.event.id]) grouped[reg.event.id] = { event: reg.event, regs: [] };
      grouped[reg.event.id].regs.push(reg);
    });

    Object.values(grouped).forEach((group, eventIndex) => {
      const { event, regs } = group;

      doc.fontSize(14).text(`${eventIndex + 1}. Event: ${event.title}`, { underline: true });
      doc.fontSize(12).text(`Date: ${event.date} | Location: ${event.location}`);
      doc.moveDown(0.5);

      doc.fontSize(11).text(
        "No.   Organization        Contact Person        Email                Phone                Status"
      );
      doc.moveDown(0.2);
      doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
      doc.moveDown(0.3);

      regs.forEach((r, idx) => {
        doc
          .fontSize(10)
          .text(
            `${idx + 1}.    ${r.organization}   ${r.contactPerson}   ${r.email}   ${r.phone}   ${r.status}`
          );
      });
      doc.moveDown(1.5);
    });

    doc.end();
  } catch (err) {
    console.error("Error exporting registrations:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
