"use client";

import Image from "next/image";
import { useEffect } from "react";
import { movies } from "@/data/memories";
import { chapterExperiences } from "@/data/chapterExperiences";
import { useBookJourney } from "@/components/BookJourney";
import ChihiroBookPages from "@/components/ChihiroBookPages";
import HowlBookPages from "@/components/HowlBookPages";
import TotoroBookPages from "@/components/TotoroBookPages";
import FinalBookPages from "@/components/FinalBookPages";

const descriptions = {
  chihiro: "Una niña descubre un mundo de espíritus donde deberá encontrar el valor para regresar a casa.",
  howl: "Sophie descubre un castillo ambulante y aprende a mirar más allá de las apariencias.",
  totoro: "Dos hermanas encuentran en el bosque la magia de los pequeños momentos compartidos.",
};
const instructions = {
  chihiro: "Reconstruí el boleto perdido para recuperar un recuerdo.",
  howl: "Explorá un escritorio para descubrir una carta olvidada.",
  totoro: "Ayudá a crecer una planta para conservar un recuerdo de la infancia.",
};

function PageArrows({ journey, progress }) {
  const spread = journey?.spread || "index";
  const films = ["index", "contents", "chihiro", "howl", "totoro"];
  const position = films.indexOf(spread);
  const previous = position >= 0 ? films[position - 1] : ({ game: "chihiro", object: "game", restored: "object", howlGame: "howl", howlObject: "howlGame", howlRestored: "howlObject", totoroGame: "totoro", totoroObject: "totoroGame", totoroRestored: "totoroObject", finale: "totoroRestored" })[spread];
  const next = position >= 0 ? films[position + 1] : ({ restored: "howl", howlRestored: "totoro", totoroRestored: progress.overall.finalUnlocked ? "finale" : null })[spread];
  const chapterNumber = spread.startsWith("howl") ? 2 : spread.startsWith("totoro") || spread === "finale" ? 3 : 1;
  const count = spread === "index" ? "PRÓLOGO" : spread === "contents" ? "ÍNDICE" : position >= 0 ? `${String(position - 1).padStart(2, "0")} / 03` : `${String(chapterNumber).padStart(2, "0")} / 03`;
  return <nav className="book-page-arrows" aria-label="Pasar páginas del libro">
    <button type="button" className="book-page-arrow book-page-arrow-prev" onClick={() => journey?.turnTo(previous)} disabled={!journey || journey.turning || !previous} aria-label="Página anterior">‹</button>
    <span className="book-page-count" aria-live="polite">{count}</span>
    <button type="button" className="book-page-arrow book-page-arrow-next" onClick={() => journey?.turnTo(next)} disabled={!journey || journey.turning || !next} aria-label="Página siguiente">›</button>
  </nav>;
}

function ChapterList({ progress, journey, preview }) {
  return <ol className="book-contents-list">
    {movies.map((movie, index) => {
      const chapter = progress.chapter(movie.id);
      const status = chapter.saved ? "Recuerdo completado" : chapter.objectRecovered ? "Objeto recuperado" : chapter.started ? "En curso" : "Sin comenzar";
      return <li key={movie.id}>
        <button type="button" className="book-contents-chapter" onClick={() => journey?.turnTo(movie.id)} disabled={preview || journey?.turning}>
          <span className="book-contents-number">{String(index + 1).padStart(2, "0")}</span>
          <span className="book-contents-copy"><strong>{movie.title}</strong><em>{chapterExperiences[movie.id].title}</em><small>{status}</small></span>
          <span className="book-contents-icon" aria-hidden="true">✦</span>
        </button>
        {chapter.saved && <button type="button" className="book-contents-restored" onClick={() => journey?.turnTo(({ chihiro: "restored", howl: "howlRestored", totoro: "totoroRestored" })[movie.id])} disabled={preview || journey?.turning}>Abrir página restaurada <span aria-hidden="true">↗</span></button>}
      </li>;
    })}
  </ol>;
}

