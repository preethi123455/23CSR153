const typeWeight = {
  placement: 50,
  result: 40,
  event: 30,
  message: 20,
  other: 10,
};

function prioritizeNotifications(notifications, limit = 10) {
  return notifications
    .map((item) => ({
      ...item,
      effectiveType: item.type || "other",
      weight: typeWeight[item.type] || typeWeight.other,
      timestampMs: Date.parse(item.timestamp) || 0,
    }))
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return b.timestampMs - a.timestampMs;
    })
    .slice(0, Math.max(1, Math.min(limit, 100)))
    .map((item) => ({
      id: item.id,
      type: item.effectiveType,
      weight: item.weight,
      message: item.message,
      timestamp: item.timestamp,
    }));
}

module.exports = prioritizeNotifications;
