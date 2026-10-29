"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { chapterExperiences } from "@/data/chapterExperiences";

const assets = "/images/experiences/totoro";
const experience = chapterExperiences.totoro;

function ForestGame({ progress, journey, preview }) {
  const chapter = progress.chapter("totoro");
  const [watered, setWatered] = useState(false);
  const [sunlit, setSunlit] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [feedback, setFeedback] = useState("Acercá la nube a la planta para darle lluvia.");
  const [drag, setDrag] = useState(null);
  const boardRef = useRef(null);
  const movedRef = useRef(false);
  const busy = useRef(false);
  const storageKey = `biblioteca-totoro-bosque-v1:${progress.authUser?.uid || "local"}`;
  const { startGame } = progress;

  useEffect(() => {
    if (preview) return;
    startGame("totoro");
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
      if (saved.watered) queueMicrotask(() => setWatered(true));
      if (saved.sunlit) queueMicrotask(() => setSunlit(true));
    } catch { /* El bosque puede empezar de nuevo. */ }
  }, [preview, startGame, storageKey]);

  function remember(next) {
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* El juego sigue disponible. */ }
  }
  function apply(kind) {
    if (preview || chapter.objectRecovered || busy.current) return;
    if (kind === "rain" && !watered) {
      setWatered(true);
      remember({ watered: true, sunlit: false });
      setFeedback("La lluvia despertó la semilla. Ahora acercá el sol.");
    } else if (kind === "sun" && watered && !sunlit) {
      setSunlit(true);
      remember({ watered: true, sunlit: true });
      setFeedback("¡El árbol creció! Tocá su hoja brillante para recuperarla.");
    }
  }
  function startDrag(event, kind) {
    if (preview || chapter.objectRecovered || (kind === "sun" && !watered)) return;
    movedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ kind, originX: event.clientX, originY: event.clientY, x: event.clientX, y: event.clientY });
  }
  function moveDrag(event) {
    if (!drag) return;
    movedRef.current = true;
    setDrag((current) => current ? { ...current, x: event.clientX, y: event.clientY } : null);
  }
  function endDrag(event) {
    if (!drag) return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (rect && movedRef.current) {
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      if (x > .31 && x < .72 && y > .3 && y < .91) apply(drag.kind);
      else setFeedback("Acercá el elemento al centro de la planta.");
    }
    setDrag(null);
  }
  async function takeLeaf() {
    if (preview || !sunlit || busy.current) return;
    busy.current = true;
    setRecovering(true);
    setFeedback("La hoja vuelve al libro…");
    const saved = await progress.completeGame("totoro");
    if (!saved) {
      busy.current = false;
      setRecovering(false);
      setFeedback("No se pudo guardar la hoja. Intentá nuevamente.");
      return;
    }
    try { window.localStorage.removeItem(storageKey); } catch { /* La hoja ya está guardada. */ }
    window.setTimeout(() => journey?.turnTo("totoroObject"), 1200);
  }
  return <div className="totoro-game">
    <div className={`totoro-forest-board${watered ? " is-watered" : ""}${sunlit ? " is-sunlit" : ""}${recovering ? " is-recovering" : ""}`} ref={boardRef}>
      <Image src={`${assets}/claro-del-bosque.webp`} alt="Claro del bosque con un pequeño brote en la tierra" fill sizes="(max-width: 700px) 85vw, 38vw" />
      <div className="totoro-growing-tree" aria-hidden="true"><Image src={`${assets}/arbol.webp`} alt="" width={544} height={850} sizes="(max-width: 700px) 40vw, 18vw" /></div>
      {watered && <span className="totoro-rain" aria-hidden="true"><i /><i /><i /><i /><i /></span>}
      {sunlit && <span className="totoro-sunbeams" aria-hidden="true" />}
      <button type="button" className="totoro-weather totoro-cloud" style={drag?.kind === "rain" ? { transform: `translate(${drag.x - drag.originX}px, ${drag.y - drag.originY}px)`, zIndex: 7 } : undefined} onClick={() => { if (!movedRef.current) apply("rain"); movedRef.current = false; }} onPointerDown={(event) => startDrag(event, "rain")} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => setDrag(null)} disabled={preview || watered || chapter.objectRecovered} aria-label="Arrastrar o tocar la nube para regar la planta"><Image src={`${assets}/nube.webp`} alt="" width={550} height={409} sizes="100px" /></button>
      <button type="button" className="totoro-weather totoro-sun" style={drag?.kind === "sun" ? { transform: `translate(${drag.x - drag.originX}px, ${drag.y - drag.originY}px)`, zIndex: 7 } : undefined} onClick={() => { if (!movedRef.current) apply("sun"); movedRef.current = false; }} onPointerDown={(event) => startDrag(event, "sun")} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => setDrag(null)} disabled={preview || !watered || sunlit || chapter.objectRecovered} aria-label="Arrastrar o tocar el sol para iluminar la planta"><Image src={`${assets}/sol.webp`} alt="" width={450} height={446} sizes="90px" /></button>
      {sunlit && (!chapter.objectRecovered || recovering) && <button type="button" className="totoro-leaf-pick" onClick={takeLeaf} disabled={preview || recovering} aria-label="Recuperar la hoja del árbol"><Image src={`${assets}/hoja.webp`} alt="Hoja especial del bosque" width={850} height={570} sizes="95px" /></button>}
      {chapter.objectRecovered && !preview && <button type="button" className="totoro-forest-continue" onClick={() => journey?.turnTo("totoroObject")}>Ver la hoja recuperada →</button>}
    </div>
    <p className="totoro-game-feedback" role="status">{feedback}</p>
    <p className="totoro-game-help">Arrastrá los elementos hacia la planta o tocalos. Lluvia → luz → hoja.</p>
  </div>;
}

