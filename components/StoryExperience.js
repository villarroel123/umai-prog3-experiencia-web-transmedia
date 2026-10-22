"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import AuthPanel from "@/components/AuthPanel";
import LibraryIndex from "@/components/LibraryIndex";
import ChapterView from "@/components/ChapterView";
import MinigameView from "@/components/MinigameView";
import FinalView from "@/components/FinalView";
import { useMemoryProgress } from "@/hooks/useMemoryProgress";

const syncLabels = {
  local: "Guardado local",
  cloud: "Guardado en la nube",
  connecting: "Conectando…",
  offline: "Guardado local · sin conexión",
};

export default function StoryExperience({ screen, movie, memory, film }) {
  const progress = useMemoryProgress();
  const [authOpen, setAuthOpen] = useState(false);
  if (!progress.ready) {
    return <main className="story-world story-loading" role="status">
      <span className="story-loading-mark" aria-hidden="true">✦</span>
      <p>Abriendo el libro de los recuerdos…</p>
    </main>;
  }

  return <main className={"story-world story-screen-" + screen}>
    {movie && <Image src={movie.sceneImage} alt="" fill sizes="100vw" className="story-world-backdrop" />}
    <div className="story-grain" aria-hidden="true" />
    <header className="story-header">
      <Link href="/biblioteca" className="story-wordmark"><span aria-hidden="true">✦</span> La biblioteca de los recuerdos</Link>
      <nav aria-label="Navegación de la biblioteca">
        <Link href="/">Inicio</Link>
        <Link href="/biblioteca" aria-current={screen === "library" ? "page" : undefined}>El libro</Link>
        <Link href="/final" aria-current={screen === "final" ? "page" : undefined}>Final</Link>
      </nav>
      <div className="story-header-status">
        <span className="story-tally">{progress.overall.recovered} / 9 recuerdos</span>
        <span className={"story-sync story-sync-" + progress.syncState} title="Estado del guardado">{syncLabels[progress.syncState]}</span>
        {progress.firebaseConfigured && <button type="button" className="story-account" onClick={() => setAuthOpen(true)}>
          {progress.authUser?.isAnonymous ? "Invitado" : progress.authUser?.displayName || progress.authUser?.email || "Mi cuenta"}
        </button>}
      </div>
    </header>
    <div className="story-content" key={screen + (movie?.id || "") + (memory?.id || "")}>
      {screen === "library" && <LibraryIndex progress={progress} />}
      {screen === "chapter" && <ChapterView movie={movie} film={film} progress={progress} />}
      {screen === "minigame" && <MinigameView movie={movie} memory={memory} progress={progress} />}
      {screen === "final" && <FinalView progress={progress} />}
    </div>
    {authOpen && <AuthPanel
      authError={progress.authError}
      authLoading={progress.authLoading}
      onClose={() => setAuthOpen(false)}
      onContinueAsGuest={progress.continueAsGuest}
      onGoogle={progress.signInWithGoogle}
      onSubmitEmail={progress.submitEmail}
      user={progress.authUser}
    />}
  </main>;
}
