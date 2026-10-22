import Image from "next/image";
import Link from "next/link";
import { getMovieMemories } from "@/data/memories";

const statuses = { pending: "Por recuperar", "in-progress": "En curso", recovered: "Recuperado" };

export default function ChapterView({ movie, film, progress }) {
  const chapter = progress.getMovieProgress(movie.id);
  const memories = getMovieMemories(movie.id);

  return <article className={"chapter-story chapter-story-" + movie.id} aria-labelledby="chapter-heading">
    <div className="story-crumb"><Link href="/biblioteca">← Volver al libro</Link><span>CAPÍTULO {movie.number} DE 03</span></div>
    <div className="chapter-cover">
      <div className="chapter-scenery">
        <Image src={movie.sceneImage} alt={movie.sceneAlt} fill sizes="(max-width: 760px) 100vw, 44vw" className="chapter-scenery-image" priority />
        {movie.coverCharacterImage && <Image src={movie.coverCharacterImage} alt="" width={320} height={390} sizes="(max-width: 760px) 36vw, 220px" className="chapter-scenery-character" />}
        <span className="chapter-scenery-caption">UN MUNDO POR RECORDAR</span>
      </div>
      <div className="chapter-paper">
        <span className="page-botanical page-botanical-top" aria-hidden="true" />
        <div className="chapter-paper-heading">
          <p className="book-folio">CAPÍTULO {movie.number}</p>
          <div className="chapter-count" aria-label={chapter.recovered + " de 3 recuerdos recuperados"}>
            <strong>{chapter.recovered}<span> / 3</span></strong>
            <small>RECUERDOS</small>
            <span className="film-progress-dots" aria-hidden="true">{memories.map((memory) => <i key={memory.id} className={progress.statusFor(memory.id) === "recovered" ? "filled" : ""} />)}</span>
          </div>
        </div>
        <h1 id="chapter-heading">{movie.title}</h1>
        <p className="chapter-opening">{movie.opening}</p>
        <div className="chapter-object-gallery" aria-label="Los tres recuerdos de esta historia">
          {memories.map((memory) => {
            const status = progress.statusFor(memory.id);
            return <Link
              key={memory.id}
              href={"/recuerdos/" + movie.id + "/" + memory.id}
              className={"chapter-object-frame " + (status === "recovered" ? "is-recovered" : "")}
              aria-label={memory.title + ": " + statuses[status]}
            >
              <span className="chapter-object-art"><Image src={memory.image} alt="" width={180} height={180} sizes="(max-width: 760px) 25vw, 130px" className={"memory-shape-" + memory.imageShape} /></span>
              {status === "recovered" && <span className="chapter-recovered-seal" aria-hidden="true">✓</span>}
              <strong>{memory.title}</strong>
              <small>{statuses[status]}</small>
            </Link>;
          })}
        </div>
        <div className="chapter-paper-foot">
          <p>{chapter.status === "completed" ? "Las tres páginas de este capítulo volvieron a escribirse." : movie.note}</p>
          <small>{film?.year} · {film?.director}</small>
        </div>
        <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
      </div>
    </div>
  </article>;
}
