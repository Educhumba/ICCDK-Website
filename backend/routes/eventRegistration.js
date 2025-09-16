const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const nodemailer = require("nodemailer");
const auth= require("../middleware/auth");

// Setup email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/event-registrations/:id/register
router.post("/:id/register", auth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const { organization, attendees, contactPerson, email, phone } = req.body;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const now = new Date();

    //  Restriction: prevent registration if past or ongoing
    if (new Date(event.date) <= now) {
      return res.status(400).json({ error: "Registration is closed for this event." });
    }


    // Prevent duplicate registrations by same user
    const existing = await EventRegistration.findOne({ where: { eventId, email } });
    if (existing) return res.status(400).json({ error: "You have already registered for this event" });

    // Save registration
    const registration = await EventRegistration.create({
      eventId,
      organization,
      attendees,
      contactPerson,
      email,
      phone,
      userId: req.user.id,
      status: "registered",
    });

    const currentYear = new Date().getFullYear();
    // Send registration confirmation email
    try{
      await transporter.sendMail({
        from: `"ICCD Kenya" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Registration Confirmation for ${event.title}`,
        text: `Hello ${contactPerson},

      We are pleased to confirm that ${organization} has successfully registered for the event:

      Event: ${event.title}
      Date: ${event.date}
      Location: ${event.location}

      We appreciate your participation and look forward to welcoming you at the event.

      Best regards,
      Islamic Chamber of Commerce & Development Kenya (ICCDK)
      `,
        html: `
          <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f5" style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="margin:20px auto; border-radius:8px; overflow:hidden; box-shadow:0 4px 8px rgba(0,0,0,0.05);">
                  
                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding:20px;">
                      <img src="https://yourdomain.com/images/iccdk-logo.png" alt="ICCDK Logo" width="150" style="display:block;"/>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:20px; font-size:16px; line-height:1.6; color:#333333;">
                      <h2 style="color:#004085; margin-top:0;">Thank you for registering!</h2>
                      <p>Hello ${contactPerson},</p>
                      <p>We are pleased to confirm that <b>${organization}</b> has successfully registered for the event:</p>

                      <p><strong>Event:</strong> ${event.title}<br>
                      <strong>Date:</strong> ${event.date}<br>
                      <strong>Location:</strong> ${event.location}</p>

                      <p>We appreciate your participation and look forward to welcoming you at the event.</p>

                      <p style="margin-top:20px;">Best regards,<br/><b>ICCDK</b></p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding:0 20px;">
                      <hr style="border:none; border-top:1px solid #e0e0e0;"/>
                    </td>
                  </tr>

                  <!-- Socials -->
                  <tr>
                    <td align="center" style="padding:15px;">
                      <p style="margin:0 0 10px; font-size:14px; color:#555;">Follow us on :</p>
                      <a href="https://facebook.com" target="_blank">
                        <img src="https://yourdomain.com/icons/facebook.png" alt="Facebook" width="24" style="margin:0 8px;"/>
                      </a>
                      <a href="https://twitter.com" target="_blank">
                        <img src="https://yourdomain.com/icons/twitter.png" alt="Twitter" width="24" style="margin:0 8px;"/>
                      </a>
                      <a href="https://linkedin.com" target="_blank">
                        <img src="https://yourdomain.com/icons/linkedin.png" alt="LinkedIn" width="24" style="margin:0 8px;"/>
                      </a>
                      <a href="https://instagram.com" target="_blank">
                        <img src="https://yourdomain.com/icons/instagram.png" alt="Instagram" width="24" style="margin:0 8px;"/>
                      </a>
                      <a href="https://youtube.com" target="_blank">
                        <img src="https://yourdomain.com/icons/youtube.png" alt="YouTube" width="24" style="margin:0 8px;"/>
                      </a>
                      <a href="https://wa.me/2547XXXXXXX" target="_blank">
                        <img src="https://yourdomain.com/icons/whatsapp.png" alt="WhatsApp" width="24" style="margin:0 8px;"/>
                      </a>
                    </td>
                  </tr>

                  <!-- Ethical Commerce -->
                  <tr>
                    <td align="center" style="padding:10px 20px; font-size:14px; color:#777;">
                      <em>Ethical commerce for a better tomorrow.</em>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" bgcolor="#f5f5f5" style="padding:15px; font-size:12px; color:#888;">
                      &copy; ${currentYear} Islamic Chamber of Commerce & Development Kenya.
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        `,
      });
      } catch (err) {
        console.error("Error sending confirmation email:", err.message);
      }
     
      // Send notification email to admin
      try {
      await transporter.sendMail({
        from: `"ICCD Kenya System" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Event Registration: ${event.title}`,
        text: `A new registration has been submitted:

Event: ${event.title}
Date: ${event.date}
Location: ${event.location}
Organization: ${organization}
Contact Person: ${contactPerson}
Email: ${email}
Phone: ${phone}
Attendees: ${attendees}
        `,
        html: `
          <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f5" style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="margin:20px auto; border-radius:8px; overflow:hidden; box-shadow:0 4px 8px rgba(0,0,0,0.05);">
                  <tr>
                    <td align="center" style="padding:20px;">
                      <img src="https://yourdomain.com/images/iccdk-logo.png" alt="ICCDK Logo" width="150" style="display:block;"/>
                    </td>
                  </tr>
                    
                  <tr>
                    <td width="100%" style="padding:20px; font-size:18px; background:#4b8dbc; color:#ffffff;">
                      New Event Registration
                    </td>
                  </tr>

                    <td style="padding:20px; font-size:16px; line-height:1.6; color:#333333;">
                      <p><b>Event:</b> ${event.title}</p>
                      <p><b>Date:</b> ${event.date}</p>
                      <p><b>Location:</b> ${event.location}</p>
                      <p><b>Organization:</b> ${organization}</p>
                      <p><b>Contact Person:</b> ${contactPerson}</p>
                      <p><b>Email:</b> ${email}</p>
                      <p><b>Phone:</b> ${phone}</p>
                      <p><b>Attendees:</b> ${attendees}</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" bgcolor="#f5f5f5" style="padding:15px; font-size:12px; color:#888;">
                      &copy; ${currentYear} Islamic Chamber of Commerce & Development Kenya.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `,
      });
    } catch (err) {
      console.error("Error sending admin notification:", err.message);
    }
      res.json({ message: "Registration successful! Confirmation email sent.", registration });
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ error: "Internal server error" });
    }
});

// GET event-registrations of a user
router.get("/my", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch registrations with related event details
    const registrations = await EventRegistration.findAll({
      where: { userId },
      include: [
        {
          model: Event,
          as: "event",
          attributes: ["id", "title", "date", "location"],
        },
      ],
    });

    res.json({ success: true, registrations });
  } catch (error) {
    console.error("Error fetching my events:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Cancel registration
router.delete("/:id", auth, async (req, res) => {
  try {
    const reg = await EventRegistration.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!reg) return res.status(404).json({ success: false, error: "Registration not found" });

    await reg.update({ status: "cancelled" });
    res.json({ success: true, message: "Registration cancelled" });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Report absent
router.patch("/:id/absent", auth, async (req, res) => {
  try {
    const reg = await EventRegistration.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!reg) return res.status(404).json({ success: false, error: "Registration not found" });

    await reg.update({ status: "absent" });
    res.json({ success: true, message: "Marked as absent" });
  } catch (error) {
    console.error("Error reporting absent:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});


module.exports = router;