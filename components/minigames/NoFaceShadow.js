"use client";

import Image from "next/image";
import { useState } from "react";

export default function NoFaceShadow({ memory, onComplete, onFeedback, locked }) {
  const [correct] = useState(() => Math.floor(Math.random() * 4));
  const [wrong, setWrong] = useState(-1);
  const [found, setFound] = useState(false);

  function choose(index) {
    if (locked || found) return;
    if (index !== correct) {
      setWrong(index);
      onFeedback("Esa no es su sombra. Intentá otra vez.");
      return;
    }
    setFound(true);
    onFeedback("La máscara brilla detrás del papel.");
    onComplete();
  }

  return <div className="game-stage noface-stage">
    <div className="noface-lantern noface-lantern-left" /><div className="noface-lantern noface-lantern-right" />
    <div className="noface-panels">
      {[0, 1, 2, 3].map((index) => <button key={index} type="button" className={`noface-panel ${wrong === index ? "is-wrong" : ""} ${found && correct === index ? "is-found" : ""}`} onClick={() => choose(index)} aria-label={`Silueta ${index + 1}`} disabled={locked || found}>
        <span className={`noface-silhouette noface-silhouette-${index === correct ? "spirit" : ["fan", "bird", "vase"][index % 3]}`} />
        {index === correct && found && <Image src={memory.image} alt="Sin Cara revelado" fill sizes="150px" className="noface-reveal" />}
        <span className="noface-panel-number">0{index + 1}</span>
      </button>)}
    </div>
  </div>;
}