function TotoroQuestion({ progress, journey, preview }) {
  const chapter = progress.chapter("totoro");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [feedback, setFeedback] = useState("");
  const submitted = useRef(false);
  const draftKey = `biblioteca-totoro-borrador-v1:${progress.authUser?.uid || "local"}`;
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
    const success = await progress.saveAnswer("totoro", answer);
    if (!success) { submitted.current = false; setSaving(false); setFeedback("No se pudo guardar el recuerdo. Intentá nuevamente."); return; }
    try { window.localStorage.removeItem(draftKey); } catch { /* El texto ya está guardado. */ }
    setRestoring(true);
    window.setTimeout(() => journey?.turnTo("totoroRestored"), 1900);
  }
  return <>
    <div className={`storybook-page storybook-title-page stage-c-object-left totoro-object-left${restoring ? " is-restoring" : ""}`}>
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <div className="stage-c-object-art totoro-object-art"><Image src={`${assets}/hoja.webp`} alt="Hoja especial recuperada del bosque" width={850} height={570} sizes="(max-width: 700px) 78vw, 34vw" priority />{restoring && <span className="totoro-writing-preview">{answer.slice(0, 70)}</span>}</div>
      <p className="book-art-caption">La hoja recuperada</p>
      <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
    </div>
    <div className="storybook-page storybook-index-page stage-c-form-page">
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <h1>El recuerdo de la infancia</h1>
      {!chapter.objectRecovered ? <button type="button" className="book-chapter-start" onClick={() => journey?.turnTo("totoroGame")}>Recuperar la hoja →</button> : <>
        <p>{experience.question}</p>
        <form onSubmit={save}>
          <label htmlFor="book-totoro-answer" className="sr-only">Tu recuerdo de la infancia</label>
          <textarea id="book-totoro-answer" value={answer} onChange={(event) => { const value = event.target.value.slice(0, 500); setAnswer(value); try { window.localStorage.setItem(draftKey, value); } catch { /* Se puede guardar sin borrador. */ } }} placeholder="Escribí tu recuerdo de la infancia..." rows={5} maxLength={500} required disabled={preview || restoring || chapter.saved} />
          <small>{answer.length} / 500</small>
          <button className="book-chapter-start" type="submit" disabled={preview || !answer.trim() || saving || chapter.saved}>{saving ? "Guardando…" : "Guardar recuerdo"}</button>
          {feedback && <p role="alert">{feedback}</p>}
        </form>
      </>}
      {restoring && <p className="book-restoring-message" role="status">La hoja se incorpora a la página…</p>}
      {chapter.saved && !restoring && !preview && <button className="book-chapter-replay" type="button" onClick={() => journey?.turnTo("totoroRestored")}>Leer el recuerdo guardado →</button>}
      <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
    </div>
  </>;
}

