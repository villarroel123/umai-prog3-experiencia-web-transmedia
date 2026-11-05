"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { memoryAnimations } from "@/data/memoryAnimations";

export function MemoryRestorationArt({ theme }) {
  return <div className="memory-restoration-art">
    <Image src={theme.scene} alt={theme.sceneAlt} fill sizes="(max-width: 700px) 100vw, 80vw" />
  </div>;
}

export function MemoryRestorationPreview() {
  return <div className="memory-restoration-preview" aria-hidden="true"><span>✦</span></div>;
}

export default function MemoryRestoration({ chapterId, onComplete }) {
  const animation = memoryAnimations[chapterId];
  const [phase, setPhase] = useState("playing");
  const started = useRef(false);
  const finished = useRef(false);
  const timers = useRef([]);
  const completeRef = useRef(onComplete);
  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    timers.current.forEach(window.clearTimeout);
    completeRef.current();
  }, []);

  useEffect(() => {
    const scheduled = timers.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timer = window.setTimeout(finish, 0);
      return () => window.clearTimeout(timer);
    }
    return () => scheduled.forEach(window.clearTimeout);
  }, [finish]);

  function begin() {
    if (started.current || finished.current) return;
    started.current = true;
    timers.current.push(window.setTimeout(() => setPhase("fading"), animation.durationMs));
    timers.current.push(window.setTimeout(finish, animation.durationMs + 900));
  }

  return <div className={`memory-restoration ${phase === "fading" ? "is-fading" : ""}`} role="status" aria-label="El recuerdo está regresando al libro">
    <div className="memory-restoration-frame">
      <Image src={animation.src} alt={animation.alt} width={animation.width} height={animation.height} sizes="(max-width: 700px) 75vw, 35vw" unoptimized onLoad={begin} priority />
      <div className="memory-restoration-particles" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <i key={index} />)}</div>
    </div>
    <button type="button" className="memory-restoration-skip" onClick={finish}>Omitir animación</button>
  </div>;
}
