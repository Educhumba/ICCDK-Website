const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Members = require("../models/members");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Setup transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// =========================
// 1️ Send / Resend Verification Code
// =========================
router.post("/send-code", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const code = crypto.randomInt(100000, 999999).toString();
    const member = await Members.findOne({ where: { email } });

    if (!member) return res.status(400).json({ success: false, message: "Email not found" });

    member.verification_code = code;
    await member.save();

// Send password reset email
const currentYear = new Date().getFullYear();
await transporter.sendMail({
  from: `"ICDK Password Reset" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Password Reset Verification Code - ICCDK",
  text: `Hello,

We received a request to reset the password for your ICCDK account.

Your password reset verification code is: ${code}

If you did not request a password reset, please ignore this email.

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
              <h2 style="color:#004085; margin-top:0;">Password Reset Request</h2>
              <p>We received a request to reset the password for your <b>ICCDK account</b>. Please use the verification code below to proceed:</p>
              
              <p style="font-size:20px; font-weight:bold; color:#2c3e50; text-align:center; margin:30px 0;">${code}</p>

              <p>If you did not request a password reset, you can safely ignore this email. Your account remains secure.</p>

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
});

    res.json({ success: true, message: "Verification code sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error sending code" });
  }
});

// =========================
// 2️ Verify Code
// =========================
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    const member = await Members.findOne({ where: { email } });

    if (!member || member.verification_code !== code) {
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error verifying code" });
  }
});

// =========================
// 3️ Set New Password
// =========================
router.post("/set", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const member = await Members.findOne({ where: { email } });

    if (!member) return res.status(400).json({ success: false, message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    member.password = hashedPassword;
    member.verification_code = null;
    await member.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
});

module.exports = router;
