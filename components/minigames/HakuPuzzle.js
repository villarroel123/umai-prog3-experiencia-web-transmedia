"use client";

import Image from "next/image";
import { useState } from "react";
import DragItem from "./DragItem";
import { shuffle } from "./art";

function pieceStyle(index) {
  return { backgroundImage: "url('/images/minigames/haku-river.svg')", backgroundSize: "300% 200%", backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 100}%` };
}

export default function HakuPuzzle({ memory, onComplete, onFeedback, locked }) {
  const [tray] = useState(() => shuffle([0, 1, 2, 3, 4, 5]));
  const [placed, setPlaced] = useState([]);
  const [selected, setSelected] = useState(null);
  const [solved, setSolved] = useState(false);

  function put(piece, cell) {
    if (locked || solved || placed.includes(piece) || placed.includes(cell)) return;
    if (piece !== cell) {
      onFeedback("Esa parte del río pertenece a otro lugar. Probá otra posición.");
      return;
    }
    const next = [...placed, piece];
    setPlaced(next);
    setSelected(null);
    onFeedback(`${next.length} de 6 fragmentos reunidos.`);
    if (next.length === 6) {
      setSolved(true);
      onComplete();
    }
  }

  return <div className={`game-stage haku-stage ${solved ? "is-solved" : ""}`}>
    <div className="haku-board" role="group" aria-label="Rompecabezas del río, seis posiciones">
      {[0, 1, 2, 3, 4, 5].map((cell) => <button key={cell} type="button" data-game-drop={`cell-${cell}`} className={`haku-cell ${placed.includes(cell) ? "is-placed" : ""}`} style={placed.includes(cell) ? pieceStyle(cell) : undefined} onClick={() => selected !== null && put(selected, cell)} disabled={locked || solved} aria-label={`Posición ${cell + 1}${placed.includes(cell) ? ", completa" : ", vacía"}`} />)}
      {solved && <Image src={memory.image} alt="Haku aparece sobre el río" width={260} height={180} className="haku-dragon" />}
    </div>
    <div className="haku-tray" role="group" aria-label="Fragmentos para colocar">
      {tray.filter((piece) => !placed.includes(piece)).map((piece) => <DragItem key={piece} id={piece} label={`Fragmento ${piece + 1}. Seleccionalo y elegí su posición o arrastralo.`} className={`haku-piece ${selected === piece ? "is-selected" : ""}`} disabled={locked || solved} onClick={() => setSelected(piece)} onDrop={(item, target) => put(item, Number(target.replace("cell-", "")))}><span style={pieceStyle(piece)} /></DragItem>)}
    </div>
  </div>;
}