function BookSpread({ spread, progress, journey, preview = false }) {
  if (["game", "object", "restored"].includes(spread)) {
    return <ChihiroBookPages spread={spread} progress={progress} journey={journey} preview={preview} />;
  }
  if (["howlGame", "howlObject", "howlRestored"].includes(spread)) {
    return <HowlBookPages spread={spread} progress={progress} journey={journey} preview={preview} />;
  }
  if (["totoroGame", "totoroObject", "totoroRestored"].includes(spread)) {
    return <TotoroBookPages spread={spread} progress={progress} journey={journey} preview={preview} />;
  }
  if (spread === "finale") return <FinalBookPages progress={progress} journey={journey} preview={preview} />;
  const movie = movies.find((item) => item.id === spread);
  const chapter = movie && progress.chapter(movie.id);
  const experience = movie && chapterExperiences[movie.id];
  return <div className="storybook-cover"><div className="storybook-pages">
    {spread === "contents" ? <>
      <div className="storybook-page storybook-title-page book-contents-left">
        <span className="page-botanical page-botanical-top" aria-hidden="true" />
        <p className="book-folio">LIBRO DE LOS MUNDOS · VOL. I</p>
        <h1>Índice de<br /><em>los recuerdos</em></h1>
        <div className="ink-flourish" aria-hidden="true" />
        <p>Cada historia guarda un recuerdo. Elegí un capítulo para comenzar tu viaje.</p>
        <div className="book-contents-illustration" aria-hidden="true"><Image src="/images/scenes/totoro-character.png" alt="" width={150} height={150} sizes="110px" /></div>
        <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
      </div>
      <div className="storybook-page storybook-index-page book-contents-right">
        <div className="index-page-heading"><span>CAPÍTULOS</span><span>01 — 03</span></div>
        <ChapterList progress={progress} journey={journey} preview={preview} />
        {progress.overall.finalUnlocked && <button type="button" className="book-contents-final" onClick={() => journey?.turnTo("finale")} disabled={preview || journey?.turning}>Abrir mi biblioteca de los recuerdos <span aria-hidden="true">→</span></button>}
        <p className="book-contents-hint">Seleccioná una historia para abrir su capítulo.</p>
        <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
      </div>
    </> : !movie ? <>
      <div className="storybook-page storybook-title-page book-navigation-title">
        <span className="page-botanical page-botanical-top" aria-hidden="true" />
        <p className="book-folio">LIBRO DE LOS MUNDOS · VOL. I</p>
        <h1>La biblioteca de<br /><em>los recuerdos</em></h1>
        <div className="ink-flourish" aria-hidden="true" />
        <p className="title-page-intro">Tres historias esperan ser completadas. Recuperá sus recuerdos y devolvé la vida a este libro.</p>
        <div className="title-page-vignette" aria-hidden="true"><Image src="/images/scenes/totoro-character.png" alt="" width={210} height={210} sizes="90px" /></div>
        <p className="title-page-progress">{progress.overall.savedCount} de 3 recuerdos guardados</p>
        <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
      </div>
      <div className="storybook-page storybook-index-page book-navigation-prologue">
        <div className="index-page-heading"><span>PRÓLOGO</span><span>01 — 03</span></div>
        <div className="book-prologue-art"><Image src="/images/biblioteca-original.png" alt="Biblioteca cálida con un libro abierto" fill sizes="(max-width: 700px) 85vw, 36vw" /></div>
        <h2>Un libro, tres mundos</h2>
        <p>Pasá la página para elegir una historia. Cada capítulo guarda un objeto y un recuerdo por recuperar.</p>
        <button type="button" className="book-text-next" onClick={() => journey?.turnTo("contents")} disabled={preview}>Abrir el índice <span aria-hidden="true">→</span></button>
        <div className="index-page-footer"><span>Pasá las hojas para explorar</span><span>01 — 03</span></div>
        <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
      </div>
    </> : <>
      <div className="storybook-page storybook-title-page book-navigation-art-page">
        <span className="page-botanical page-botanical-top" aria-hidden="true" />
        <div className="book-chapter-art"><Image src={movie.sceneImage} alt={movie.sceneAlt} fill sizes="(max-width: 700px) 85vw, 39vw" priority={spread === "chihiro"} /></div>
        <p className="book-art-caption">{movie.title}</p>
        <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
      </div>
      <div className="storybook-page storybook-index-page book-navigation-chapter-page">
        <span className="page-botanical page-botanical-top" aria-hidden="true" />
        <h1>{movie.title}</h1>
        <p className="book-chapter-description">{descriptions[movie.id]}</p>
        <div className="book-chapter-experience"><h2>{experience.title}</h2><p>{instructions[movie.id]}</p></div>
        <button type="button" className="book-chapter-start" onClick={() => journey?.turnTo(chapter.saved ? ({ chihiro: "restored", howl: "howlRestored", totoro: "totoroRestored" })[movie.id] : chapter.objectRecovered ? ({ chihiro: "object", howl: "howlObject", totoro: "totoroObject" })[movie.id] : ({ chihiro: "game", howl: "howlGame", totoro: "totoroGame" })[movie.id])} disabled={preview}>{chapter.saved ? "Leer recuerdo" : chapter.started ? "Continuar experiencia" : "Comenzar experiencia"} <span aria-hidden="true">→</span></button>
        {chapter.saved && !preview && <button type="button" className="book-chapter-replay" onClick={() => journey?.turnTo(({ chihiro: "game", howl: "howlGame", totoro: "totoroGame" })[movie.id])}>Volver al minijuego</button>}
        <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
      </div>
    </>}
  </div></div>;
}

