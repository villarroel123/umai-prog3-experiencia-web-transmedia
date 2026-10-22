"use client";

import Image from "next/image";
import { useState } from "react";
import DragItem from "./DragItem";
import { StoryIcon } from "./art";

export default function CalciferHearth({ memory, onComplete, onFeedback, locked }) {
  const [logs, setLogs] = useState([]);
  const [lit, setLit] = useState(false);

  function add(item, target) {
    if (locked || lit || target !== "hearth") return;
    if (item === "spark") {
      if (logs.length !== 3) {
        onFeedback("Primero colocá los tres troncos dentro de la chimenea.");
        return;
      }
      setLit(true);
      onFeedback("La chispa despierta a Calcifer.");
      onComplete();
      return;
    }
    if (logs.includes(item)) return;
    const next = [...logs, item];
    setLogs(next);
    onFeedback(next.length === 3 ? "La leña está lista. Llevá la chispa al hogar." : `${next.length} de 3 troncos colocados.`);
  }

  return <div className={`game-stage calcifer-stage ${lit ? "is-lit" : ""}`}>
    <div className="calcifer-stones"><div className="calcifer-hearth" data-game-drop="hearth" role="group" aria-label="Chimenea, zona para colocar leña y chispa">
      <div className="calcifer-firebox">
        {logs.map((log) => <span key={log} className="calcifer-placed-log" />)}
        {lit && <Image src={memory.image} alt="Calcifer despierto" width={160} height={180} className="calcifer-awake" />}
      </div>
    </div></div>
    <div className="calcifer-tools">
      {[0, 1, 2].filter((id) => !logs.includes(`log-${id}`)).map((id) => <DragItem key={id} id={`log-${id}`} label={`Tronco ${id + 1}. Arrastralo a la chimenea o pulsá para colocarlo.`} className="calcifer-log" disabled={locked || lit} onDrop={add} onClick={(item) => add(item, "hearth")}><span /></DragItem>)}
      {!lit && <DragItem id="spark" label="Chispa mágica. Usala después de los tres troncos." className={`calcifer-spark ${logs.length === 3 ? "is-ready" : ""}`} disabled={locked} onDrop={add} onClick={(item) => add(item, "hearth")}><StoryIcon name="spark" /></DragItem>}
    </div>
  </div>;
}
