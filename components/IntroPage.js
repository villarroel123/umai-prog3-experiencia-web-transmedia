"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BookScene from "@/components/BookScene";

export default function IntroPage() {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  function begin() {
    if (opening) return;
    if (webglUnavailable || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push("/biblioteca");
      return;
    }
    setOpening(true);
  }

  return <main className={`intro-page ${opening ? "is-opening" : ""}`}>
    <div className="intro-atmosphere" aria-hidden="true" />
    <nav className="intro-nav" aria-label="Navegación principal">
      <Link href="/" className="intro-brand">STUDIO GHIBLI</Link>
      <div className="intro-links">
        <Link href="/" aria-current="page">Inicio</Link>
        <Link href="/biblioteca">Recuerdos</Link>
      </div>
    </nav>

    <section className="intro-copy-block" aria-labelledby="intro-title">
      <h1 id="intro-title">La biblioteca de los recuerdos</h1>
      <p>Las historias están desapareciendo y sus páginas comienzan a quedar en blanco. Explorá tres mundos mágicos, recuperá sus recuerdos y devolvé la vida a este libro.</p>
      <button type="button" className="intro-start" disabled={opening} onClick={begin}>Comenzar <span aria-hidden="true">↗</span></button>
    </section>

    <BookScene opening={opening} onUnavailable={() => setWebglUnavailable(true)} onTransitionComplete={() => router.push("/biblioteca")} />
    <div className="intro-vignette" aria-hidden="true" />
  </main>;
}
