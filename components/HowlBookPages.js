"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { chapterExperiences } from "@/data/chapterExperiences";

const assets = "/images/experiences/howl";
const experience = chapterExperiences.howl;

function HowlDesk({ progress, journey, preview }) {
  const chapter = progress.chapter("howl");
  const [keyFound, setKeyFound] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [boxOpen, setBoxOpen] = useState(false);
  const [letterTaken, setLetterTaken] = useState(false);
  const [feedback, setFeedback] = useState("Explorá los objetos del escritorio.");
  const busy = useRef(false);
  const storageKey = `biblioteca-howl-escritorio-v1:${progress.authUser?.uid || "local"}`;
  const { startGame } = progress;

  useEffect(() => {
    if (preview) return;
    startGame("howl");
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
      if (saved.keyFound) queueMicrotask(() => setKeyFound(true));
      if (saved.boxOpen) queueMicrotask(() => setBoxOpen(true));
    } catch { /* La exploración puede reiniciarse. */ }
  }, [preview, startGame, storageKey]);

  function remember(next) {
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* La escena sigue disponible. */ }
  }
  function inspect(object) {
    if (preview || busy.current) return;
    if (object === "drawer") {
      if (!keyFound) {
        setKeyFound(true);
        remember({ keyFound: true, boxOpen });
        setFeedback("Encontraste una llave antigua. Ahora podés abrir la caja.");
      } else setFeedback("El cajón ya está vacío.");
      return;
    }
    if (object === "box") {
      if (!keyFound) { setFeedback("Necesitás encontrar la llave."); return; }
      if (boxOpen) { setFeedback("La carta espera dentro de la caja."); return; }
      setUnlocking(true);
      setFeedback("La llave está abriendo la caja…");
      window.setTimeout(() => {
        setUnlocking(false);
        setBoxOpen(true);
        remember({ keyFound: true, boxOpen: true });
        setFeedback("La caja se abrió. Tocá la carta para recuperarla.");
      }, 900);
      return;
    }
    const hints = {
      books: "Los libros crujen suavemente, pero la llave no está aquí.",
      papers: "Los papeles guardan viejas palabras, no la llave.",
      cup: "La taza aún conserva algo de calor.",
      lamp: "La lámpara ilumina un pequeño cajón.",
    };
    setFeedback(hints[object]);
  }
  async function takeLetter() {
    if (preview || busy.current || !boxOpen) return;
    busy.current = true;
    setLetterTaken(true);
    setFeedback("La carta ha vuelto al libro…");
    const saved = await progress.completeGame("howl");
    if (!saved) {
      busy.current = false;
      setLetterTaken(false);
      setFeedback("No se pudo guardar la carta. Intentá nuevamente.");
      return;
    }
    try { window.localStorage.removeItem(storageKey); } catch { /* La carta ya está guardada. */ }
    window.setTimeout(() => journey?.turnTo("howlObject"), 1100);
  }
  return <div className={`howl-desk${boxOpen ? " is-open" : ""}${letterTaken ? " is-recovered" : ""}`}>
    <Image src={`${assets}/escritorio-magico.webp`} alt="Escritorio mágico con libros, lámpara, cajón y caja cerrada" fill sizes="(max-width: 700px) 85vw, 38vw" />
    <div className="howl-desk-shade" aria-hidden="true" />
    {["books", "papers", "drawer", "cup", "lamp", "box"].map((object) => <button key={object} type="button" className={`howl-hotspot howl-hotspot-${object}`} onClick={() => inspect(object)} disabled={preview || letterTaken} aria-label={{ books: "Explorar los libros", papers: "Explorar los papeles", drawer: "Abrir el cajón", cup: "Mirar la taza", lamp: "Examinar la lámpara", box: "Abrir la caja" }[object]} />)}
    {keyFound && <div className={`howl-key${unlocking ? " is-unlocking" : ""}`} aria-label="Llave recuperada"><Image src={`${assets}/llave.webp`} alt="" width={580} height={506} sizes="60px" /></div>}
    {boxOpen && <button type="button" className={`howl-desk-letter${letterTaken ? " is-leaving" : ""}`} onClick={takeLetter} disabled={preview || letterTaken} aria-label="Recuperar la carta"><Image src={`${assets}/sobre-abierto.webp`} alt="Carta antigua dentro de un sobre abierto" width={900} height={834} sizes="80px" /></button>}
    {boxOpen && <span className="howl-desk-sparkles" aria-hidden="true" />}
    <p className="howl-desk-feedback" role="status">{feedback}</p>
    {chapter.objectRecovered && !preview && <button type="button" className="howl-desk-continue" onClick={() => journey?.turnTo("howlObject")}>Ver la carta recuperada →</button>}
  </div>;
}

