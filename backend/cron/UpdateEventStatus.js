const cron = require("node-cron");
const { Op } = require("sequelize");
const Event = require("../models/Event");

function updateEventStatuses() {
  // run every 10 seconds
  cron.schedule("0 * * * *", async () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      // Past events
      await Event.update(
        { status: "past" },
        {
          where: {
            date: { [Op.lt]: today },
          },
        }
      );

      // Ongoing events (all of today)
      await Event.update(
        { status: "ongoing" },
        {
          where: {
            date: today,
          },
        }
      );

      // Upcoming events
      await Event.update(
        { status: "upcoming" },
        {
          where: {
            date: { [Op.gt]: today },
          },
        }
      );

      console.log(`[CRON] Event statuses updated at ${now.toISOString()}`);
    } catch (error) {
      console.error("[CRON] Failed to update event statuses:", error);
    }
  });
}

module.exports = updateEventStatuses;
