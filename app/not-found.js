import Link from "next/link";

export default function NotFound() {
  return <main className="story-world story-final story-final-locked">
    <p className="story-kicker">PÁGINA EXTRAVIADA</p>
    <div className="final-seal" aria-hidden="true">✧</div>
    <h1>Esta página no está en el libro.</h1>
    <p>Volvé al índice para elegir uno de los mundos disponibles.</p>
    <Link className="story-action" href="/biblioteca">Abrir el índice ↗</Link>
  </main>;
}
