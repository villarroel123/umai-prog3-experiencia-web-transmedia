import Link from "next/link";
import { movies } from "@/data/memories";
import { chapterExperiences } from "@/data/chapterExperiences";

export default function FinalView({ progress }) {
  if (!progress.overall.finalUnlocked) {
    return <section className="story-final story-final-locked" aria-labelledby="final-heading">
      <p className="story-kicker">EL ÚLTIMO CAPÍTULO · SELLADO</p>
      <div className="final-seal" aria-hidden="true">✧</div>
      <h1 id="final-heading">El libro todavía<br />guarda páginas en blanco.</h1>
      <p>Guardaste {progress.overall.savedCount} de 3 recuerdos. El libro se completará cuando el boleto, la carta y la hoja encuentren su página.</p>
      <Link className="story-action" href="/biblioteca">Volver al índice ↗</Link>
    </section>;
  }

  return <section className="story-final story-final-open" aria-labelledby="final-heading">
    <p className="story-kicker">TRES RECUERDOS · TRES PÁGINAS RESTAURADAS</p>
    <h1 id="final-heading">Mi biblioteca<br /><em>de los recuerdos.</em></h1>
    <p>Cada historia nos deja un recuerdo. Ahora, este libro también guarda los tuyos.</p>
    <div className="final-book" aria-label="Los tres capítulos reconstruidos">
      {movies.map((movie, index) => <div className={"final-chapter final-chapter-" + (index + 1)} key={movie.id}>
        <span aria-hidden="true">{movie.emblem}</span>
        <small>PÁGINA {movie.number} · {chapterExperiences[movie.id].object}</small>
        <strong>{movie.title}</strong>
        <p>{chapterExperiences[movie.id].title}</p>
      </div>)}
    </div>
    <Link className="story-action" href="/biblioteca">Volver a la biblioteca ↗</Link>
  </section>;
}
