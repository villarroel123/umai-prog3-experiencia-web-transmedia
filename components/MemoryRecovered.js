import Image from "next/image";
import Link from "next/link";

export default function MemoryRecovered({ movie, memory, syncState }) {
  return <div className="memory-recovered-page" role="status">
    <p className="book-folio">LIBRO {movie.number} · RECUERDO RECUPERADO</p>
    <h1 id="minigame-heading">{memory.title}</h1>
    <div className="ink-flourish" aria-hidden="true" />
    <span className="recovered-sparkles" aria-hidden="true" />
    <div className={"memory-paper-art recovered-art memory-shape-" + memory.imageShape}>
      <Image src={memory.image} alt={memory.imageAlt} fill sizes="(max-width: 760px) 55vw, 22vw" />
    </div>
    <p className="recovered-label">Recuerdo recuperado</p>
    <p className="recovered-narrative">{memory.narrative}</p>
    <small className="recovered-save">{syncState === "cloud" ? "Guardado en la nube" : "Guardado en este navegador"}</small>
    <div className="recovered-actions">
      <Link href={"/recuerdos/" + movie.id}>Volver al capítulo ↗</Link>
      <Link href="/biblioteca">Abrir el libro</Link>
    </div>
  </div>;
}
