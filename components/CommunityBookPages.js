"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { hasFirebaseConfig } from "@/lib/firebase";
import { accountPublicName, loadPublicName, savePublicName } from "@/lib/auth";
import { filmIds, publishMemory, reportMemory, withdrawMemory } from "@/lib/sharedMemories";
import { useSharedMemories } from "@/hooks/useSharedMemories";

const filmNames = { chihiro: "El viaje de Chihiro", howl: "El castillo ambulante", totoro: "Mi vecino Totoro" };
function dateLabel(value) { return value?.toDate?.()?.toLocaleDateString("es-AR") || "Reciente"; }

function TravelerIcon() {
  return <span className="community-avatar" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="11" r="5" /><path d="M6.5 27c.7-6 4-9 9.5-9s8.8 3 9.5 9" /></svg></span>;
}

function CommunityContent({ progress, journey }) {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [film, setFilm] = useState(null);
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const user = progress.authUser;
  const uid = user?.uid;
  const signedIn = Boolean(user && !user.isAnonymous);
  const accountName = signedIn ? accountPublicName(user) : "";
  const memories = useSharedMemories(filter, uid);

  useEffect(() => {
    const pending = window.sessionStorage.getItem("pending-shared-memory");
    if (pending && filmIds.includes(pending)) {
      window.sessionStorage.removeItem("pending-shared-memory");
      queueMicrotask(() => { setFilm(pending); setView("share"); journey?.setMobilePage("right"); });
    }
  }, [journey]);
  useEffect(() => {
    if (!uid || !hasFirebaseConfig) return;
    if (accountName) {
      queueMicrotask(() => setName(accountName));
      return;
    }
    let live = true;
    loadPublicName(uid).then((value) => { if (live) setName(value); }).catch(() => {});
    return () => { live = false; };
  }, [uid, accountName]);

  async function run(task, success) {
    setBusy(true); setError(""); setMessage("");
    try { await task(); if (success) setMessage(success); await memories.refresh(); }
    catch (reason) { setError(reason.message || "No se pudo completar la operación."); }
    finally { setBusy(false); }
  }
  async function submitAuth(event) {
    event.preventDefault();
    await run(() => progress.submitEmail({ email, password, mode, publicName: name }), "Ya podés compartir tu recuerdo.");
  }
  async function publish() {
    const text = progress.chapter(film).answer;
    await run(async () => {
      const publicName = anonymous ? "" : await savePublicName(uid, accountName || name);
      await publishMemory({ uid, filmId: film, text, publicName, anonymous });
      setView("list");
    }, "Tu recuerdo ya forma parte de la red.");
  }
  const ownByFilm = Object.fromEntries(memories.own.map((item) => [item.filmId, item]));

  return <div className="storybook-cover"><div className="storybook-pages">
    <div className="storybook-page storybook-title-page community-left">
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <p className="book-folio">UN CAPÍTULO COMPARTIDO</p>
      <h1>Red de<br /><em>recuerdos</em></h1>
      <div className="ink-flourish" aria-hidden="true" />
      <h2>Historias de otros viajeros</h2>
      <p>Las páginas de esta biblioteca también guardan momentos de quienes la visitaron. Leé sus historias o compartí una de las tuyas.</p>
      <div className="community-illustration"><Image src="/images/scenes/totoro-character.png" alt="" width={160} height={160} sizes="110px" /></div>
      <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
    </div>
    <div className="storybook-page storybook-index-page community-right">
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      {view === "list" ? <>
        <h2>Historias compartidas</h2>
        <div className="community-filters" aria-label="Filtrar por película">{[["all","Todos"],["chihiro","Chihiro"],["howl","Howl"],["totoro","Totoro"]].map(([id,label]) => <button type="button" key={id} className={filter === id ? "active" : ""} onClick={() => setFilter(id)}>{label}</button>)}</div>
        <div className="community-list">
          {memories.loading && <p role="status">Buscando historias…</p>}
          {memories.error && <p role="alert">{memories.error}</p>}
          {!memories.loading && !memories.error && !memories.items.length && <p>Aún no hay recuerdos en esta página.</p>}
          {memories.items.map((item) => <article className="community-card" key={item.id}>
            <div className="community-card-head"><TravelerIcon /><div className="community-card-author"><strong>{item.authorName}</strong><small>{filmNames[item.filmId]}</small></div><time>{dateLabel(item.publishedAt)}</time></div>
            <p>{item.text.slice(0, 105)}{item.text.length > 105 ? "…" : ""}</p>
            <button type="button" onClick={() => { setSelected(item); setView("read"); }}>Leer recuerdo →</button>
          </article>)}
          {memories.hasMore && <button type="button" onClick={memories.more} disabled={memories.loading}>Más historias</button>}
        </div>
        <div className="community-footer"><button type="button" onClick={() => setView("mine")}>Mis recuerdos compartidos</button><button type="button" onClick={() => setView("choose")}>Compartir un recuerdo →</button></div>
      </> : view === "read" && selected ? <>
        <button type="button" className="community-back" onClick={() => setView("list")}>← Volver a la red</button>
        <h2>{filmNames[selected.filmId]}</h2><p className="community-byline"><TravelerIcon /><span>{selected.authorName} · {dateLabel(selected.publishedAt)}</span></p>
        <blockquote className="community-reading">{selected.text}</blockquote>
        <button type="button" onClick={() => run(() => reportMemory(selected.id, uid, "inapropiado"), "Gracias. Revisaremos este recuerdo.")} disabled={busy || !uid}>Reportar recuerdo</button>
      </> : view === "choose" || view === "mine" ? <>
        <button type="button" className="community-back" onClick={() => setView("list")}>← Volver a la red</button>
        <h2>{view === "mine" ? "Mis recuerdos compartidos" : "Elegí un recuerdo"}</h2>
        {view === "mine" && memories.ownError && <p role="alert" className="community-error">{memories.ownError}</p>}
        {filmIds.map((id) => {
          const saved = progress.chapter(id).saved;
          const own = ownByFilm[id];
          if (view === "mine" && !own) return null;
          return <div className="community-own" key={id}><span>{filmNames[id]}<small>{own ? " · Compartido" : saved ? " · En mi libro" : " · Aún sin completar"}</small></span>
            {saved && <button type="button" onClick={() => { setFilm(id); setView("share"); }}>{own ? "Editar" : "Compartir"}</button>}
            {own && <button type="button" onClick={() => run(() => withdrawMemory(uid, id), "El recuerdo quedó solo en tu libro.")} disabled={busy}>Retirar</button>}
          </div>;
        })}
        {view === "mine" && !memories.own.length && <p>Aún no compartiste recuerdos.</p>}
      </> : view === "share" && film ? <>
        <button type="button" className="community-back" onClick={() => setView("list")}>← Cancelar</button>
        <h2>Compartir en la red</h2>
        <p>{filmNames[film]}</p>
        <blockquote className="community-reading">{progress.chapter(film).answer}</blockquote>
        {signedIn && progress.accountSyncState === "offline" && <p role="alert" className="community-error">Tu sesión está activa, pero Firestore no pudo sincronizar el perfil. Revisá la conexión y las reglas antes de compartir.</p>}
        {!hasFirebaseConfig ? <p role="alert">Configurá Firebase para publicar. Tu recuerdo sigue guardado en el libro.</p> : !signedIn ? <form className="community-auth" onSubmit={submitAuth}>
          <p>Iniciá sesión para firmar y compartir esta historia.</p>
          <div><button type="button" onClick={() => setMode("signin")}>Ingresar</button><button type="button" onClick={() => setMode("signup")}>Crear cuenta</button></div>
          {mode === "signup" && <label>Nombre público<input value={name} onChange={(e) => setName(e.target.value)} maxLength={32} required /></label>}
          <label>Correo<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required /></label>
          <button type="submit" disabled={busy}>{mode === "signup" ? "Registrarme" : "Iniciar sesión"}</button>
          <button type="button" disabled={busy} onClick={() => run(progress.signInWithGoogle, "Sesión iniciada.")}>Continuar con Google</button>
          <button type="button" disabled={busy || !email} onClick={() => run(() => progress.resetPassword(email), "Enviamos un enlace para recuperar la contraseña.")}>Recuperar contraseña</button>
        </form> : <div className="community-publish">
          {accountName ? <p className="community-account-name">Firmarás como <strong>{accountName}</strong></p> : <label>Nombre público<input value={name} onChange={(e) => setName(e.target.value)} maxLength={32} disabled={anonymous} /></label>}
          <label><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} /> Publicar como Anónimo</label>
          <button type="button" disabled={busy} onClick={publish}>Confirmar y compartir recuerdo</button>
          <button type="button" onClick={() => setView("list")}>Guardar en mi libro</button>
        </div>}
      </> : null}
      {message && <p role="status" className="community-message">{message}</p>}
      {error && <p role="alert" className="community-error">{error}</p>}
      <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
    </div>
  </div></div>;
}

export default function CommunityBookPages({ progress, journey, preview }) {
  if (preview) return <div className="storybook-cover"><div className="storybook-pages"><div className="storybook-page storybook-title-page community-left"><h1>Red de recuerdos</h1></div><div className="storybook-page storybook-index-page community-right"><h2>Historias compartidas</h2></div></div></div>;
  return <CommunityContent progress={progress} journey={journey} />;
}
