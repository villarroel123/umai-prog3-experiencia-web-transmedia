"use client";

import Image from "next/image";
import { useState } from "react";
import DragItem from "./DragItem";
import { shuffle, ZenibaMoment } from "./art";

const story = [
  { id: "arrival", title: "La llegada" },
  { id: "making", title: "El regalo" },
  { id: "gift", title: "La despedida" },
];
const answer = story.map((scene) => scene.id);

export default function ZenibaSequence({ memory, onComplete, onFeedback, locked }) {
  const [order, setOrder] = useState(() => {
    const initial = shuffle(answer);
    return initial.every((id, index) => id === answer[index]) ? [...initial].reverse() : initial;
  });
  const [solved, setSolved] = useState(false);

  function move(fromId, to) {
    if (locked || solved || !Number.isInteger(to) || to < 0 || to > 2) return;
    const next = [...order];
    const from = next.indexOf(fromId);
    [next[from], next[to]] = [next[to], next[from]];
    setOrder(next);
    onFeedback("Las escenas cambiaron de lugar. Comprobá cuando estén en orden.");
  }

  function check() {
    if (locked || solved) return;
    if (!order.every((id, index) => id === answer[index])) {
      onFeedback("El orden todavía no cuenta la historia. Podés intercambiar las escenas.");
      return;
    }
    setSolved(true);
    onFeedback("Las tres escenas se unen y aparece la cinta.");
    onComplete();
  }

  return <div className={`game-stage zeniba-stage ${solved ? "is-solved" : ""}`}>
    <div className="zeniba-table">
      <div className="zeniba-sequence">
        {order.map((id, slot) => {
          const scene = story.find((item) => item.id === id);
          return <div key={slot} className="zeniba-slot" data-game-drop={`slot-${slot}`}>
            <span className="zeniba-slot-number">{slot + 1}</span>
            <DragItem id={id} label={`${scene.title}. Arrastrá o usá las flechas para mover la escena.`} className="zeniba-card" disabled={locked || solved} onDrop={(item, target) => move(item, Number(target.replace("slot-", "")))}>
              <ZenibaMoment kind={id} /><span>{scene.title}</span>
            </DragItem>
            <div className="zeniba-move"><button type="button" disabled={slot === 0 || locked || solved} aria-label={`Mover ${scene.title} a la izquierda`} onClick={() => move(id, slot - 1)}>←</button><button type="button" disabled={slot === 2 || locked || solved} aria-label={`Mover ${scene.title} a la derecha`} onClick={() => move(id, slot + 1)}>→</button></div>
          </div>;
        })}
      </div>
      <button type="button" className="game-check" onClick={check} disabled={locked || solved}>Comprobar el recuerdo ✧</button>
      {solved && <div className="zeniba-ribbon"><Image src={memory.image} alt="Cinta de Zeniba" fill sizes="130px" /></div>}
    </div>
  </div>;
}
