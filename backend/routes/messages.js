const express = require("express");
const router = express.Router();
const Message = require("../models/messages");
const transporter = require("../config/mail");
const authMiddleware = require("../middleware/authMiddleware");
const adminRole = require("../middleware/adminRole");

// ---------- Public: Store message (contact form submission) ----------
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const newMessage = await Message.create({
      name,
      email,
      subject: subject || null,
      message,
      date: new Date().toISOString().split("T")[0],
    });

    const currentYear = new Date().getFullYear();
    // Send confirmation email to user
    const userMailOptions = {
      from: `"ICCDK" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Message Received Confirmation",
      text: `Hello ${name},\n\nThank you for contacting ICCDK. We have received your message and our team will review it shortly.\n\nSubject: ${subject || "No subject provided"}\nMessage: ${message}\n\nWe will get back to you as soon as possible.\n\nBest regards,\nIslamic Chamber of Commerce & Development Kenya`,
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
                  <h2 style="color:#004085; margin-top:0;">Hello ${name},</h2>
                  <p>Thank you for contacting <b>Islamic Chamber of Commerce & Development Kenya (ICCDK)</b>. We have received your message and our team will review it shortly.</p>
                  
                  <p><b>Subject:</b> ${subject || "No subject provided"}</p>
                  <p><b>Message:</b> ${message}</p>

                  <p>We will get back to you as soon as possible.</p>
                  <p style="margin-top:20px;">Best regards,<br/><b>ICCDK Team</b></p>
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
    };
    try {
      await transporter.sendMail(userMailOptions);
      console.log("Confirmation email sent to user");
    } catch (err) {
      console.error("Failed to send confirmation email:", err.message);
    }

// Send notification email to admin
    const adminMailOptions = {
      from: `"ICCDK System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Message from ${name}`,
      text: `A new message was submitted via the ICCDK contact form.\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || "No subject"}\nMessage:\n${message}\n\nLogin to the admin dashboard to review.`,
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
              
              <!-- Header -->
              <tr>
                <td width="100%" style="padding:20px; font-size:18px; background:#4b8dbc; color:#ffffff;">
                  New Message
                </td>
              </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:20px; font-size:16px; line-height:1.6; color:#333333;">
                    <p><b>Name:</b> ${name}</p>
                    <p><b>Email:</b> ${email}</p>
                    <p><b>Subject:</b> ${subject || "No subject provided"}</p>
                    <p><b>Message:</b><br/>${message}</p>
                    <p style="margin-top:20px;">Login to the <a href="http://your-admin-dashboard-url.com" target="_blank">admin dashboard</a> to review.</p>
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
    };
    try {
      await transporter.sendMail(adminMailOptions);
      console.log("Admin notified successfully");
    } catch (err) {
      console.error("Failed to notify admin:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      id: newMessage.id,
    });

  } catch (error) {
    console.error("Error logging message:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// =========================
// ADMIN routes: fetch all messages & update status
// =========================
router.use(authMiddleware);
router.use(adminRole("super_admin", "moderator"));

// Fetch all messages (for admin dashboard)
router.get("/", async (req, res) => {
  try {
    const messages = await Message.findAll({
      order: [["date", "DESC"]],
    });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update status (admin feature: reviewed / archived)
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["new", "reviewed", "archived"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const msg = await Message.findByPk(id);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    msg.status = status;
    await msg.save();

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Counter for new messages
router.get("/count", async (req, res) => {
  try {
    const count = await Message.count({ where: { status: "new" } });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching message count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