function HowlQuestion({ progress, journey, preview }) {
  const chapter = progress.chapter("howl");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [feedback, setFeedback] = useState("");
  const submitted = useRef(false);
  const draftKey = `biblioteca-howl-borrador-v1:${progress.authUser?.uid || "local"}`;
  useEffect(() => {
    if (preview || chapter.saved) return;
    try { const saved = window.localStorage.getItem(draftKey); if (saved) queueMicrotask(() => setAnswer(saved.slice(0, 500))); }
    catch { /* El formulario sigue disponible. */ }
  }, [chapter.saved, draftKey, preview]);
  async function save(event) {
    event.preventDefault();
    if (submitted.current || !chapter.objectRecovered || !answer.trim()) return;
    submitted.current = true;
    setSaving(true);
    const success = await progress.saveAnswer("howl", answer);
    if (!success) { submitted.current = false; setSaving(false); setFeedback("No se pudo guardar la carta. Intentá nuevamente."); return; }
    try { window.localStorage.removeItem(draftKey); } catch { /* El texto ya está guardado. */ }
    setRestoring(true);
    window.setTimeout(() => journey?.turnTo("howlRestored"), 1900);
  }
  return <>
    <div className={`storybook-page storybook-title-page stage-c-object-left howl-object-left${restoring ? " is-restoring" : ""}`}>
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <div className="stage-c-object-art"><Image src={`${assets}/${restoring ? "sobre-abierto" : "sobre-cerrado"}.webp`} alt="Sobre antiguo con sello de cera y flores" width={900} height={834} sizes="(max-width: 700px) 78vw, 34vw" priority />{restoring && <span className="howl-writing-preview">{answer.slice(0, 75)}</span>}</div>
      <p className="book-art-caption">La carta recuperada</p>
      <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
    </div>
    <div className="storybook-page storybook-index-page stage-c-form-page">
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <h1>La carta que nunca enviaste</h1>
      {!chapter.objectRecovered ? <button type="button" className="book-chapter-start" onClick={() => journey?.turnTo("howlGame")}>Recuperar la carta →</button> : <>
        <p>{experience.question}</p>
        <form onSubmit={save}>
          <label htmlFor="book-howl-answer" className="sr-only">Tu mensaje personal</label>
          <textarea id="book-howl-answer" value={answer} onChange={(event) => { const value = event.target.value.slice(0, 500); setAnswer(value); try { window.localStorage.setItem(draftKey, value); } catch { /* Se puede guardar sin borrador. */ } }} placeholder="Escribí tu mensaje..." rows={5} maxLength={500} required disabled={preview || restoring || chapter.saved} />
          <small>{answer.length} / 500</small>
          <button className="book-chapter-start" type="submit" disabled={preview || !answer.trim() || saving || chapter.saved}>{saving ? "Guardando…" : "Guardar carta"}</button>
          {feedback && <p role="alert">{feedback}</p>}
        </form>
      </>}
      {restoring && <p className="book-restoring-message" role="status">La carta vuelve a su página…</p>}
      {chapter.saved && !restoring && !preview && <button className="book-chapter-replay" type="button" onClick={() => journey?.turnTo("howlRestored")}>Leer la carta guardada →</button>}
      <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
    </div>
  </>;
}

function HowlRestored({ progress, journey, preview }) {
  const chapter = progress.chapter("howl");
  const [opened, setOpened] = useState(false);
  const [length, setLength] = useState(0);
  const active = journey?.spread === "howlRestored" && !journey?.turn && !preview;
  useEffect(() => {
    if (!active || !chapter.saved) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { queueMicrotask(() => setLength(chapter.answer.length)); return; }
    const timer = window.setInterval(() => setLength((current) => Math.min(chapter.answer.length, current + 2)), 28);
    return () => window.clearInterval(timer);
  }, [active, chapter.answer, chapter.saved]);
  if (!chapter.saved) return <HowlQuestion progress={progress} journey={journey} preview={preview} />;
  return <>
    <div className="storybook-page storybook-title-page stage-c-restored-left">
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <div className="book-restored-art"><Image src="/images/scenes/howl-castle.png" alt="El castillo ambulante bajo un cielo luminoso" fill sizes="(max-width: 700px) 85vw, 37vw" /></div>
      <button type="button" className={`stage-c-restored-object howl-restored-envelope${opened ? " is-open" : ""}`} onClick={() => setOpened((value) => !value)} disabled={preview} aria-label={opened ? "Cerrar la carta" : "Abrir la carta guardada"} aria-expanded={opened}><Image src={`${assets}/${opened ? "sobre-abierto" : "sobre-cerrado"}.webp`} alt="" width={900} height={834} sizes="(max-width: 700px) 55vw, 22vw" /></button>
      {opened && <div className="howl-letter-revisit" role="region" aria-label="Carta guardada">{chapter.answer}</div>}
      <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
    </div>
    <div className="storybook-page storybook-index-page book-restored-right stage-c-restored-right">
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <h1>La carta que nunca enviaste</h1>
      <p className="book-restored-question">{experience.question}</p>
      <blockquote className="book-restored-answer">{active ? chapter.answer.slice(0, length) : chapter.answer}{active && length < chapter.answer.length && <span aria-hidden="true" className="ink-cursor">│</span>}</blockquote>
      {!preview && <button className="book-chapter-replay" type="button" onClick={() => journey?.turnTo("howl")}>Volver al capítulo →</button>}
      <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
    </div>
  </>;
}

export default function HowlBookPages({ spread, progress, journey, preview = false }) {
  return <div className="storybook-cover"><div className="storybook-pages">
    {spread === "howlGame" ? <>
      <div className="storybook-page storybook-title-page book-game-left stage-c-game-left"><span className="page-botanical page-botanical-top" aria-hidden="true" /><div className="book-game-art"><Image src={`${assets}/escritorio-magico.webp`} alt="Interior cálido del castillo con un escritorio antiguo" fill sizes="(max-width: 700px) 85vw, 37vw" /></div><span className="page-botanical page-botanical-bottom" aria-hidden="true" /></div>
      <div className="storybook-page storybook-index-page book-game-right stage-c-game-right"><span className="page-botanical page-botanical-top" aria-hidden="true" /><h1>La carta que nunca enviaste</h1><p>Explorá el escritorio, encontrá la llave y recuperá la carta escondida.</p><HowlDesk progress={progress} journey={journey} preview={preview} /><span className="page-botanical page-botanical-bottom-right" aria-hidden="true" /></div>
    </> : spread === "howlObject" ? <HowlQuestion progress={progress} journey={journey} preview={preview} /> : <HowlRestored progress={progress} journey={journey} preview={preview} />}
  </div></div>;
}
