"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import MemoryRecovered from "@/components/MemoryRecovered";

export default function MinigameView({ movie, memory, progress }) {
  const [replaying, setReplaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const status = progress.statusFor(memory.id);
  const visibleStatus = replaying ? "in-progress" : status;

  async function begin() {
    setBusy(true);
    await progress.beginMemory(memory.id);
    setReplaying(true);
    setBusy(false);
  }

  async function complete() {
    setBusy(true);
    await progress.recoverMemory(memory.id);
    setReplaying(false);
    setBusy(false);
  }

  return <article className={"memory-story memory-story-" + movie.id} aria-labelledby="minigame-heading">
    <div className="story-crumb"><Link href={"/recuerdos/" + movie.id}>← Volver a {movie.title}</Link><span>LIBRO {movie.number} · RECUERDO {String(memory.id).toUpperCase().replaceAll("-", " ")}</span></div>
    <div className="memory-cover">
      <div className="memory-scenery">
        <Image src={movie.sceneImage} alt={movie.sceneAlt} fill sizes="(max-width: 760px) 100vw, 46vw" className="memory-scenery-image" priority />
        <div className={"memory-scenery-object memory-shape-" + memory.imageShape} aria-hidden="true">
          <Image src={memory.image} alt="" fill sizes="(max-width: 760px) 48vw, 24vw" />
        </div>
      </div>
      <div className="memory-paper">
        <span className="page-botanical page-botanical-top" aria-hidden="true" />
        {visibleStatus === "recovered" ? <MemoryRecovered movie={movie} memory={memory} syncState={progress.syncState} /> : <>
          <p className="book-folio">LIBRO {movie.number} · RECUERDO PERDIDO</p>
          <h1 id="minigame-heading">{memory.title}</h1>
          <div className="ink-flourish" aria-hidden="true" />
          <p className="memory-description">{memory.description}</p>
          <div className={"memory-paper-art memory-shape-" + memory.imageShape}>
            <Image src={memory.image} alt={memory.imageAlt} fill sizes="(max-width: 760px) 52vw, 20vw" />
          </div>
          <div className="memory-instruction"><span>LA PISTA</span><strong>{memory.instruction}</strong></div>
          <div className="memory-controls">
            {visibleStatus === "pending"
              ? <button type="button" disabled={busy} onClick={begin}>Comenzar ejercicio ↗</button>
              : <button type="button" disabled={busy} onClick={complete}>{busy ? "Guardando recuerdo…" : "Simular resolución correcta ✦"}</button>}
            <small>MODO DE DESARROLLO · {memory.interactionType.replaceAll("-", " ")}</small>
          </div>
        </>}
        <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
      </div>
    </div>
    {status === "recovered" && !replaying && <button type="button" className="minigame-replay" onClick={() => setReplaying(true)}>↺ Repetir prueba sin perder el recuerdo</button>}
  </article>;
}
