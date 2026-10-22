"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { shuffle, StoryIcon } from "./art";

const pairs = ["star", "key", "feather"];
const labels = { star: "Estrella", key: "Llave antigua", feather: "Pluma" };

export default function HowlPairs({ memory, onComplete, onFeedback, locked }) {
  const [cards] = useState(() => shuffle(pairs.flatMap((name) => [{ id: name + "-1", name }, { id: name + "-2", name }])));
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  function flip(card) {
    if (locked || waiting || matched.includes(card.name) || open.some((item) => item.id === card.id)) return;
    if (open.length === 0) { setOpen([card]); return; }
    setOpen([open[0], card]);
    if (open[0].name === card.name) {
      const next = [...matched, card.name];
      setMatched(next);
      setOpen([]);
      onFeedback(`${next.length} de 3 parejas encontradas.`);
      if (next.length === 3) onComplete();
    } else {
      setWaiting(true);
      onFeedback("Las cartas son distintas. Miralas un instante y seguí buscando.");
      timer.current = setTimeout(() => { setOpen([]); setWaiting(false); }, 1000);
    }
  }

  return <div className="game-stage pairs-stage"><div className="pairs-table">
    {cards.map((card) => {
      const revealed = matched.includes(card.name) || open.some((item) => item.id === card.id);
      return <button key={card.id} type="button" className={`pair-card ${revealed ? "is-revealed" : ""} ${matched.includes(card.name) ? "is-matched" : ""}`} onClick={() => flip(card)} disabled={locked || matched.includes(card.name)} aria-label={revealed ? labels[card.name] : "Carta boca abajo"} aria-pressed={revealed}>
        <span className="pair-card-back" aria-hidden="true">✧</span><span className="pair-card-front" aria-hidden="true"><StoryIcon name={card.name} /><small>{labels[card.name]}</small></span>
      </button>;
    })}
  </div><span className="pairs-progress">{matched.length} / 3 parejas</span>
    {matched.length === 3 && <div className="pairs-jewelbox"><Image src={memory.image} alt="Pendiente verde de Howl" width={120} height={130} /></div>}
  </div>;
}
