// routes/registration.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Members = require("../models/members"); // members model
require("dotenv").config();

// Setup transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. Send verification code
router.post("/send-code", async (req, res) => {
  try {
    const { organization, email, phone, password } = req.body;

    // Check if member already exists
    let member = await Members.findOne({ where: { email } });
    if (member) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Generate code
    const code = crypto.randomInt(100000, 999999).toString();

    // Hash password immediately
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create member with all fields and is_verified = false
    await Members.create({
      organization,
      email,
      phone,
      password: hashedPassword,
      verification_code: code,
      is_verified: false,
    });

// Send email verification
const currentYear = new Date().getFullYear();
await transporter.sendMail({
  from: `"ICDK Registration" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Verify Your Email - ICCDK Account Registration",
  text: `Hello,

Thank you for signing up with the Islamic Chamber of Commerce & Development Kenya (ICCDK).

Your verification code is: ${code}

Please enter this code in the registration form to complete your account setup.

If you did not sign up for an ICCDK account, you can safely ignore this email.

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
              <h2 style="color:#004085; margin-top:0;">Verify Your Email</h2>
              <p>Thank you for signing up with <b>Islamic Chamber of Commerce & Development Kenya (ICCDK)</b>. To complete your registration, please use the verification code below:</p>
              
              <p style="font-size:20px; font-weight:bold; color:#2c3e50; text-align:center; margin:30px 0;">${code}</p>

              <p>If you did not create an account with ICCDK, you can safely ignore this email.</p>

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

// 2. Complete registration after verification
router.post("/signup", async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find member by email
    const member = await Members.findOne({ where: { email } });

    if (!member || member.verification_code !== code) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }

    // Mark as verified and clear code
    member.is_verified = true;
    member.verification_code = null;
    await member.save();

    res.json({ success: true, message: "Registration completed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error completing registration" });
  }
});


module.exports = router;
