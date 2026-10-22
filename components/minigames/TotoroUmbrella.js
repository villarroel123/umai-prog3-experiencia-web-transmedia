"use client";

import Image from "next/image";
import { useState } from "react";
import DragItem from "./DragItem";
import { StoryIcon } from "./art";

const objects = [
  { id: "umbrella", label: "Paraguas" },
  { id: "hat", label: "Sombrero" },
  { id: "bag", label: "Bolsa" },
  { id: "lantern", label: "Farol" },
];

export default function TotoroUmbrella({ memory, onComplete, onFeedback, locked }) {
  const [selected, setSelected] = useState(null);
  const [sheltered, setSheltered] = useState(false);

  function deliver(item, target) {
    if (locked || sheltered || target !== "totoro") return;
    if (item !== "umbrella") {
      onFeedback("Ese objeto vuelve a su lugar. Totoro necesita algo que detenga la lluvia.");
      setSelected(null);
      return;
    }
    setSheltered(true);
    onFeedback("Totoro abre el paraguas y salta bajo la lluvia.");
    onComplete();
  }

  return <div className={`game-stage umbrella-stage ${sheltered ? "is-sheltered" : ""}`}>
    <div className="umbrella-rain" /><div className="umbrella-stop-sign">バス停</div>
    <button type="button" className="umbrella-totoro" data-game-drop="totoro" onClick={() => selected && deliver(selected, "totoro")} disabled={locked || sheltered} aria-label="Totoro espera en la parada. Seleccioná un objeto y pulsá aquí, o arrastralo.">
      <Image src="/images/scenes/totoro-character.png" alt="Totoro bajo la lluvia" fill sizes="220px" />
      {sheltered && <Image src={memory.image} alt="Paraguas abierto" width={145} height={125} className="umbrella-held" />}
    </button>
    <div className="umbrella-objects">
      {objects.map((object) => <DragItem key={object.id} id={object.id} label={`${object.label}. Seleccionalo y pulsá sobre Totoro, o arrastralo.`} className={selected === object.id ? "is-selected" : ""} disabled={locked || sheltered} onClick={setSelected} onDrop={deliver}>
        {object.id === "umbrella" ? <Image src={memory.image} alt="" width={54} height={54} /> : <StoryIcon name={object.id} />}
        <span>{object.label}</span>
      </DragItem>)}
    </div>
  </div>;
}
