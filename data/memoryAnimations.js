// Duraciones reales de los GIFs, leídas de sus fotogramas (centésimas de segundo).
export const memoryAnimations = {
  chihiro: {
    src: "/images/experiences/chihiro/memories/chihiro-recuerdo.gif",
    alt: "El tren de Chihiro avanza sobre el agua",
    width: 500,
    height: 269,
    durationMs: 3000,
  },
  howl: {
    src: "/images/experiences/howl/memories/howl-recuerdo.gif",
    alt: "La carta de Howl se eleva hacia el cielo",
    width: 358,
    height: 358,
    durationMs: 4200,
  },
  totoro: {
    src: "/images/experiences/totoro/memories/totoro-recuerdo.gif",
    alt: "Totoro descansa mientras una hoja guarda el recuerdo",
    width: 357,
    height: 357,
    durationMs: 5400,
  },
};

export function markMemoryInkPending(id) {
  try { window.sessionStorage.setItem(`biblioteca-tinta:${id}`, "1"); }
  catch { /* El recuerdo ya está persistido; la lectura sigue disponible. */ }
}

export function consumeMemoryInkPending(id) {
  try {
    const key = `biblioteca-tinta:${id}`;
    const pending = window.sessionStorage.getItem(key) === "1";
    window.sessionStorage.removeItem(key);
    return pending;
  } catch { return false; }
}
