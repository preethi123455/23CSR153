const express = require("express");
const { fetchNotifications } = require("./api");
const prioritizeNotifications = require("./priority");
const requestLogger = require("../logging_middleware/logger");
const app = express();
app.use(requestLogger);
const port = Number(process.env.PORT || 4000);
const defaultLimit = Number(process.env.NOTIFICATION_LIMIT || 10);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "notification-app-backend", time: new Date().toISOString() });
});
app.get("/notifications", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? defaultLimit);
    const rawNotifications = await fetchNotifications();
    const priority = prioritizeNotifications(rawNotifications, limit);
    res.json({ count: rawNotifications.length, limit, notifications: priority });
  } catch (error) {
    next(error);
  }
});
app.get("/debug/raw", async (_req, res, next) => {
  try {
    const notifications = await fetchNotifications();
    res.json({ count: notifications.length, notifications });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error.message || error);
  res.status(500).json({ error: error.message || "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Notification backend listening on http://localhost:${port}`);
});
