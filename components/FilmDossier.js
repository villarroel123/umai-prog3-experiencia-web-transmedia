export default function FilmDossier({ film }) {
  return <section className="film-dossier" aria-labelledby="film-dossier-title">
    <div className="dossier-heading">
      <div>
        <p className="eyebrow">ARCHIVO CINEMATOGRÁFICO · {film.sourceStatus === "api" ? "API CONECTADA" : "COPIA LOCAL"}</p>
        <h2 id="film-dossier-title">La película detrás del recuerdo</h2>
      </div>
      <span className="dossier-emblem" aria-hidden="true">✧</span>
    </div>
    <div className="dossier-grid">
      <div className="dossier-title-block">
        <span>TÍTULO INTERNACIONAL</span>
        <h3>{film.title}</h3>
        <p lang="ja">{film.originalTitle}</p>
        <small>{film.romanisedTitle}</small>
      </div>
      <dl>
        <div><dt>ESTRENO</dt><dd>{film.year}</dd></div>
        <div><dt>DURACIÓN</dt><dd>{film.minutes} min</dd></div>
        <div><dt>DIRECCIÓN</dt><dd>{film.director}</dd></div>
        <div><dt>PRODUCCIÓN</dt><dd>{film.producer}</dd></div>
      </dl>
    </div>
    <div className="dossier-description">
      <span>SINOPSIS DE LA API · TEXTO ORIGINAL EN INGLÉS</span>
      <p lang="en">{film.description}</p>
    </div>
    <div className="dossier-footer">
      <span>{film.sourceStatus === "api" ? "Datos obtenidos de Studio Ghibli API" : "Datos de respaldo; la API no respondió"}</span>
      <a href={film.sourceUrl} target="_blank" rel="noopener noreferrer">Ver ficha en la API ↗</a>
    </div>
  </section>;
}
