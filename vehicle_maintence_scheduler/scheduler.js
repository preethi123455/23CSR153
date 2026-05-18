function scheduleVehicles(tasks, maxHours) {
  if (!Array.isArray(tasks)) {
    throw new Error("Tasks must be an array");
  }

  const itemList = tasks
    .map((task) => ({
      ...task,
      duration: Math.max(1, Math.round(Number(task.duration || task.time || 0))),
      score: Number(task.score || 0),
    }))
    .filter((task) => task.duration > 0 && task.score >= 0);

  const dp = Array.from({ length: maxHours + 1 }, () => ({ score: 0, items: [] }));

  for (const task of itemList) {
    for (let capacity = maxHours; capacity >= task.duration; capacity--) {
      const candidateScore = dp[capacity - task.duration].score + task.score;
      if (candidateScore > dp[capacity].score) {
        dp[capacity] = {
          score: candidateScore,
          items: [...dp[capacity - task.duration].items, task],
        };
      }
    }
  }

  const best = dp[maxHours];
  const selectedTasks = best.items.map((task) => ({
    id: task.id,
    name: task.name,
    depotId: task.depotId,
    duration: task.duration,
    score: task.score,
  }));

  return {
    totalScore: best.score,
    totalHours: selectedTasks.reduce((sum, item) => sum + item.duration, 0),
    selectedCount: selectedTasks.length,
    selectedTasks,
  };
}

module.exports = scheduleVehicles;
