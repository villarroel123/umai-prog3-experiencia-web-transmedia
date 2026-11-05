"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { movies } from "@/data/memories";
import { editSharedMemory, removeSharedMemory, reportSharedMemory, sharedMovieSymbols } from "@/lib/sharedMemories";

const filters = [{ id: "all", label: "Todos" }, { id: "chihiro", label: "Chihiro" }, { id: "howl", label: "Howl" }, { id: "totoro", label: "Totoro" }];
const movieFor = (id) => movies.find((movie) => movie.id === id);

function StoryCard({ memory, onRead, preview, index, own = false, onEdit, onRemove }) {
  const movie = movieFor(memory.movieId);
  return <article className={`community-card community-card--${memory.movieId}`} style={{ "--card-order": index }}>
    <span className="community-card-symbol" aria-hidden="true">{sharedMovieSymbols[memory.movieId]}</span>
    <div className="community-card-head"><strong>{memory.authorName}</strong><em>{movie?.title}</em></div>
    <p>{memory.memoryText}</p>
    <div className="community-card-actions">
      {own && <small>{memory.status === "published" ? "Publicado" : memory.status === "hidden" ? "Oculto para revisión" : "En revisión"}</small>}
      <button type="button" onClick={onRead} disabled={preview}>Leer recuerdo <span aria-hidden="true">↗</span></button>
      {own && <><button type="button" onClick={onEdit} disabled={preview}>Editar</button><button type="button" onClick={onRemove} disabled={preview}>Retirar</button></>}
    </div>
  </article>;
}

