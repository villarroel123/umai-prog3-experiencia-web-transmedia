import { memories, movies } from "@/data/memories";

const validIds = new Set(memories.map((memory) => memory.id));
const ranks = { pending: 0, "in-progress": 1, recovered: 2 };

export function normalizeMemoryStates(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([id, status]) =>
      validIds.has(id) && (status === "in-progress" || status === "recovered")),
  );
}

export function mergeMemoryStates(...sources) {
  const merged = {};
  for (const source of sources) {
    for (const [id, status] of Object.entries(normalizeMemoryStates(source))) {
      if ((ranks[status] || 0) > (ranks[merged[id]] || 0)) merged[id] = status;
    }
  }
  return merged;
}

export function getMemoryStatus(states, memoryId) {
  return states[memoryId] || "pending";
}

export function getMovieProgress(states, movieId) {
  const related = memories.filter((memory) => memory.movieId === movieId);
  const recovered = related.filter((memory) => states[memory.id] === "recovered").length;
  const started = related.some((memory) => states[memory.id] !== undefined);
  return {
    recovered,
    total: related.length,
    status: recovered === related.length ? "completed" : started ? "in-progress" : "not-started",
  };
}

export function getOverallProgress(states) {
  const recovered = memories.filter((memory) => states[memory.id] === "recovered").length;
  return {
    recovered,
    total: memories.length,
    chaptersCompleted: movies.filter((movie) => getMovieProgress(states, movie.id).status === "completed").length,
    bookStatus: recovered === memories.length ? "completed" : recovered > 0 ? "partial" : "incomplete",
    finalUnlocked: recovered === memories.length,
  };
}