export default function LibraryIndex({ progress }) {
  const journey = useBookJourney();
  const spread = journey?.spread || "index";
  const turn = journey?.turn;
  const visibleSpread = turn?.target || spread;
  useEffect(() => {
    const movie = movies.find((item) => item.id === visibleSpread);
    document.title = movie ? `${movie.title} — La biblioteca de los recuerdos` : "La biblioteca de los recuerdos";
  }, [visibleSpread]);
  return <section className="storybook-index book-navigation" aria-label="Páginas del libro">
    <div className={turn ? "book-turn-target" : ""}><BookSpread spread={visibleSpread} progress={progress} journey={journey} /></div>
    {turn && <div key={turn.id} className={`book-turn-source book-turn-${turn.direction > 0 ? "forward" : "backward"}`} aria-hidden="true">
      <div className="book-turn-static"><BookSpread spread={turn.source} progress={progress} journey={journey} preview /></div>
      <div className="book-turn-leaf">
        <div className="book-turn-face book-turn-face-front"><BookSpread spread={turn.source} progress={progress} journey={journey} preview /></div>
        <div className="book-turn-face book-turn-face-back"><BookSpread spread={turn.target} progress={progress} journey={journey} preview /></div>
      </div>
    </div>}
    <PageArrows journey={journey} progress={progress} />
    {journey && spread !== "contents" && <button type="button" className="book-index-bookmark" onClick={() => journey.turnTo("contents")} disabled={journey.turning} aria-label="Volver al índice de los recuerdos"><span aria-hidden="true">✦</span> Índice</button>}
    {journey && <div className="book-mobile-pages" aria-label="Páginas visibles">
      <button type="button" className={journey.mobilePage === "left" ? "is-current" : ""} onClick={() => journey.setMobilePage("left")} aria-pressed={journey.mobilePage === "left"}>Ilustración</button>
      <button type="button" className={journey.mobilePage === "right" ? "is-current" : ""} onClick={() => journey.setMobilePage("right")} aria-pressed={journey.mobilePage === "right"}>{visibleSpread === "contents" ? "Capítulos" : "Historia"}</button>
    </div>}
  </section>;
}
