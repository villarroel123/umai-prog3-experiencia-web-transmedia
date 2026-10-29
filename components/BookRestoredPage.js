"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LibraryIndex from "@/components/LibraryIndex";
import { useBookJourney } from "@/components/BookJourney";
import { chapterExperiences } from "@/data/chapterExperiences";

export default function BookRestoredPage({ chapterId, progress, animate }) {
  const journey = useBookJourney();
  const chapter = progress.chapter(chapterId);
  const answer = chapter.answer;
  const [visibleLength, setVisibleLength] = useState(() => animate ? 0 : answer.length);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!chapter.saved) return;
    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      queueMicrotask(() => setVisibleLength(answer.length));
      return;
    }
    timerRef.current = window.setInterval(() => {
      setVisibleLength((current) => {
        if (current >= answer.length) {
          window.clearInterval(timerRef.current);
          return current;
        }
        return Math.min(current + 2, answer.length);
      });
    }, 32);
    return () => window.clearInterval(timerRef.current);
  }, [animate, answer, chapter.saved]);

  if (!chapter.saved) return <LibraryIndex progress={progress} />;
  const writing = animate && visibleLength < answer.length;
  const experience = chapterExperiences[chapterId];

  return <section className={`storybook-index book-memory ${writing ? "is-restoring" : "is-restored"}`} aria-labelledby="book-memory-heading">
    <div className="storybook-cover"><div className="storybook-pages">
      <div className="storybook-page storybook-title-page book-memory-left">
        <p className="book-folio">PÁGINA 01 · EL VIAJE DE CHIHIRO</p>
        <div className="book-memory-illustration">
          <Image src="/images/experiences/chihiro/tren-atardecer.webp" alt="Tren al atardecer reflejado en el agua" fill sizes="(max-width: 700px) 85vw, 35vw" />
        </div>
        <div className="book-memory-ticket"><Image src={experience.objectImage} alt="Boleto restaurado" width={560} height={254} sizes="(max-width: 700px) 65vw, 260px" /><span>{answer.slice(0, 90)}{answer.length > 90 ? "…" : ""}</span></div>
        <h1 id="book-memory-heading">El viaje de Chihiro</h1>
        <p>El boleto encontró su lugar en el libro.</p>
        <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
      </div>
      <div className="storybook-page storybook-index-page book-memory-right">
        <div className="index-page-heading"><span>MI BIBLIOTECA DE LOS RECUERDOS</span><span>01 / 03</span></div>
        <p className="book-folio">EL BOLETO DE LOS RECUERDOS</p>
        <h2>Un viaje que permanece</h2>
        <div className="ink-flourish" aria-hidden="true" />
        <p className="book-memory-question">{experience.question}</p>
        <blockquote className="book-memory-answer" aria-label={answer}>{answer.slice(0, visibleLength)}{writing && <span className="ink-cursor" aria-hidden="true">│</span>}</blockquote>
        {writing && <button type="button" className="book-skip-writing" onClick={() => { window.clearInterval(timerRef.current); setVisibleLength(answer.length); }}>Mostrar todo el recuerdo</button>}
        <div className="index-page-footer"><Link href="/biblioteca">← Volver al índice</Link><span>{progress.overall.savedCount} de 3 páginas restauradas</span></div>
        <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
      </div>
    </div></div>
    {journey && <div className="book-mobile-pages" aria-label="Páginas del recuerdo">
      <button type="button" className={journey.mobilePage === "left" ? "is-current" : ""} onClick={() => journey.setMobilePage("left")} aria-pressed={journey.mobilePage === "left"}>Ilustración</button>
      <button type="button" className={journey.mobilePage === "right" ? "is-current" : ""} onClick={() => journey.setMobilePage("right")} aria-pressed={journey.mobilePage === "right"}>Mi recuerdo</button>
    </div>}
  </section>;
}