export default function CommunityBookPages({ progress, community, journey, preview = false }) {
  const [mode, setMode] = useState("feed");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [editText, setEditText] = useState("");
  const [editName, setEditName] = useState("");
  const [editAnonymous, setEditAnonymous] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const uid = progress.authUser?.uid;
  const visible = filter === "all" ? community.items : community.items.filter((memory) => memory.movieId === filter);
  const detail = selected && (community.items.find((memory) => memory.id === selected.id) || community.mine.find((memory) => memory.id === selected.id) || selected);
  const detailId = detail?.id;
  const detailMovie = detail && movieFor(detail.movieId);

  useEffect(() => {
    if (preview || journey?.spread !== "community" || journey?.turn || !uid) return;
    try {
      if (window.sessionStorage.getItem("biblioteca-abrir-mis-compartidos") !== "1") return;
      window.sessionStorage.removeItem("biblioteca-abrir-mis-compartidos");
      const timer = window.setTimeout(() => {
        setMode("mine");
        community.refreshMine().catch(() => setMessage("No se pudieron cargar tus publicaciones."));
      }, 0);
      return () => window.clearTimeout(timer);
    } catch { /* La red puede abrirse sin esta preferencia temporal. */ }
  }, [community, journey?.spread, journey?.turn, preview, uid]);

  async function openMine() {
    if (!uid) { setMessage("Iniciá sesión para administrar tus recuerdos compartidos."); return; }
    setMessage("");
    setMode("mine");
    try { await community.refreshMine(); }
    catch { setMessage("No se pudieron cargar tus publicaciones."); }
  }
  function openEdit(memory) {
    setSelected(memory);
    setEditText(memory.memoryText);
    setEditName(memory.isAnonymous ? "" : memory.authorName);
    setEditAnonymous(memory.isAnonymous);
    setMessage("");
    setMode("edit");
  }
  async function submitEdit(event) {
    event.preventDefault();
    if (working || !detail) return;
    setWorking(true);
    setMessage("");
    try {
      await editSharedMemory(detail, uid, { memoryText: editText, authorName: editName, isAnonymous: editAnonymous });
      await community.refreshMine();
      setMessage("Publicación actualizada.");
      setMode("mine");
    } catch (error) { setMessage(error.message || "No se pudo editar la publicación."); }
    finally { setWorking(false); }
  }
  async function remove(memory) {
    if (working || !window.confirm("¿Retirar este recuerdo de la Red? Tu recuerdo privado permanecerá en el libro.")) return;
    setWorking(true);
    setMessage("");
    try {
      await removeSharedMemory(memory, uid);
      await community.refreshMine();
      setSelected(null);
      setMode("mine");
      setMessage("El recuerdo dejó de compartirse. Tu página privada permanece intacta.");
    } catch (error) { setMessage(error.message || "No se pudo retirar la publicación."); }
    finally { setWorking(false); }
  }
  async function report() {
    if (!detail || !uid || !window.confirm("¿Reportar este recuerdo para revisión?")) return;
    setWorking(true);
    try { await reportSharedMemory(detail.id, uid); setMessage("Gracias. El reporte quedó registrado para revisión."); }
    catch (error) { setMessage(error.message || "No se pudo enviar el reporte."); }
    finally { setWorking(false); }
  }

  useEffect(() => {
    if (mode !== "detail" || !detailId) return;
    const frame = requestAnimationFrame(() => document.querySelector(".community-story-text")?.scrollTo(0, 0));
    return () => cancelAnimationFrame(frame);
  }, [mode, detailId]);

  return <div className="storybook-cover"><div className="storybook-pages">
    <div className={`storybook-page storybook-title-page community-left${mode === "detail" && detailMovie ? " community-left--story" : ""}`}>
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      {mode === "detail" && detailMovie ? <>
        <div className="community-story-art"><Image src={detailMovie.sceneImage} alt={detailMovie.sceneAlt} fill sizes="(max-width: 700px) 85vw, 36vw" /></div>
        <p className="community-story-film">{detailMovie.title}</p>
      </> : <>
        <p className="book-folio">HISTORIAS DE OTROS VIAJEROS</p>
        <h1>Red de<br /><em>recuerdos</em></h1>
        <div className="ink-flourish" aria-hidden="true" />
        <p className="community-intro">Cada recuerdo es una historia que merece ser contada. Descubrí los momentos que otros viajeros decidieron guardar.</p>
        <Image className="community-illustration" src="/images/scenes/totoro-character.png" alt="" width={112} height={112} sizes="90px" />
        <p className="community-count" aria-live="polite">{community.loading ? "Buscando historias…" : `${community.items.length} recuerdos compartidos`}</p>
      </>}
      <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
    </div>
    <div className="storybook-page storybook-index-page community-right">
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      {mode === "feed" ? <>
        <div className="community-heading"><span>HISTORIAS COMPARTIDAS</span><span>✦</span></div>
        <div className="community-filters" role="group" aria-label="Filtrar por película">
          {filters.map((item) => <button key={item.id} type="button" className={filter === item.id ? "is-selected" : ""} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} disabled={preview}>{item.label}</button>)}
        </div>
        {community.error && <p className="community-state" role="alert">{community.error}</p>}
        {!community.available && <p className="community-state">La Red de recuerdos necesita una conexión con Firebase. Tus recuerdos privados siguen disponibles.</p>}
        {community.available && community.loading && <p className="community-state" role="status">Abriendo las historias compartidas…</p>}
        {community.available && !community.loading && !community.error && visible.length === 0 && <p className="community-state">Todavía no hay recuerdos publicados {filter !== "all" ? "para esta película" : "en la red"}.</p>}
        <div className="community-card-scroll" aria-label="Recuerdos publicados">
          {visible.map((memory, index) => <StoryCard key={memory.id} memory={memory} index={index} preview={preview} onRead={() => { setSelected(memory); setMessage(""); setMode("detail"); }} />)}
        </div>
        <button className="community-text-button community-mine-link" type="button" onClick={openMine} disabled={preview}>Mis recuerdos compartidos →</button>
      </> : mode === "detail" && detail ? <>
        <button className="community-text-button community-back" type="button" onClick={() => { setMode("feed"); setMessage(""); }} disabled={preview}>← Volver a la red</button>
        <p className="community-detail-label">{sharedMovieSymbols[detail.movieId]} {detailMovie?.title}</p>
        <h1>{detail.memoryTitle}</h1>
        <p className="community-detail-author">Por {detail.authorName}</p>
        <div className="community-story-text" tabIndex={0}>{detail.memoryText}</div>
        {detail.status === "published" && <button className="community-text-button community-report" type="button" onClick={report} disabled={preview || !uid || working}>Reportar publicación</button>}
        {!uid && <small className="community-report-note">Iniciá sesión para reportar.</small>}
      </> : mode === "mine" ? <>
        <button className="community-text-button community-back" type="button" onClick={() => { setMode("feed"); setMessage(""); }} disabled={preview}>← Volver a la red</button>
        <h1>Mis recuerdos compartidos</h1>
        {community.mineLoading && <p className="community-state" role="status">Buscando tus publicaciones…</p>}
        {!community.mineLoading && community.mine.length === 0 && <p className="community-state">Todavía no compartiste recuerdos. Podés hacerlo desde una página restaurada.</p>}
        <div className="community-card-scroll" aria-label="Mis publicaciones">
          {community.mine.map((memory, index) => <StoryCard key={memory.id} memory={memory} index={index} preview={preview} own onRead={() => { setSelected(memory); setMode("detail"); }} onEdit={() => openEdit(memory)} onRemove={() => remove(memory)} />)}
        </div>
      </> : mode === "edit" && detail ? <>
        <button className="community-text-button community-back" type="button" onClick={() => { setMode("mine"); setMessage(""); }} disabled={preview || working}>← Mis recuerdos compartidos</button>
        <h1>Editar recuerdo</h1>
        <form className="community-edit" onSubmit={submitEdit}>
          <label>Tu historia<textarea value={editText} onChange={(event) => setEditText(event.target.value.slice(0, 500))} maxLength={500} rows={6} required /></label>
          <small>{editText.length} / 500</small>
          <label className="community-radio"><input type="radio" checked={editAnonymous} onChange={() => setEditAnonymous(true)} /> Publicar como Anónimo</label>
          <label className="community-radio"><input type="radio" checked={!editAnonymous} onChange={() => setEditAnonymous(false)} /> Publicar con mi nombre</label>
          {!editAnonymous && <label>Nombre público<input type="text" value={editName} onChange={(event) => setEditName(event.target.value.slice(0, 40))} maxLength={40} required /></label>}
          <button type="submit" className="book-chapter-start" disabled={preview || working || !editText.trim() || (!editAnonymous && !editName.trim())}>{working ? "Guardando…" : "Guardar cambios"}</button>
        </form>
      </> : null}
      {message && <p className="community-message" role="status">{message}</p>}
      <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
    </div>
  </div></div>;
}
