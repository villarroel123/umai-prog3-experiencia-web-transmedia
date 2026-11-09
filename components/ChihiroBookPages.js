"use client";
import ShareMemoryActions from "@/components/ShareMemoryActions";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { chapterExperiences } from "@/data/chapterExperiences";
import { experienceThemes } from "@/data/experienceThemes";
import ExperienceGameSpread from "@/components/ExperienceGameSpread";
import MemoryRestoration, { MemoryRestorationArt, MemoryRestorationPreview } from "@/components/MemoryRestoration";
import MagicalInk from "@/components/MagicalInk";
import { markMemoryInkPending } from "@/data/memoryAnimations";

const experience = chapterExperiences.chihiro;
const ticketImage = experience.objectImage;
const order = [2, 0, 3, 1];
const positions = ["0% 0%", "100% 0%", "0% 100%", "100% 100%"];
const empty = [false, false, false, false];
const piecesKey = "biblioteca-boleto-piezas-v1";
const draftKey = "biblioteca-boleto-borrador-v1";

function fragmentStyle(index) {
  return { backgroundImage: `url('${ticketImage}')`, backgroundPosition: positions[index] };
}

function TicketPuzzle({ progress, journey, preview }) {
  const chapter = progress.chapter("chihiro");
  const [placed, setPlaced] = useState(empty);
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [completed, setCompleted] = useState(false);
  const placedRef = useRef(empty);
  const dragRef = useRef(null);
  const rootRef = useRef(null);
  const completionRef = useRef(false);
  const key = `${piecesKey}:${progress.authUser?.uid || "local"}`;

  useEffect(() => {
    if (preview) return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(key) || "null");
      if (Array.isArray(saved) && saved.length === 4) {
        const next = saved.map((item) => item === true);
        placedRef.current = next;
        queueMicrotask(() => setPlaced(next));
      }
    } catch { /* El juego puede comenzar desde cero. */ }
  }, [key, preview]);

  async function place(index, slot) {
    if (preview || completionRef.current || index !== slot || placedRef.current[index]) {
      if (index !== slot) setFeedback("Esa pieza corresponde a otro lugar del boleto.");
      return;
    }
    const next = [...placedRef.current];
    next[index] = true;
    placedRef.current = next;
    setPlaced(next);
    setSelected(null);
    setFeedback("La pieza encontró su lugar.");
    if (!next.every(Boolean)) {
      try { window.localStorage.setItem(key, JSON.stringify(next)); } catch { /* La partida continúa sin almacenamiento. */ }
      return;
    }
    completionRef.current = true;
    const saved = await progress.completeGame("chihiro");
    if (!saved) {
      completionRef.current = false;
      const reverted = next.map((value, position) => position === index ? false : value);
      placedRef.current = reverted;
      setPlaced(reverted);
      setFeedback("No se pudo guardar el boleto. Intentá nuevamente.");
      return;
    }
    try { window.localStorage.removeItem(key); } catch { /* El progreso ya fue guardado. */ }
    setCompleted(true);
    window.setTimeout(() => journey?.turnTo("object"), 1050);
  }

  function pointerDown(event, index) {
    if (preview || placed[index]) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { index, x: event.clientX, y: event.clientY };
    setSelected(index);
  }
  function pointerMove(event) {
    const active = dragRef.current;
    if (!active) return;
    setDragging({ index: active.index, x: event.clientX - active.x, y: event.clientY - active.y });
  }
  function pointerUp(event) {
    const active = dragRef.current;
    if (!active) return;
    dragRef.current = null;
    const slots = [...(rootRef.current?.querySelectorAll("[data-ticket-slot]") || [])];
    const nearest = slots.map((slot) => {
      const rect = slot.getBoundingClientRect();
      const x = Math.max(rect.left, Math.min(event.clientX, rect.right));
      const y = Math.max(rect.top, Math.min(event.clientY, rect.bottom));
      return { index: Number(slot.dataset.ticketSlot), distance: Math.hypot(event.clientX - x, event.clientY - y) };
    }).sort((a, b) => a.distance - b.distance)[0];
    if (nearest && nearest.distance < 48 && (Math.abs(event.clientX - active.x) > 8 || Math.abs(event.clientY - active.y) > 8)) place(active.index, nearest.index);
    setDragging(null);
  }

  return <div ref={rootRef} className={`book-ticket-game${completed ? " is-complete" : ""}`}>
    <div className="book-ticket-board" aria-label="Silueta del boleto con cuatro espacios">
      {empty.map((_, index) => <button key={index} type="button" data-ticket-slot={index} className={`book-ticket-slot${placed[index] ? " is-filled" : ""}`} onClick={() => selected !== null && place(selected, index)} disabled={preview || placed[index] || completed} aria-label={`Espacio ${index + 1}${placed[index] ? ", pieza colocada" : ""}`}>
        {placed[index] && <span className="book-ticket-fragment" style={fragmentStyle(index)} aria-hidden="true" />}
      </button>)}
      {completed && <span className="book-ticket-sparkles" aria-hidden="true">✦ ✧ ✦</span>}
    </div>
    <div className="book-ticket-tray" aria-label="Piezas del boleto">
      {order.filter((index) => !placed[index]).map((index) => <button key={index} type="button" className={`book-ticket-piece${selected === index ? " is-selected" : ""}`} onPointerDown={(event) => pointerDown(event, index)} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => { dragRef.current = null; setDragging(null); }} onClick={() => setSelected(index)} disabled={preview || completed} aria-pressed={selected === index} aria-label={`Seleccionar pieza ${index + 1}`} style={dragging?.index === index ? { transform: `translate(${dragging.x}px, ${dragging.y}px) scale(1.06)`, zIndex: 12 } : undefined}>
        <span className="book-ticket-fragment" style={fragmentStyle(index)} aria-hidden="true" />
      </button>)}
    </div>
    <p className="book-ticket-feedback" role="status">{completed ? "¡Boleto recuperado!" : feedback || `${placed.filter(Boolean).length} de 4 piezas colocadas`}</p>
    {!preview && <p className="book-ticket-accessibility">Arrastrá cada pieza o seleccionala y tocá su espacio.</p>}
    {chapter.gameComplete && !completed && !preview && <button className="book-ticket-continue" type="button" onClick={() => journey?.turnTo("object")}>Ver el boleto recuperado →</button>}
  </div>;
}

