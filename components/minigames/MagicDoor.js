"use client";

import { useRef, useState } from "react";

const destinations = [
  { name: "Puerto", color: "#42799a" },
  { name: "Mercado", color: "#d57752" },
  { name: "Bosque", color: "#6c9462" },
  { name: "Noche", color: "#7771a2" },
];
const correct = 2;

export default function MagicDoor({ onComplete, onFeedback, locked }) {
  const [choice, setChoice] = useState(0);
  const [open, setOpen] = useState(false);
  const [wrong, setWrong] = useState(false);
  const gesture = useRef(null);

  function turn(step) {
    if (locked || open) return;
    setChoice((value) => (value + step + 4) % 4);
    setWrong(false);
  }

  function tryDoor() {
    if (locked || open) return;
    if (choice !== correct) {
      setWrong(true);
      onFeedback("La puerta muestra otro mundo y vuelve a cerrarse. Buscá el paisaje verde.");
      return;
    }
    setOpen(true);
    onFeedback("La puerta se abre hacia las montañas y las flores.");
    onComplete();
  }

  return <div className={`game-stage door-stage ${open ? "is-open" : ""} ${wrong ? "is-wrong" : ""}`} style={{ "--door-glow": destinations[choice].color }}>
    <div className="door-clue"><span>La pista del camino</span><div className="door-clue-landscape"><i /><i /><i /></div><small>Montañas · flores · prado</small></div>
    <div className="door-landscape"><span>El camino verde</span></div>
    <div className="door-leaf">
      <div className="door-inlay" />
      <div className="door-knob" role="slider" tabIndex={locked || open ? -1 : 0} aria-label="Perilla de cuatro destinos" aria-valuemin={0} aria-valuemax={3} aria-valuenow={choice} aria-valuetext={destinations[choice].name}
        onKeyDown={(event) => { if (["ArrowRight", "ArrowUp"].includes(event.key)) { event.preventDefault(); turn(1); } if (["ArrowLeft", "ArrowDown"].includes(event.key)) { event.preventDefault(); turn(-1); } }}
        onPointerDown={(event) => { gesture.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerUp={(event) => { if (!gesture.current) return; const dx = event.clientX - gesture.current.x; const dy = event.clientY - gesture.current.y; turn(Math.abs(dx) + Math.abs(dy) < 8 ? 1 : dx + dy > 0 ? 1 : -1); gesture.current = null; }}>
        <span className="door-knob-pointer" style={{ transform: `rotate(${choice * 90}deg)` }} />
      </div>
    </div>
    <div className="door-controls"><button type="button" onClick={() => turn(-1)} disabled={locked || open} aria-label="Girar perilla a la izquierda">←</button><span style={{ color: destinations[choice].color }}>{destinations[choice].name}</span><button type="button" onClick={() => turn(1)} disabled={locked || open} aria-label="Girar perilla a la derecha">→</button><button type="button" className="game-check" onClick={tryDoor} disabled={locked || open}>Abrir puerta</button></div>
  </div>;
}
