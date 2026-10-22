"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MemoryRecovered from "@/components/MemoryRecovered";
import { games } from "@/components/minigames";

export default function MinigameView({ movie, memory, progress }) {
  const [started, setStarted] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState("");
  const wonRef = useRef(false);
  const timerRef = useRef(null);
  const status = progress.statusFor(memory.id);
  const recovered = status === "recovered" && !replaying && !celebrating;
  const Game = games[memory.id];

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function start() {
    clearTimeout(timerRef.current);
    wonRef.current = false;
    setFeedback("");
    setCelebrating(false);
    setReplaying(status === "recovered");
    setRound((value) => value + 1);
    setStarted(true);
    if (status === "pending") void progress.beginMemory(memory.id);
  }

  function finish() {
    if (wonRef.current) return;
    wonRef.current = true;
    setCelebrating(true);
    setFeedback("El recuerdo está volviendo al libro…");
    void progress.recoverMemory(memory.id);
    timerRef.current = setTimeout(() => {
      setCelebrating(false);
      setReplaying(false);
    }, 1600);
  }

  return <article className={"memory-story memory-story-" + movie.id} aria-labelledby="minigame-heading">
    <div className="story-crumb"><Link href={"/recuerdos/" + movie.id}>← Volver a {movie.title}</Link><span>LIBRO {movie.number} · RECUERDO {String(memory.id).toUpperCase().replaceAll("-", " ")}</span></div>
    <div className="memory-cover memory-game-cover">
      <div className={"memory-scenery memory-game-scenery game-theme-" + movie.id}>
        <Image src={movie.sceneImage} alt={movie.sceneAlt} fill sizes="(max-width: 760px) 100vw, 60vw" className="memory-scenery-image" priority />
        <div className="game-scene-wash" />
        {started && Game ? <Game key={round} memory={memory} onComplete={finish} onFeedback={setFeedback} locked={celebrating} /> :
          <div className="game-teaser">
            <div className={"game-teaser-art memory-shape-" + memory.imageShape}><Image src={memory.image} alt={memory.imageAlt} fill sizes="(max-width: 760px) 55vw, 28vw" /></div>
            <span>Una escena espera recuperar su recuerdo</span>
          </div>}
        {celebrating && <div className="game-success-scene" aria-hidden="true"><span className="game-success-glow" /><span className="game-success-dust" /></div>}
      </div>
      <div className="memory-paper memory-game-paper">
        <span className="page-botanical page-botanical-top" aria-hidden="true" />
        {recovered ? <MemoryRecovered movie={movie} memory={memory} syncState={progress.syncState} /> : <>
          <p className="book-folio">LIBRO {movie.number} · {started ? "RECUERDO EN JUEGO" : "RECUERDO PERDIDO"}</p>
          <h1 id="minigame-heading">{memory.title}</h1>
          <div className="ink-flourish" aria-hidden="true" />
          <p className="memory-description">{memory.description}</p>
          <div className={"memory-paper-art memory-shape-" + memory.imageShape}>
            <Image src={memory.image} alt={memory.imageAlt} fill sizes="(max-width: 760px) 45vw, 18vw" />
          </div>
          <div className="memory-instruction"><span>{started ? "TU MISIÓN" : "LA PISTA"}</span><strong>{memory.instruction}</strong></div>
          <p className="game-feedback" role="status" aria-live="polite">{feedback || (started ? "Explorá la escena. También podés usar los controles del teclado." : "Comenzá cuando estés listo para entrar en la escena.")}</p>
          <div className="memory-controls">
            {!started ? <button type="button" onClick={start}>Entrar en la escena ↗</button> :
              <button type="button" disabled={celebrating} onClick={start}>↺ Volver a intentar</button>}
          </div>
        </>}
        <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
      </div>
    </div>
    {recovered && <button type="button" className="minigame-replay" onClick={start}>↺ Repetir minijuego sin perder el recuerdo</button>}
  </article>;
}
