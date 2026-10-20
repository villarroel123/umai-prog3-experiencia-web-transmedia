"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { chapters } from "@/data/chapters";
import { useProgress } from "@/hooks/useProgress";
import AuthPanel from "@/components/AuthPanel";
import ThreeArtifact from "@/components/ThreeArtifact";

export default function Experience({ initialChapterId, filmDossier }) {
  const router = useRouter();
  const activeIndex = Math.max(chapters.findIndex((item) => item.id === initialChapterId), 0);
  const entered = Boolean(initialChapterId);
  const [authOpen, setAuthOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [justFound, setJustFound] = useState(false);
  const {
    authError, authLoading, authUser, continueAsGuest, discovered, discover,
    firebaseConfigured, ready, reset, signInWithGoogle, submitEmail, syncState,
  } = useProgress();
  const chapter = chapters[activeIndex];
  const isDiscovered = discovered.has(chapter.clueId);
  const count = chapters.filter((item) => discovered.has(item.clueId)).length;
  const allFound = count === chapters.length;

  useEffect(() => {
    if (!justFound) return;
    const timeout = window.setTimeout(() => setJustFound(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [justFound]);

  function canOpen(index) {
    return index === 0 || discovered.has(chapters[index - 1].clueId);
  }

  function handleDiscover() {
    if (isDiscovered) return;
    discover(chapter.clueId);
    setJustFound(true);
    if (activeIndex === chapters.length - 1) setCompletionOpen(true);
  }

  async function handleReset() {
    setCompletionOpen(false);
    try {
      await reset();
    } finally {
      router.push("/");
    }
  }

  if (!ready) return <main className="loading">Abriendo la biblioteca…</main>;

  if (entered && !canOpen(activeIndex)) {
    const nextAvailable = chapters.findIndex((_, index) => !canOpen(index));
    const destination = chapters[Math.max(0, nextAvailable - 1)].id;
    return <main className="locked-screen">
      <div className="locked-card">
        <p className="eyebrow">PÁGINA SELLADA</p>
        <h1>Este libro aún no puede abrirse.</h1>
        <p>Recuperá el recuerdo del capítulo anterior para continuar el recorrido.</p>
        <button className="primary-button" onClick={() => router.push(`/archivo/${destination}`)}>Volver al recuerdo pendiente ↗</button>
      </div>
    </main>;
  }

  return (
    <main className={`experience ${entered ? "inside" : "at-door"}`}>
      <div className="grain" aria-hidden="true" />
      <header className="topbar">
        <button className="brand" onClick={() => router.push("/")} aria-label="Volver a la portada">
          <span className="brand-mark">✦</span> LA BIBLIOTECA <span>DE LOS RECUERDOS</span>
        </button>
        <div className="top-actions">
          <span className="progress-pill">✧ {count} / {chapters.length} recuerdos</span>
          <span className="sync-pill" title="Estado de persistencia">{syncState === "cloud" ? "● NUBE" : syncState === "offline" ? "● OFFLINE" : syncState === "connecting" ? "◌ CONECTANDO" : "● LOCAL"}</span>
          {firebaseConfigured && <button className="account-button" onClick={() => setAuthOpen(true)}>
            {authUser?.isAnonymous ? "Invitado" : authUser?.displayName || authUser?.email || "Mi cuenta"}
          </button>}
        </div>
      </header>

      {!entered ? (
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow light">UN LIBRO. TRES MUNDOS. RECUERDOS POR ENCONTRAR.</p>
            <h1 id="hero-title">La biblioteca<br /><em>de los recuerdos</em></h1>
            <p className="hero-copy">Las páginas de un libro mágico están quedando en blanco. Explorá sus mundos, recuperá tres recuerdos y ayudá a reescribir su historia.</p>
            <button className="primary-button" onClick={() => router.push(`/archivo/${chapters[0].id}`)}>
              Entrar a la biblioteca <span aria-hidden="true">↗</span>
            </button>
            <p className="hero-note">Una experiencia interactiva inspirada en los mundos de Studio Ghibli · Prototipo académico</p>
          </div>
          <div className="hero-bottom"><span>DESLIZÁ LA MIRADA · ABRÍ EL LIBRO</span><span>✦</span><span>01 / 03</span></div>
        </section>
      ) : (
        <>
          <div className="chapter-shell" style={{ "--chapter-color": chapter.color }}>
            <aside className="shelf-nav" aria-label="Libros de la biblioteca">
              <p className="eyebrow">EL RECORRIDO</p>
              <h2>Los tres<br />mundos</h2>
              <p className="shelf-intro">Cada recuerdo recuperado revela la siguiente página.</p>
              <nav className="book-list">
                {chapters.map((item, index) => (
                  <button key={item.id} type="button" disabled={!canOpen(index)}
                    aria-current={index === activeIndex ? "page" : undefined}
                    onClick={() => router.push(`/archivo/${item.id}`)}
                    className={`book-link ${index === activeIndex ? "active" : ""}`}>
                    <span className="book-number">{item.number}</span>
                    <span><strong>{item.label}</strong><small>{item.shortLabel}</small></span>
                    <span className="book-state" aria-hidden="true">{discovered.has(item.clueId) ? "✦" : canOpen(index) ? "↗" : "⌁"}</span>
                  </button>
                ))}
              </nav>
              <div className="shelf-bottom">
                <span>EL LIBRO {allFound ? "ESTÁ COMPLETO" : "ESPERA TUS RECUERDOS"}</span>
                <button onClick={handleReset}>↺ Reiniciar recorrido</button>
              </div>
            </aside>

            <section className="chapter-main" aria-labelledby="chapter-title">
              <div className="chapter-heading">
                <div><p className="eyebrow">{chapter.eyebrow}</p><h1 id="chapter-title">{chapter.title}</h1></div>
                <span className="chapter-index">{chapter.number}<small> / 03</small></span>
              </div>
              <div className={`story-window ${chapter.landscape}`}>
                <div className="window-stars" aria-hidden="true">✦ · ✧ · ✦</div>
                <div className="story-panel">
                  <small>PÁGINA {chapter.number} · RECUERDO {isDiscovered ? "ENCONTRADO" : "PERDIDO"}</small>
                  <p>{chapter.copy}</p>
                </div>
              </div>
              <div className="explore-row">
                <div className="artifact-wrap">
                  <ThreeArtifact key={chapter.id} chapter={chapter} discovered={isDiscovered} onDiscover={handleDiscover} />
                  <span className="artifact-hint">OBJETO INTERACTIVO · ARRASTRÁ PARA OBSERVAR</span>
                </div>
                <div className={`memory-page ${isDiscovered ? "written" : ""} ${justFound ? "just-written" : ""}`}>
                  {justFound && <span className="turning-leaf" aria-hidden="true" />}
                  <div className="page-corner" aria-hidden="true">✧</div>
                  <p className="eyebrow">EL LIBRO DE LOS RECUERDOS</p>
                  <h3>{isDiscovered ? chapter.clueLabel : "Esta página está en blanco…"}</h3>
                  <p className="memory-text">{isDiscovered ? chapter.memory : "Un recuerdo perdido aguarda entre los pliegues de este mundo."}</p>
                  {isDiscovered ? (
                    activeIndex < chapters.length - 1 ?
                      <button className="next-link" onClick={() => router.push(`/archivo/${chapters[activeIndex + 1].id}`)}>Pasar a la siguiente página →</button> :
                      <button className="next-link" onClick={() => setCompletionOpen(true)}>Ver el libro completo →</button>
                  ) : <button className="collect-button" onClick={handleDiscover}>✦ Recuperar recuerdo</button>}
                  <small className="accessible-note">{isDiscovered ? "La página volvió a escribirse." : chapter.instruction}</small>
                </div>
              </div>
              {filmDossier}
            </section>
          </div>
        </>
      )}

      {completionOpen && <section className="completion" role="dialog" aria-modal="true" aria-labelledby="ending-title">
        <div className="completion-book">
          <button className="close" onClick={() => setCompletionOpen(false)} aria-label="Cerrar desenlace">×</button>
          <p className="eyebrow">LOS TRES RECUERDOS SE REUNIERON</p>
          <h2 id="ending-title">El libro vuelve<br /><em>a contar su historia.</em></h2>
          <div className="ending-words">{chapters.map((item) => <span key={item.id}>✦ {item.clueLabel}</span>)}</div>
          <p>Esta es la base de la experiencia. Las escenas, imágenes y textos definitivos se incorporarán al investigar cada película.</p>
          <button className="primary-button" onClick={() => { setCompletionOpen(false); router.push("/"); }}>Volver a la biblioteca ↗</button>
        </div>
      </section>}
      {authOpen && <AuthPanel authError={authError} authLoading={authLoading} onClose={() => setAuthOpen(false)} onContinueAsGuest={continueAsGuest} onGoogle={signInWithGoogle} onSubmitEmail={submitEmail} user={authUser} />}
    </main>
  );
}
