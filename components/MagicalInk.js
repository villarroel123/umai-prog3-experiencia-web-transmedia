"use client";

import { useEffect, useRef, useState } from "react";
import { consumeMemoryInkPending } from "@/data/memoryAnimations";

export default function MagicalInk({ answer, chapterId, active, preview, syncState, signedIn }) {
  const [mode, setMode] = useState("checking");
  const checked = useRef(false);
  const durationMs = Math.max(2000, Math.min(4000, 1700 + answer.length * 5));

  useEffect(() => {
    if (!active || checked.current) return;
    checked.current = true;
    const pending = consumeMemoryInkPending(chapterId);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    queueMicrotask(() => setMode(pending && !reduced ? "animating" : "static"));
  }, [active, chapterId]);

  useEffect(() => {
    if (mode !== "animating") return;
    const timer = window.setTimeout(() => setMode("finished"), durationMs);
    return () => window.clearTimeout(timer);
  }, [mode, durationMs]);

  const visible = preview || mode !== "checking";
  const animating = !preview && mode === "animating";
  const finished = !preview && mode === "finished";

  return <>
    <blockquote className={`book-restored-answer memory-ink-quote${animating ? " is-writing" : ""}${finished ? " is-finished" : ""}`} style={{ "--ink-duration": `${durationMs}ms` }}>
      {visible && <span className="memory-ink-text">{answer}</span>}
      {animating && <span className="memory-ink-light" aria-hidden="true" />}
      {finished && <span className="memory-ink-spark" aria-hidden="true">✦</span>}
    </blockquote>
    {visible && <small className="memory-restored-indicator">✦ Recuerdo restaurado</small>}
    {syncState === "offline" && <small className="memory-sync-status">{signedIn ? "Guardado en este navegador · pendiente de sincronización" : "Guardado en este navegador"}</small>}
  </>;
}