function ObjectQuestion({ progress, journey, preview }) {
  const chapter = progress.chapter("chihiro");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [feedback, setFeedback] = useState("");
  const submitted = useRef(false);
  const key = `${draftKey}:${progress.authUser?.uid || "local"}`;
  const transitionPreview = preview && journey?.turn?.source === "object" && journey?.turn?.target === "restored";
  const showingAnimation = restoring || transitionPreview;
  useEffect(() => {
    if (preview || chapter.saved) return;
    try {
      const saved = window.localStorage.getItem(key);
      if (saved) queueMicrotask(() => setAnswer(saved.slice(0, 500)));
    } catch { /* El formulario sigue disponible. */ }
  }, [chapter.saved, key, preview]);
  async function save(event) {
    event.preventDefault();
    if (submitted.current || !answer.trim() || !chapter.gameComplete) return;
    submitted.current = true;
    setSaving(true);
    const success = await progress.saveAnswer("chihiro", answer);
    if (!success) {
      submitted.current = false;
      setSaving(false);
      setFeedback("No se pudo guardar el recuerdo. Intentá nuevamente.");
      return;
    }
    try { window.localStorage.removeItem(key); } catch { /* La respuesta ya está guardada. */ }
    setRestoring(true);
  }
  return <>
    <div className={`storybook-page storybook-title-page book-object-left${restoring ? " is-restoring" : ""}`}>
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      {showingAnimation ? <MemoryRestorationArt theme={experienceThemes.chihiro} /> : <>
        <div className="book-object-ticket"><Image src={ticketImage} alt="Boleto de tren antiguo recuperado" width={707} height={274} sizes="(max-width: 700px) 83vw, 37vw" priority /><span className="book-object-glow" aria-hidden="true" /></div>
        <p className="book-art-caption">El boleto de los recuerdos</p>
      </>}
      <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
    </div>
    <div className={`storybook-page storybook-index-page book-object-right${showingAnimation ? " memory-restoration-page" : ""}`}>
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <h1>Un recuerdo para conservar</h1>
      {showingAnimation ? (transitionPreview ? <MemoryRestorationPreview /> : <MemoryRestoration chapterId="chihiro" onComplete={() => { markMemoryInkPending("chihiro"); journey?.turnTo("restored"); }} />) : <>
      <div className="book-object-ticket-mobile"><Image src={ticketImage} alt="Boleto recuperado" width={707} height={274} sizes="(max-width: 700px) 45vw" /></div>
      <p>{experience.question}</p>
      {!chapter.gameComplete ? <button className="book-chapter-start" onClick={() => journey?.turnTo("game")}>Reconstruir el boleto →</button> : <form onSubmit={save}>
        <label htmlFor="book-chihiro-answer" className="sr-only">Tu recuerdo personal</label>
        <textarea id="book-chihiro-answer" value={answer} onChange={(event) => { const value = event.target.value.slice(0, 500); setAnswer(value); try { window.localStorage.setItem(key, value); } catch { /* Se puede enviar sin borrador. */ } }} placeholder="Escribí tu recuerdo..." rows={5} maxLength={500} required disabled={preview || restoring || chapter.saved} />
        <small>{answer.length} / 500</small>
        <button className="book-chapter-start" type="submit" disabled={preview || !answer.trim() || saving || chapter.saved}>{saving ? "Guardando…" : "Guardar recuerdo"}</button>
        {feedback && <p role="alert">{feedback}</p>}
      </form>}
      {chapter.saved && !restoring && !preview && <button className="book-chapter-start" type="button" onClick={() => journey?.turnTo("restored")}>Leer mi página restaurada →</button>}
      </>}
      <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
    </div>
  </>;
}

