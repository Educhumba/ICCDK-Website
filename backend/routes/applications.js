const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const transporter = require("../config/mail");
const authMiddleware = require("../middleware/authMiddleware");
const adminRole = require("../middleware/adminRole");

//----------This route handles the registration of new members in the membership section-------------

// Store application (form submission) - public route
router.post("/", async (req, res) => {
  try {
    const { 
      name, 
      email, 
      number, 
      category, 
      message, 
      date_established, 
      organization_size, 
      years_activity, 
      submission_date 
    } = req.body;

    // Check if organization exists by email
    let org = await Application.findOne({ where: { email } });
    if (org) {
      return res
        .status(400)
        .json({ success: false, message: "Organization already registered with this email" });
    }
    // Check if organization exists by name
    org = await Application.findOne({ where: { name } });
    if (org) {
      return res
        .status(400)
        .json({ success: false, message: "Organization name already registered" });
    }

    const newApp = await Application.create({
      name,
      email,
      number,
      category: category || null,
      message: message || null,
      date_established: date_established || null,
      organization_size: organization_size || null,
      years_activity: years_activity || null,
      submission_date: submission_date || new Date().toISOString().split("T")[0],
      status: "new",
    });

    // Send Membership Application Confirmation to Applicant
    const currentYear = new Date().getFullYear();
    const userMailOptions = {
      from: `"ICCDK" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Membership Application Received - Thank You!",
      text: `Hello ${name},\n\nThank you for submitting your membership application to ICCDK. We have received your details and our membership team will review them shortly.\n\nOrganization Name: ${name}\nEmail: ${email}\nContact: ${number}\n${category ? `Category: ${category}\n` : ""}${date_established ? `Date Established: ${date_established}\n` : ""}${organization_size ? `Organization Size: ${organization_size} employees\n` : ""}${years_activity ? `Years of Activity: ${years_activity}\n` : ""}${message ? `Message: ${message}\n` : ""}\n\nWe will get back to you as soon as possible.\n\nBest regards,\nMembership Team\nIslamic Chamber of Commerce & Development Kenya`,
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
                  <p>
                    Thank you for submitting your <b>membership application</b> to the
                    <b>Islamic Chamber of Commerce & Development Kenya (ICCDK)</b>. 
                    We have received your details and our membership team will review them shortly.
                  </p>

                  <div style="margin-top:20px; padding:15px; background:#eaf4fe; border-left:4px solid #3498db; border-radius:4px;">
                    <strong>Application Summary:</strong>
                    <p><b>Organization Name:</b> ${name}</p>
                    <p><b>Email:</b> ${email}</p>
                    <p><b>Contact:</b> ${number}</p>
                    ${category ? `<p><b>Category:</b> ${category}</p>` : ""}
                    ${date_established ? `<p><b>Date Established:</b> ${date_established}</p>` : ""}
                    ${organization_size ? `<p><b>Organization Size:</b> ${organization_size} employees</p>` : ""}
                    ${years_activity ? `<p><b>Years of Activity:</b> ${years_activity}</p>` : ""}
                    ${message ? `<p><b>Message:</b> ${message}</p>` : ""}
                  </div>

                  <p style="margin-top:20px;">Our team will get back to you as soon as possible.</p>
                  <p style="margin-top:20px;">Best regards,<br/><b>Membership Team<br/>ICCDK</b></p>
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
      console.log("Confirmation email sent to applicant:", email);
    } catch (err) {
      console.error("Error sending confirmation email:", err.message);
    }

    // Send notification email to admin
    const adminMailOptions = {
      from: `"ICCDK System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Membership Application from ${name}`,
      text: `A new membership application was submitted via the ICCDK website.\n\nName: ${name}\nEmail: ${email}\nContact: ${number}\n${category ? `Category: ${category}\n` : ""}${date_established ? `Date Established: ${date_established}\n` : ""}${organization_size ? `Organization Size: ${organization_size} employees\n` : ""}${years_activity ? `Years of Activity: ${years_activity}\n` : ""}${message ? `Message: ${message}\n` : ""}\n\nLogin to the admin dashboard to review.`,
      html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f5" style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="margin:20px auto; border-radius:8px; overflow:hidden; box-shadow:0 4px 8px rgba(0,0,0,0.05);">
              
                <tr>
                  <td width="100%" align="center" style="padding:20px;">
                    <img src="https://yourdomain.com/images/iccdk-logo.png" alt="ICCDK Logo" width="150" style="display:block;"/>
                  </td>
                </tr>
                
                <!-- Header -->
                <tr>
                  <td width="100%" style="padding:20px; font-size:18px; background:#4b8dbc; color:#ffffff;">
                    New Membership Application
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:20px; font-size:16px; line-height:1.6; color:#333333;">
                    <p><b>Name:</b> ${name}</p>
                    <p><b>Email:</b> ${email}</p>
                    <p><b>Contact:</b> ${number}</p>
                    ${category ? `<p><b>Category:</b> ${category}</p>` : ""}
                    ${date_established ? `<p><b>Date Established:</b> ${date_established}</p>` : ""}
                    ${organization_size ? `<p><b>Organization Size:</b> ${organization_size} employees</p>` : ""}
                    ${years_activity ? `<p><b>Years of Activity:</b> ${years_activity}</p>` : ""}
                    ${message ? `<p><b>Message:</b><br/>${message}</p>` : ""}
                    
                    <p style="margin-top:20px;">
                      Login to the <a href="http://your-admin-dashboard-url.com" target="_blank">admin dashboard</a> to review.
                    </p>
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
      console.log("Admin notified of new application");
    } catch (err) {
      console.error("Error sending admin notification:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      id: newApp.id,
    });
  } catch (error) {
    console.error("Error logging application:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =========================
// ADMIN routes: fetch all applications & update status
// =========================
router.use(authMiddleware);
router.use(adminRole("super_admin", "moderator"));

// Fetch all applications (for admin dashboard)
router.get("/", async (req, res) => {
  try {
    const apps = await Application.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(apps);
  } catch (error) {
    console.error("Error fetching applications:", error);
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

    const app = await Application.findByPk(id);
    if (!app) return res.status(404).json({ error: "Application not found" });

    app.status = status;
    await app.save();

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Counter for new applications
router.get("/count", async (req, res) => {
  try {
    const count = await Application.count({ where: { status: "new" } });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching application count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
