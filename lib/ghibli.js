import "server-only";

const BASE_URL = "https://ghibliapi.dev/films";

// Respaldo de los campos usados en la interfaz, tomado de la API el 20/10/2026.
// Permite que la experiencia siga siendo legible si el servicio no responde.
const fallbackFilms = {
  "dc2e6bd1-8156-4886-adff-b39e6043af0c": {
    title: "Spirited Away", original_title: "千と千尋の神隠し",
    original_title_romanised: "Sen to Chihiro no kamikakushi",
    description: "Spirited Away is an Oscar winning Japanese animated film about a ten year old girl who wanders away from her parents along a path that leads to a world ruled by strange and unusual monster-like animals. Her parents have been changed into pigs along with others inside a bathhouse full of these creatures. Will she ever see the world how it once was?",
    director: "Hayao Miyazaki", producer: "Toshio Suzuki",
    release_date: "2001", running_time: "124",
  },
  "cd3d059c-09f4-4ff3-8d63-bc765a5184fa": {
    title: "Howl's Moving Castle", original_title: "ハウルの動く城",
    original_title_romanised: "Hauru no ugoku shiro",
    description: "When Sophie, a shy young woman, is cursed with an old body by a spiteful witch, her only chance of breaking the spell lies with a self-indulgent yet insecure young wizard and his companions in his legged, walking home.",
    director: "Hayao Miyazaki", producer: "Toshio Suzuki",
    release_date: "2004", running_time: "119",
  },
  "58611129-2dbc-4a81-a72f-77ddfc1b1b49": {
    title: "My Neighbor Totoro", original_title: "となりのトトロ",
    original_title_romanised: "Tonari no Totoro",
    description: "Two sisters move to the country with their father in order to be closer to their hospitalized mother, and discover the surrounding trees are inhabited by Totoros, magical spirits of the forest. When the youngest runs away from home, the older sister seeks help from the spirits to find her.",
    director: "Hayao Miyazaki", producer: "Hayao Miyazaki",
    release_date: "1988", running_time: "86",
  },
};

function text(value, fallback = "Dato no disponible") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function getGhibliFilm(filmId) {
  const backup = fallbackFilms[filmId];
  if (!backup) throw new Error("Película no configurada");

  let data = backup;
  let sourceStatus = "respaldo";
  try {
    const response = await fetch(`${BASE_URL}/${filmId}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (payload?.id !== filmId) throw new Error("ID inesperado en la API");
    data = payload;
    sourceStatus = "api";
  } catch (error) {
    console.warn(`Studio Ghibli API: se usa la copia local de ${filmId}.`, error);
  }

  return {
    title: text(data.title, backup.title),
    originalTitle: text(data.original_title, backup.original_title),
    romanisedTitle: text(data.original_title_romanised, backup.original_title_romanised),
    description: text(data.description, backup.description),
    director: text(data.director, backup.director),
    producer: text(data.producer, backup.producer),
    year: text(data.release_date, backup.release_date),
    minutes: text(data.running_time, backup.running_time),
    sourceUrl: `${BASE_URL}/${filmId}`,
    sourceStatus,
  };
}
