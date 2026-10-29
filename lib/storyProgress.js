export const storyChapterIds = ["chihiro", "howl", "totoro"];

export function normalizeStoryProgress(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const next = {};
  for (const id of storyChapterIds) {
    const entry = value[id];
    if (!entry || typeof entry !== "object") continue;
    const gameComplete = entry.gameComplete === true;
    const started = entry.started === true || gameComplete;
    if (!started) continue;
    const objectRecovered = gameComplete && entry.objectRecovered !== false;
    const answer = gameComplete && objectRecovered && typeof entry.answer === "string" ? entry.answer.trim().slice(0, 500) : "";
    next[id] = {
      started: true,
      gameComplete,
      objectRecovered,
      ticketRecovered: id === "chihiro" && objectRecovered ? entry.ticketRecovered !== false : false,
      answer,
      pageRestored: Boolean(answer) && entry.pageRestored !== false,
      updatedAt: Number(entry.updatedAt) || 0,
    };
  }
  return next;
}

export function mergeStoryProgress(...sources) {
  const merged = {};
  const rank = (entry) => entry.answer && entry.pageRestored ? 3 : entry.objectRecovered ? 2 : entry.gameComplete ? 1 : 0;
  for (const source of sources) {
    for (const [id, entry] of Object.entries(normalizeStoryProgress(source))) {
      const previous = merged[id];
      if (!previous || rank(entry) > rank(previous) ||
        (rank(entry) === rank(previous) && entry.updatedAt > previous.updatedAt)) {
        merged[id] = entry;
      }
    }
  }
  return merged;
}

export function chapterState(progress, id) {
  const entry = normalizeStoryProgress(progress)[id];
  return {
    started: Boolean(entry?.started),
    gameComplete: Boolean(entry?.gameComplete),
    objectRecovered: Boolean(entry?.objectRecovered),
    ticketRecovered: Boolean(entry?.ticketRecovered),
    answer: entry?.answer || "",
    pageRestored: Boolean(entry?.pageRestored),
    saved: Boolean(entry?.answer && entry?.pageRestored),
  };
}

export function storySummary(progress) {
  const savedCount = storyChapterIds.filter((id) => chapterState(progress, id).saved).length;
  return { savedCount, total: storyChapterIds.length, finalUnlocked: savedCount === storyChapterIds.length };
}
