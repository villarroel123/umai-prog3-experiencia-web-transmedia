import Image from "next/image";
import Link from "next/link";
import { chapterExperiences } from "@/data/chapterExperiences";

export default function ChapterView({ movie, film, progress }) {
  const experience = chapterExperiences[movie.id];
  const state = progress.chapter(movie.id);
  const playable = movie.id === "chihiro";

  return <article className={"chapter-story chapter-story-" + movie.id} aria-labelledby="chapter-heading">
    <div className="story-crumb"><Link href="/biblioteca">← Volver al libro</Link><span>CAPÍTULO {movie.number} DE 03</span></div>
    <div className="chapter-cover">
      <div className="chapter-scenery">
        <Image src={movie.sceneImage} alt={movie.sceneAlt} fill sizes="(max-width: 800px) 100vw, 48vw" className="chapter-scenery-image" priority />
        {movie.coverCharacterImage && <Image src={movie.coverCharacterImage} alt="" width={320} height={390} sizes="(max-width: 800px) 36vw, 220px" className="chapter-scenery-character" />}
        <span className="chapter-scenery-caption">UN MUNDO POR RECORDAR</span>
        <div className="chapter-scenery-story"><span>LIBRO DE LOS RECUERDOS · {movie.number}</span><strong>{experience.title}</strong></div>
      </div>
      <div className="chapter-paper">
        <span className="page-botanical page-botanical-top" aria-hidden="true" />
        <p className="book-folio">CAPÍTULO {movie.number}</p>
        <h1 id="chapter-heading">{movie.title}</h1>
        <p className="chapter-experience-title">{experience.title}</p>
        <div className="ink-flourish" aria-hidden="true" />
        <p className="chapter-intro-copy">{experience.setting}</p>
        <div className="chapter-instruction"><span>EN ESTE MUNDO</span><p>{experience.instruction}</p></div>
        {playable ? <Link className="chapter-start" href={state.saved ? "/biblioteca?pagina=chihiro" : "/recuerdos/chihiro/experiencia"}>
          {state.saved ? "Leer mi página" : state.gameComplete ? "Continuar mi recuerdo" : "Comenzar"}<span aria-hidden="true">↗</span>
        </Link> : <p className="chapter-coming-soon">Esta historia abrirá después del viaje de Chihiro.</p>}
        <div className="chapter-paper-foot"><p>Una historia, un objeto y un recuerdo propio.</p><small>{film?.year} · {film?.director}</small></div>
        <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
      </div>
    </div>
  </article>;
}
