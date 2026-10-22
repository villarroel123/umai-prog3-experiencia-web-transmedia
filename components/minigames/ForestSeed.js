"use client";

import { useState } from "react";
import DragItem from "./DragItem";
import { StoryIcon } from "./art";

const steps = { sin_plantar: "acorn", plantada: "watering", regada: "sun" };
const labels = { acorn: "Bellota", watering: "Regadera", sun: "Sol" };

export default function ForestSeed({ onComplete, onFeedback, locked }) {
  const [stage, setStage] = useState("sin_plantar");

  function apply(item, target) {
    if (locked || target !== "soil" || stage === "iluminada") return;
    if (item !== steps[stage]) { onFeedback("El bosque necesita seguir cada paso en orden."); return; }
    if (stage === "sin_plantar") { setStage("plantada"); onFeedback("La bellota quedó plantada. Ahora necesita agua."); }
    if (stage === "plantada") { setStage("regada"); onFeedback("Apareció un brote. Acercale la luz del sol."); }
    if (stage === "regada") { setStage("iluminada"); onFeedback("El brote se convierte en un árbol."); onComplete(); }
  }

  return <div className={`game-stage seed-stage seed-stage-${stage}`}>
    <div className="seed-canopy" /><div className="seed-clearing">
      <div className="seed-tree"><span className="seed-tree-crown" /><span className="seed-tree-trunk" /><span className="seed-sprout" /></div>
      <div className="seed-soil" data-game-drop="soil" role="group" aria-label="Tierra para plantar, regar e iluminar"><span>TIERRA DEL BOSQUE</span></div>
    </div>
    <div className="seed-tools">
      {["acorn", "watering", "sun"].map((item) => <DragItem key={item} id={item} label={`${labels[item]}. Arrastrá a la tierra o pulsá para usar.`} className={item === steps[stage] ? "is-ready" : ""} disabled={locked || stage === "iluminada"} onDrop={apply} onClick={(id) => apply(id, "soil")}><StoryIcon name={item} /><span>{labels[item]}</span></DragItem>)}
    </div>
  </div>;
}
