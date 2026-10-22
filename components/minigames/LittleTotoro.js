"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const base = [0, 1, 2];

export default function LittleTotoro({ memory, onComplete, onFeedback, locked }) {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 3));
  const [positions, setPositions] = useState(base);
  const [phase, setPhase] = useState("showing");
  const [missed, setMissed] = useState(-1);
  const timers = useRef([]);
  const targetRef = useRef(target);

  useEffect(() => {
    function later(callback, delay) { timers.current.push(setTimeout(callback, delay)); }
    later(() => setPhase("moving"), 1300);
    const swaps = [[0, 1], [1, 2], [0, 2]];
    swaps.forEach(([first, second], index) => later(() => setPositions((current) => {
      const next = [...current];
      [next[first], next[second]] = [next[second], next[first]];
      return next;
    }), 1600 + index * 850));
    later(() => setPhase("choosing"), 4300);
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [target]);

  function restart() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPositions(base);
    setMissed(-1);
    setPhase("showing");
    const next = (targetRef.current + 1 + Math.floor(Math.random() * 2)) % 3;
    targetRef.current = next;
    setTarget(next);
    onFeedback("Mirá detrás de qué arbusto aparece y seguí su movimiento.");
  }

  function choose(id) {
    if (locked || phase !== "choosing") return;
    if (id !== target) {
      setMissed(id);
      setPhase("missed");
      onFeedback("Totoro no está allí. Las hojas se mueven; podés mirar otra vez.");
      return;
    }
    setPhase("found");
    onFeedback("El pequeño espíritu vuelve a aparecer.");
    onComplete();
  }

  return <div className={`game-stage little-stage little-stage-${phase}`}>
    <div className="little-canopy" />
    {base.map((id) => <button type="button" key={id} className={`little-bush ${missed === id ? "is-missed" : ""} ${phase === "found" && target === id ? "is-found" : ""}`} style={{ left: `${8 + positions[id] * 30}%` }} onClick={() => choose(id)} disabled={locked || phase !== "choosing"} aria-label={`Arbusto ${positions[id] + 1}`}>
      {(id === target && (phase === "showing" || phase === "found")) && <Image src={memory.image} alt="Pequeño Totoro blanco" width={84} height={100} className="little-spirit" />}
      <span className="little-bush-leaves" /><span className="little-bush-ground" />
    </button>)}
    <p className="little-cue">{phase === "showing" ? "Observá dónde aparece…" : phase === "moving" ? "Seguí ese arbusto…" : phase === "choosing" ? "¿Dónde se escondió?" : phase === "missed" ? "Las hojas guardan otra oportunidad" : "¡Lo encontraste!"}</p>
    {phase === "missed" && <button type="button" className="game-check little-retry" onClick={restart}>Mirar otra vez</button>}
  </div>;
}
