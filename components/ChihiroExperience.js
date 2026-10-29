"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { chapterExperiences } from "@/data/chapterExperiences";

const experience = chapterExperiences.chihiro;
const ticketImage = experience.objectImage;
const pieceOrder = [2, 0, 3, 1];
const positions = ["0% 0%", "100% 0%", "0% 100%", "100% 100%"];
const emptyPieces = [false, false, false, false];
const PIECES_KEY = "biblioteca-boleto-piezas-v1";
const DRAFT_KEY = "biblioteca-boleto-borrador-v1";

function ticketStyle(index) {
  return { backgroundImage: `url('${ticketImage}')`, backgroundPosition: positions[index] };
}

export default function ChihiroExperience({ movie, progress }) {
  const router = useRouter();
  const chapter = progress.chapter("chihiro");
  const [phase, setPhase] = useState(() => chapter.saved ? "saved" : chapter.gameComplete ? "object" : "game");
  const [placed, setPlaced] = useState(emptyPieces);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const placedRef = useRef(emptyPieces);
  const submittingRef = useRef(false);
  const userSuffix = progress.authUser?.uid || "local";
  const piecesStorageKey = `${PIECES_KEY}:${userSuffix}`;
  const draftStorageKey = `${DRAFT_KEY}:${userSuffix}`;

  useEffect(() => {
    if (chapter.gameComplete) return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(piecesStorageKey) || "null");
      if (Array.isArray(saved) && saved.length === 4) {
        const next = saved.map((item) => item === true);
        placedRef.current = next;
        queueMicrotask(() => setPlaced(next));
      }
    } catch { /* Las piezas se pueden volver a colocar. */ }
  }, [chapter.gameComplete, piecesStorageKey]);

  useEffect(() => {
    if (chapter.saved) return;
    try {
      const draft = window.localStorage.getItem(draftStorageKey);
      if (draft) queueMicrotask(() => setAnswer(draft.slice(0, 500)));
    } catch { /* El formulario sigue disponible sin almacenamiento local. */ }
  }, [chapter.saved, draftStorageKey]);

  useEffect(() => {
    if (phase !== "object") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(() => setPhase("question"), reduceMotion ? 0 : 1800);
    return () => window.clearTimeout(timeout);
  }, [phase]);

  async function placePiece(index, slot) {
    if (phase !== "game" || !Number.isInteger(index) || index < 0 || index > 3 || placedRef.current[index]) return;
    if (index !== slot) {
      setFeedback("Esa pieza encaja en otro lugar. Probá con otro espacio.");
      return;
    }
    const next = [...placedRef.current];
    next[index] = true;
    placedRef.current = next;
    setPlaced(next);
    setSelected(null);
    setFeedback("La pieza encontró su lugar.");
    if (next.every(Boolean)) {
      const saved = await progress.completeGame("chihiro");
      if (!saved) {
        placedRef.current = placedRef.current.map((item, piece) => piece === index ? false : item);
        setPlaced(placedRef.current);
        return;
      }
      try { window.localStorage.removeItem(piecesStorageKey); } catch { /* Sin guardado local de piezas. */ }
      setPhase("object");
    } else {
      try { window.localStorage.setItem(piecesStorageKey, JSON.stringify(next)); } catch { /* Sin guardado local de piezas. */ }
    }
  }

  function changeAnswer(value) {
    const next = value.slice(0, 500);
    setAnswer(next);
    try { window.localStorage.setItem(draftStorageKey, next); } catch { /* El texto aún se puede enviar. */ }
  }

  async function saveAnswer(event) {
    event.preventDefault();
    if (submittingRef.current || !answer.trim() || !chapter.gameComplete) return;
    submittingRef.current = true;
    setSaving(true);
    const saved = await progress.saveAnswer("chihiro", answer);
    if (!saved) {
      submittingRef.current = false;
      setSaving(false);
      setFeedback("No se pudo guardar el recuerdo. Intentá nuevamente.");
      return;
    }
    try { window.localStorage.removeItem(draftStorageKey); } catch { /* La respuesta ya está guardada. */ }
    setPhase("travelling");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => router.push("/biblioteca?pagina=chihiro&animar=1"), reduceMotion ? 0 : 1200);
  }

  const recovered = phase !== "game";
  return <article className={`chihiro-experience chihiro-phase-${phase}`} aria-labelledby="chihiro-experience-heading">
    <div className="story-crumb"><Link href="/recuerdos/chihiro">← Volver al capítulo</Link><span>CAPÍTULO 01 · EL BOLETO</span></div>
    <div className="chihiro-stage">
      <Image src={phase === "game" ? "/images/experiences/chihiro/mesa-del-boleto.webp" : movie.sceneImage} alt="" fill sizes="100vw" className="chihiro-stage-image" priority />
      <div className="chihiro-stage-shade" />
      {phase === "game" ? <div className="ticket-game">
        <header className="ticket-game-heading"><p>EL VIAJE DE CHIHIRO · 01</p><h1 id="chihiro-experience-heading">El boleto de los recuerdos</h1><span>Uní las cuatro piezas del boleto. Arrastralas o seleccioná una pieza y después su lugar.</span></header>
        <div className="ticket-puzzle" aria-label="Reconstruir el boleto de tren">
          <div className="ticket-board" aria-label="Espacios del boleto">
            {emptyPieces.map((_, index) => <button key={index} type="button" className={`ticket-slot ${placed[index] ? "is-filled" : ""}`} onClick={() => selected !== null && placePiece(selected, index)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); placePiece(Number(event.dataTransfer.getData("text/plain")), index); }} aria-label={`Espacio ${index + 1} del boleto${placed[index] ? ", pieza colocada" : ", vacío"}`} disabled={placed[index]}>
              {placed[index] && <span className="ticket-fragment" style={ticketStyle(index)} aria-hidden="true" />}
            </button>)}
          </div>
          <div className="ticket-tray" aria-label="Piezas disponibles">
            {pieceOrder.filter((index) => !placed[index]).map((index) => <button key={index} type="button" draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", String(index)); setSelected(index); }} onClick={() => { setSelected(index); setFeedback(`Pieza ${index + 1} seleccionada. Elegí su espacio en el boleto.`); }} className={`ticket-piece ${selected === index ? "is-selected" : ""}`} aria-pressed={selected === index} aria-label={`Seleccionar pieza ${index + 1} del boleto`}>
              <span className="ticket-fragment" style={ticketStyle(index)} aria-hidden="true" /><small>{index + 1}</small>
            </button>)}
          </div>
          <p className="ticket-feedback" role="status">{feedback || `${placed.filter(Boolean).length} de 4 piezas unidas`}</p>
        </div>
      </div> : <div className="ticket-reveal">
        <p className="ticket-reveal-kicker">{phase === "saved" ? "RECUERDO GUARDADO" : phase === "travelling" ? "EL RECUERDO VIAJA AL LIBRO" : "OBJETO RECUPERADO"}</p>
        <h1 id="chihiro-experience-heading">El boleto de los recuerdos</h1>
        <div className="ticket-reveal-art"><Image src={ticketImage} alt="Boleto antiguo reconstruido, ilustrado con un tren y flores" width={930} height={423} sizes="(max-width: 800px) 88vw, 660px" priority />{(phase === "travelling" || phase === "saved") && <span className="ticket-written-answer">{chapter.answer.slice(0, 90)}{chapter.answer.length > 90 ? "…" : ""}</span>}<span className="ticket-sparkles" aria-hidden="true" /></div>
        {phase === "object" && <button type="button" className="ticket-skip" onClick={() => setPhase("question")}>Continuar sin esperar →</button>}
        {phase === "question" && <form className="ticket-question" onSubmit={saveAnswer}>
          <label htmlFor="chihiro-answer">{experience.question}</label>
          <textarea id="chihiro-answer" value={answer} onChange={(event) => changeAnswer(event.target.value)} maxLength={500} rows={3} placeholder="Escribí tu recuerdo..." required />
          <div className="ticket-form-foot"><small>{answer.length}/500</small><button type="submit" disabled={!answer.trim() || saving}>{saving ? "Guardando…" : "Guardar recuerdo"}</button></div>
          {feedback.startsWith("No se pudo") && <p role="alert">{feedback}</p>}
        </form>}
        {phase === "travelling" && <button type="button" className="ticket-skip" onClick={() => router.push("/biblioteca?pagina=chihiro&animar=1")}>Abrir el libro ahora →</button>}
        {phase === "saved" && <Link className="chapter-start" href="/biblioteca?pagina=chihiro">Abrir mi página <span aria-hidden="true">↗</span></Link>}
      </div>}
    </div>
  </article>;
}
