const axios = require("axios");

const API_BASE = process.env.EVAL_API_BASE || "http://4.224.186.213/evaluation-service";
const AUTH_TOKEN = process.env.EVAL_API_KEY || process.env.AUTH_TOKEN || process.env.BEARER_TOKEN || "";

function buildHeaders() {
  const headers = {};
  if (AUTH_TOKEN) {
    headers.Authorization = AUTH_TOKEN.startsWith("Bearer ") ? AUTH_TOKEN : `Bearer ${AUTH_TOKEN}`;
  }
  return headers;
}

function ensureArray(response, fallbackKey) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response[fallbackKey])) return response[fallbackKey];
  return [];
}

function normalizeNotification(notification) {
  const timestamp = new Date(notification.Timestamp || notification.timestamp || notification.time || null);
  return {
    id: notification.ID || notification.id || null,
    type: String(notification.Type || notification.type || "other").toLowerCase(),
    message: notification.Message || notification.message || "No message provided",
    raw: notification,
    timestamp: Number.isNaN(timestamp.getTime()) ? new Date().toISOString() : timestamp.toISOString(),
  };
}

async function fetchRemote(path) {
  const response = await axios.get(`${API_BASE}${path}`, { headers: buildHeaders() });
  return response.data;
}

async function fetchNotifications() {
  try {
    const raw = await fetchRemote("/notifications");
    const items = ensureArray(raw, "notifications");
    return items.map(normalizeNotification);
  } catch (error) {
    console.warn("Notification API fetch failed, using local fallback data:", error.message);
    return [
      { ID: "sample-1", Type: "placement", Message: "Campus hiring updates available", Timestamp: "2026-05-10T09:00:00Z" },
      { ID: "sample-2", Type: "result", Message: "Mid-semester results posted", Timestamp: "2026-05-11T12:30:00Z" },
      { ID: "sample-3", Type: "event", Message: "Alumni talk scheduled tomorrow", Timestamp: "2026-05-12T08:45:00Z" }
    ].map(normalizeNotification);
  }
}

module.exports = {
  fetchNotifications,
};
