import Image from "next/image";
import Link from "next/link";
import { movies } from "@/data/memories";

const statusText = {
  "not-started": "Sin comenzar",
  "in-progress": "En progreso",
  completed: "Capítulo reconstruido",
};

export default function LibraryIndex({ progress }) {
  return <section className="storybook-index" aria-labelledby="library-heading">
    <div className="storybook-cover">
      <div className="storybook-pages">
        <div className="storybook-page storybook-title-page">
          <span className="page-botanical page-botanical-top" aria-hidden="true" />
          <p className="book-folio">LIBRO DE LOS MUNDOS · VOL. I</p>
          <h1 id="library-heading">La biblioteca de<br /><em>los recuerdos</em></h1>
          <div className="ink-flourish" aria-hidden="true" />
          <p className="title-page-intro">Tres historias esperan ser completadas. Recuperá sus recuerdos y devolvé la vida a este libro.</p>
          <div className="title-page-vignette" aria-hidden="true">
            <Image src="/images/scenes/totoro-character.png" alt="" width={210} height={210} sizes="180px" />
          </div>
          <p className="title-page-progress">{progress.overall.recovered} de 9 recuerdos recuperados</p>
          <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
        </div>

        <div className="storybook-page storybook-index-page">
          <div className="index-page-heading"><span>ÍNDICE DE LAS HISTORIAS</span><span>01 — 03</span></div>
          <div className="film-gallery">
            {movies.map((movie) => {
              const chapter = progress.getMovieProgress(movie.id);
              return <Link
                key={movie.id}
                href={"/recuerdos/" + movie.id}
                className={"film-entry film-entry-" + movie.id}
                aria-label={movie.title + ". " + chapter.recovered + " de " + chapter.total + " recuerdos. " + statusText[chapter.status]}
              >
                <span className="film-arch">
                  <Image src={movie.sceneImage} alt="" fill sizes="(max-width: 720px) 27vw, 15vw" className="film-arch-scene" />
                  {movie.coverCharacterImage && <Image src={movie.coverCharacterImage} alt="" width={145} height={160} sizes="(max-width: 720px) 16vw, 90px" className="film-arch-character" />}
                  <span className="film-arch-spark" aria-hidden="true" />
                </span>
                <strong>{movie.title}</strong>
                <span className="film-progress-dots" aria-hidden="true">
                  {[0, 1, 2].map((dot) => <i className={dot < chapter.recovered ? "filled" : ""} key={dot} />)}
                </span>
                <small>{statusText[chapter.status]} · {chapter.recovered}/3</small>
              </Link>;
            })}
          </div>
          <div className="index-page-footer">
            <span>Elegí una ilustración para abrir su capítulo</span>
            <Link href="/final">{progress.overall.finalUnlocked ? "Leer el final →" : "Final sellado · 9/9"}</Link>
          </div>
          <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
        </div>
      </div>
    </div>
  </section>;
}
