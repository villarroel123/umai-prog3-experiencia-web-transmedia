import Link from "next/link";
import { movies } from "@/data/memories";

export default function FinalView({ progress }) {
  if (!progress.overall.finalUnlocked) {
    return <section className="story-final story-final-locked" aria-labelledby="final-heading">
      <p className="story-kicker">EL ÚLTIMO CAPÍTULO · SELLADO</p>
      <div className="final-seal" aria-hidden="true">✧</div>
      <h1 id="final-heading">El libro todavía<br />guarda páginas en blanco.</h1>
      <p>Recuperaste {progress.overall.recovered} de 9 recuerdos. Las tres historias se abrirán cuando todos regresen.</p>
      <Link className="story-action" href="/biblioteca">Volver al índice ↗</Link>
    </section>;
  }

  return <section className="story-final story-final-open" aria-labelledby="final-heading">
    <p className="story-kicker">LOS NUEVE RECUERDOS HAN REGRESADO</p>
    <h1 id="final-heading">La magia de las historias<br /><em>ha regresado.</em></h1>
    <p>Cada recuerdo recuperado devolvió una parte de este mundo. Ahora, las páginas vuelven a contar sus historias.</p>
    <div className="final-book" aria-label="Los tres capítulos reconstruidos">
      {movies.map((movie, index) => <div className={"final-chapter final-chapter-" + (index + 1)} key={movie.id}>
        <span aria-hidden="true">{movie.emblem}</span>
        <small>LIBRO {movie.number} · 3 RECUERDOS</small>
        <strong>{movie.title}</strong>
        <p>{movie.note}</p>
      </div>)}
    </div>
    <Link className="story-action" href="/biblioteca">Volver a la biblioteca ↗</Link>
  </section>;
}