function RestoredPages({ progress, journey, preview }) {
  const chapter = progress.chapter("chihiro");
  const answer = chapter.answer;
  const active = ["chihiro", "restored"].includes(journey?.spread) && !journey?.turn && !preview;
  if (!chapter.saved) return <ObjectQuestion progress={progress} journey={journey} preview={preview} />;
  return <>
    <div className="storybook-page storybook-title-page book-restored-left">
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <div className="book-restored-art"><Image src="/images/scenes/el viaje de chihiro.jpg" alt="Chihiro junto a Haku bajo el cielo nocturno" fill sizes="(max-width: 700px) 85vw, 37vw" priority /></div>
      <div className="book-restored-ticket"><Image src={ticketImage} alt="Boleto de tren restaurado" width={707} height={274} sizes="(max-width: 700px) 65vw, 24vw" /></div>
      <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
    </div>
    <div className="storybook-page storybook-index-page book-restored-right">
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <h1>Mi recuerdo</h1>
      <div className="ink-flourish" aria-hidden="true" />
      <MagicalInk answer={answer} chapterId="chihiro" active={active} preview={preview} syncState={progress.syncState} signedIn={Boolean(progress.authUser?.uid)} />
      <ShareMemoryActions chapterId="chihiro" journey={journey} preview={preview} />
      {!preview && <button className="book-chapter-replay" type="button" onClick={() => journey?.turnTo("game")}>Volver al minijuego →</button>}
      <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
    </div>
  </>;
}

export default function ChihiroBookPages({ spread, progress, journey, preview = false }) {
  return <div className="storybook-cover experience-theme experience-theme--chihiro" style={experienceThemes.chihiro.style}><div className="storybook-pages">
    {spread === "game" ? <ExperienceGameSpread theme={experienceThemes.chihiro} title="El boleto de los recuerdos" instruction="Encontrá las cuatro piezas y unilas para reconstruir el boleto de tren.">
      <TicketPuzzle progress={progress} journey={journey} preview={preview} />
    </ExperienceGameSpread> : spread === "object" ? <ObjectQuestion progress={progress} journey={journey} preview={preview} /> : <RestoredPages progress={progress} journey={journey} preview={preview} />}
  </div></div>;
}
