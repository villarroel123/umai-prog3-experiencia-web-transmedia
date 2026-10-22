"use client";

import Link from "next/link";
import { useBookJourney } from "@/components/BookJourney";

export default function IntroPage() {
  const journey = useBookJourney();
  const opening = journey?.phase === "opening";
  const begin = journey?.begin;

  return <main className={`intro-page ${opening ? "is-opening" : ""}`}>
    <div className="intro-atmosphere" aria-hidden="true" />
    <nav className="intro-nav" aria-label="Navegación principal">
      <Link href="/" className="intro-brand">STUDIO GHIBLI</Link>
      <div className="intro-links">
        <Link href="/" aria-current="page">Inicio</Link>
        <Link href="/biblioteca" onClick={(event) => { event.preventDefault(); begin(); }}>Recuerdos</Link>
      </div>
    </nav>

    <section className="intro-copy-block" aria-labelledby="intro-title">
      <h1 id="intro-title">La biblioteca de los recuerdos</h1>
      <p>Las historias están desapareciendo y sus páginas comienzan a quedar en blanco. Explorá tres mundos mágicos, recuperá sus recuerdos y devolvé la vida a este libro.</p>
      <button type="button" className="intro-start" disabled={opening} onClick={begin}>Comenzar <span aria-hidden="true">↗</span></button>
    </section>

    <div className="intro-vignette" aria-hidden="true" />
  </main>;
}
