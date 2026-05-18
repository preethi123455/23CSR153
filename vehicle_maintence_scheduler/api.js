const axios = require("axios");

const API_BASE =
  process.env.EVAL_API_BASE || "http://4.224.186.213/evaluation-service";
const AUTH_TOKEN =
  process.env.EVAL_API_KEY ||
  process.env.AUTH_TOKEN ||
  process.env.BEARER_TOKEN ||
  "";

function buildHeaders() {
  const headers = {};
  if (AUTH_TOKEN) {
    headers.Authorization = AUTH_TOKEN.startsWith("Bearer ")
      ? AUTH_TOKEN
      : `Bearer ${AUTH_TOKEN}`;
  }
  return headers;
}

function ensureArray(response, fallbackKey) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response[fallbackKey]))
    return response[fallbackKey];
  return [];
}

function normalizeVehicle(vehicle) {
  const duration = Number(
    vehicle.time ??
      vehicle.duration ??
      vehicle.Duration ??
      vehicle.estimatedHours ??
      vehicle.serviceDuration ??
      vehicle.hours ??
      vehicle.estimated_hours ??
      0,
  );
  const score = Number(
    vehicle.score ??
      vehicle.impact ??
      vehicle.Impact ??
      vehicle.importance ??
      vehicle.importanceScore ??
      vehicle.operationalImpact ??
      vehicle.priority ??
      0,
  );

  return {
    id:
      vehicle.TaskID ||
      vehicle.taskId ||
      vehicle.id ||
      vehicle.VehicleID ||
      null,
    name: vehicle.name || vehicle.VehicleName || vehicle.taskName || "unknown",
    depotId: vehicle.DepotID || vehicle.depotId || null,
    duration: Number.isFinite(duration) ? duration : 0,
    score: Number.isFinite(score) ? score : 0,
    raw: vehicle,
  };
}

async function fetchRemote(path) {
  const response = await axios.get(`${API_BASE}${path}`, {
    headers: buildHeaders(),
  });
  return response.data;
}

async function fetchVehicles() {
  try {
    const raw = await fetchRemote("/vehicles");
    return ensureArray(raw, "vehicles");
  } catch (error) {
    console.warn(
      "Vehicle API fetch failed, using local fallback data:",
      error.message,
    );
    return [
      {
        TaskID: "sample-1",
        name: "Brake inspection",
        time: 2,
        score: 14,
        DepotID: "D1",
      },
      {
        TaskID: "sample-2",
        name: "Oil change",
        time: 1,
        score: 8,
        DepotID: "D1",
      },
      {
        TaskID: "sample-3",
        name: "Battery replacement",
        time: 3,
        score: 18,
        DepotID: "D2",
      },
      {
        TaskID: "sample-4",
        name: "Tire rotation",
        time: 2,
        score: 9,
        DepotID: "D2",
      },
    ];
  }
}

async function fetchDepots() {
  try {
    const raw = await fetchRemote("/depots");
    return ensureArray(raw, "depots");
  } catch (error) {
    console.warn(
      "Depot API fetch failed, using local fallback data:",
      error.message,
    );
    return [
      { DepotID: "D1", name: "North Depot", location: "Hyderabad" },
      { DepotID: "D2", name: "East Depot", location: "Chennai" },
    ];
  }
}

async function fetchTasks() {
  const vehicles = await fetchVehicles();
  return vehicles
    .map(normalizeVehicle)
    .filter((task) => task.duration > 0 && task.score >= 0);
}

module.exports = {
  fetchVehicles,
  fetchDepots,
  fetchTasks,
};