function TotoroRestored({ progress, journey, preview }) {
  const chapter = progress.chapter("totoro");
  const [length, setLength] = useState(0);
  const active = journey?.spread === "totoroRestored" && !journey?.turn && !preview;
  useEffect(() => {
    if (!active || !chapter.saved) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { queueMicrotask(() => setLength(chapter.answer.length)); return; }
    const timer = window.setInterval(() => setLength((current) => Math.min(chapter.answer.length, current + 2)), 28);
    return () => window.clearInterval(timer);
  }, [active, chapter.answer, chapter.saved]);
  if (!chapter.saved) return <TotoroQuestion progress={progress} journey={journey} preview={preview} />;
  return <>
    <div className="storybook-page storybook-title-page stage-c-restored-left totoro-restored-left">
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <div className="book-restored-art"><Image src="/images/scenes/totoro-forest.png" alt="Bosque luminoso de Totoro" fill sizes="(max-width: 700px) 85vw, 37vw" /></div>
      <div className="stage-c-restored-object totoro-restored-leaf"><Image src={`${assets}/hoja.webp`} alt="Hoja del bosque guardada en el libro" width={850} height={570} sizes="(max-width: 700px) 55vw, 22vw" /></div>
      <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
    </div>
    <div className="storybook-page storybook-index-page book-restored-right stage-c-restored-right">
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <h1>El recuerdo de la infancia</h1>
      <p className="book-restored-question">{experience.question}</p>
      <blockquote className="book-restored-answer">{active ? chapter.answer.slice(0, length) : chapter.answer}{active && length < chapter.answer.length && <span aria-hidden="true" className="ink-cursor">│</span>}</blockquote>
      {!preview && <button className="book-chapter-replay" type="button" onClick={() => journey?.turnTo("totoro")}>Volver al capítulo →</button>}
      {!preview && progress.overall.finalUnlocked && <button className="book-chapter-start totoro-final-button" type="button" onClick={() => journey?.turnTo("finale")}>Abrir mi biblioteca <span aria-hidden="true">→</span></button>}
      <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
    </div>
  </>;
}

export default function TotoroBookPages({ spread, progress, journey, preview = false }) {
  return <div className="storybook-cover"><div className="storybook-pages">
    {spread === "totoroGame" ? <>
      <div className="storybook-page storybook-title-page book-game-left stage-c-game-left"><span className="page-botanical page-botanical-top" aria-hidden="true" /><div className="book-game-art"><Image src={`${assets}/claro-del-bosque.webp`} alt="Claro de un bosque luminoso donde crece una planta" fill sizes="(max-width: 700px) 85vw, 37vw" /></div><span className="page-botanical page-botanical-bottom" aria-hidden="true" /></div>
      <div className="storybook-page storybook-index-page book-game-right stage-c-game-right"><span className="page-botanical page-botanical-top" aria-hidden="true" /><h1>El recuerdo de la infancia</h1><p>Traé la lluvia y el sol al brote. Una hoja guardará tu recuerdo.</p><ForestGame progress={progress} journey={journey} preview={preview} /><span className="page-botanical page-botanical-bottom-right" aria-hidden="true" /></div>
    </> : spread === "totoroObject" ? <TotoroQuestion progress={progress} journey={journey} preview={preview} /> : <TotoroRestored progress={progress} journey={journey} preview={preview} />}
  </div></div>;
}
