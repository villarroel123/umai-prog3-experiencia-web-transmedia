"use client";

import { useBookJourney } from "@/components/BookJourney";

// Posiciones fijas (evita errores de hidratación en Next.js)
const SPARKLES = [
  { x: 8, y: 14, s: 14, d: 0 },    { x: 22, y: 68, s: 10, d: 1.2 },
  { x: 35, y: 24, s: 18, d: 0.6 }, { x: 48, y: 82, s: 12, d: 2.1 },
  { x: 62, y: 12, s: 16, d: 1.7 }, { x: 74, y: 58, s: 11, d: 0.3 },
  { x: 86, y: 30, s: 20, d: 2.6 }, { x: 93, y: 76, s: 13, d: 1.0 },
  { x: 15, y: 42, s: 9, d: 3.1 },  { x: 55, y: 45, s: 8, d: 1.5 },
  { x: 80, y: 90, s: 15, d: 0.9 }, { x: 40, y: 56, s: 10, d: 2.4 },
];

const MAGIC_CSS = `
.intro-page { position: relative; }

.intro-magic {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
  transition: opacity .6s;
}
.is-opening .intro-magic { opacity: 0; }
.intro-copy-block { position: relative; z-index: 2; }

/* ✨ Brillitos */
.sparkle {
  position: absolute;
  color: #fff1b8;
  filter: drop-shadow(0 0 6px #ffe48a) drop-shadow(0 0 14px rgba(255, 214, 120, .7));
  animation: twinkle 3.4s ease-in-out infinite, drift 7s ease-in-out infinite;
  opacity: 0;
}
@keyframes twinkle {
  0%, 100% { opacity: 0; transform: scale(.4) rotate(0deg); }
  50%      { opacity: 1; transform: scale(1) rotate(45deg); }
}
@keyframes drift {
  0%, 100% { translate: 0 0; }
  50%      { translate: 8px -14px; }
}
`;

function Sparkle({ x, y, s, d }) {
  return (
    <svg
      className="sparkle"
      style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${d}s` }}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" fill="currentColor" />
    </svg>
  );
}

export default function IntroPage() {
  const journey = useBookJourney();
  const opening = journey?.phase === "opening";
  const begin = journey?.begin;

  return <main className={`intro-page ${opening ? "is-opening" : ""}`}>
    <style>{MAGIC_CSS}</style>

    <div className="intro-atmosphere" aria-hidden="true" />

    <div className="intro-magic" aria-hidden="true">
      {SPARKLES.map((p, i) => <Sparkle key={i} {...p} />)}
      
    </div>

    <section className="intro-copy-block" aria-labelledby="intro-title">
      <h1 id="intro-title">La biblioteca de los recuerdos</h1>
      <p>Las historias están desapareciendo y sus páginas comienzan a quedar en blanco. Explorá tres mundos mágicos, recuperá sus recuerdos y devolvé la vida a este libro.</p>
      <button type="button" className="intro-start" disabled={opening} onClick={begin}>Comenzar <span aria-hidden="true">↗</span></button>
    </section>

    <div className="intro-vignette" aria-hidden="true" />
  </main>;
}