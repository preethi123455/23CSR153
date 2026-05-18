const express = require("express");
const { fetchTasks, fetchVehicles, fetchDepots } = require("./api");
const scheduleVehicles = require("./scheduler");
const requestLogger = require("../logging_middleware/logger");

const app = express();
app.use(requestLogger);

const port = Number(process.env.PORT || 3000);
const defaultMaxHours = Number(process.env.MAX_HOURS || 8);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "vehicle-maintenance-scheduler", time: new Date().toISOString() });
});

app.get("/schedule", async (req, res, next) => {
  try {
    const maxHours = Number(req.query.maxHours ?? defaultMaxHours);
    const tasks = await fetchTasks();
    const schedule = scheduleVehicles(tasks, maxHours);
    res.json({ maxHours, taskCount: tasks.length, schedule });
  } catch (error) {
    next(error);
  }
});

app.get("/debug/vehicles", async (_req, res, next) => {
  try {
    const vehicles = await fetchVehicles();
    res.json({ count: vehicles.length, vehicles });
  } catch (error) {
    next(error);
  }
});

app.get("/debug/depots", async (_req, res, next) => {
  try {
    const depots = await fetchDepots();
    res.json({ count: depots.length, depots });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error.message || error);
  res.status(500).json({ error: error.message || "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Vehicle Maintenance Scheduler backend listening on http://localhost:${port}`);
});
