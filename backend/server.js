require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("./config/session");
const sequelize = require("./config/db");
const authRoutes = require("./routes/auth");
const manageAdminsRoutes = require("./routes/manageAdmins");
const authMiddleware = require("./middleware/authMiddleware");
const applicationsRoute = require("./routes/applications");
const path = require("path");
const messagesRoute = require("./routes/messages");
const eventRoute = require("./routes/adminEvents");
const publicEventsRoute = require("./routes/publicEvents");
const updateEventStatuses = require("./cron/UpdateEventStatus");
const adminNewsRoute = require("./routes/adminNews");
const publicNewsRoute = require("./routes/publicNews");
const adminHighlightsRoute = require("./routes/adminHighlights");
const publicHighlights = require("./routes/publicHighlights");
const adminPdfsRoutes = require("./routes/adminPdfs");
const publicPdfsRoutes = require("./routes/publicPdfs");
const registrationRoute = require("./routes/registration");
const userLoginRoute = require("./routes/userLogin");
const resetPasswordRoute = require("./routes/resetPassword");
const eventRegistrationRoutes = require("./routes/eventRegistration");
const getEventRegistrationsRoute = require("./routes/getEventRegistrations");
const adminManageMembers = require("./routes/adminManageMembers");

const app = express();
const PORT = process.env.PORT || 3000;
// Enable CORS (Frontend: 127.0.0.1:5500)
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));

// Sessions
app.use(session);

// start cron scheduler
updateEventStatuses();

// Parse JSON request bodies
app.use(express.json());

// Serve frontend files (make sure the path points to your frontend folder)
app.use("/admin", express.static(path.join(__dirname, "../admin")));

// Serve uploaded news and highlights images
app.use("/uploads/news", express.static(path.join(__dirname, "../uploads/news")));
app.use("/uploads/highlights", express.static(path.join(__dirname, "../uploads/highlights")));
app.use("/uploads/pdfs", express.static(path.join(__dirname, "../uploads/pdfs")));

// Routes
  // public routes
app.use("/api/applications", applicationsRoute);
app.use("/api/messages", messagesRoute);
app.use("/api/events", publicEventsRoute);
app.use("/api/news", publicNewsRoute);
app.use("/api/highlights", publicHighlights);
app.use("/api/pdfs", publicPdfsRoutes);
app.use("/api/registration", registrationRoute);
app.use("/api/login", userLoginRoute);
app.use("/api/reset-password", resetPasswordRoute);
app.use("/api/event-registrations", eventRegistrationRoutes);
  // admin NavigatorLogin/logout route
app.use("/auth", authRoutes);
app.use("/auth", manageAdminsRoutes);
app.use("/api", adminManageMembers);

// Admin Protected Routes
app.use("/api/admin/events", authMiddleware, eventRoute);
app.use("/api/admin/news", adminNewsRoute);
app.use("/api/admin/highlights", adminHighlightsRoute);
app.use("/api/admin/pdfs", adminPdfsRoutes);
app.use("/api/admin/event-registrations", authMiddleware, getEventRegistrationsRoute);

app.get("/admin/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard" });
});

// Start Server
sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
});
