"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const memories = [
  { id: "chihiro", title: "El boleto de los recuerdos", image: "/images/experiences/chihiro/boleto-recuperado.webp", alt: "Boleto de tren recuperado", spread: "restored" },
  { id: "howl", title: "La carta que nunca enviaste", image: "/images/experiences/howl/sobre-cerrado.webp", alt: "Carta en su sobre sellado", spread: "howlRestored" },
  { id: "totoro", title: "El recuerdo de la infancia", image: "/images/experiences/totoro/hoja.webp", alt: "Hoja especial del bosque", spread: "totoroRestored" },
];

export default function FinalBookPages({ progress, journey, preview = false }) {
  const [revealed, setRevealed] = useState(0);
  const active = journey?.spread === "finale" && !journey?.turn && !preview;
  useEffect(() => {
    if (!active || !progress.overall.finalUnlocked) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { queueMicrotask(() => setRevealed(3)); return; }
    const timers = [1, 2, 3].map((count, index) => window.setTimeout(() => setRevealed(count), 450 + index * 620));
    return () => timers.forEach(window.clearTimeout);
  }, [active, progress.overall.finalUnlocked]);
  const unlocked = progress.overall.finalUnlocked;
  return <div className="storybook-cover"><div className="storybook-pages">
    <div className="storybook-page storybook-title-page book-finale-left">
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <p className="book-folio">LIBRO DE LOS MUNDOS · VOL. I</p>
      <h2>{unlocked ? "Tres historias, tres recuerdos" : "Una página por descubrir"}</h2>
      <div className="book-finale-objects">
        {unlocked ? memories.map((memory, index) => <button type="button" key={memory.id} className={`book-finale-object${!active || index < revealed ? " is-revealed" : ""}`} onClick={() => journey?.turnTo(memory.spread)} disabled={preview || (active && index >= revealed)} aria-label={`Abrir ${memory.title}`}>
          <span className="book-finale-object-image"><Image src={memory.image} alt={memory.alt} width={400} height={300} sizes="(max-width: 700px) 26vw, 10vw" /></span>
          <span>{memory.title}</span>
        </button>) : <p>Completá los tres recuerdos para abrir esta página.</p>}
      </div>
      <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
    </div>
    <div className="storybook-page storybook-index-page book-finale-right">
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <p className="book-folio">ÚLTIMA PÁGINA · {progress.overall.savedCount} / 3</p>
      <h1>Mi biblioteca<br /><em>de los recuerdos</em></h1>
      <div className="ink-flourish" aria-hidden="true" />
      {unlocked ? <p>Cada historia nos deja un recuerdo. Ahora, este libro también guarda los tuyos.</p> : <p>Cuando recuperes el boleto, la carta y la hoja, esta última página se llenará de vida.</p>}
      <button type="button" className="book-chapter-start" onClick={() => journey?.turnTo("contents")} disabled={preview}>Volver al índice <span aria-hidden="true">→</span></button>
      <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
    </div>
  </div></div>;
}
