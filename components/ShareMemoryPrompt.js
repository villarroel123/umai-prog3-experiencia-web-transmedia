"use client";

import { useState } from "react";
import { shareMemory } from "@/lib/sharedMemories";

export default function ShareMemoryPrompt({ chapterId, answer, progress, journey, preview = false }) {
  const [open, setOpen] = useState(false);
  const [anonymous, setAnonymous] = useState(true);
  const [name, setName] = useState(progress.authUser?.displayName || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const uid = progress.authUser?.uid;

  async function submit(event) {
    event.preventDefault();
    if (busy || success) return;
    setBusy(true);
    setMessage("");
    try {
      await shareMemory({ uid, movieId: chapterId, memoryText: answer, authorName: name, isAnonymous: anonymous });
      setSuccess(true);
    } catch (error) {
      setMessage(error.message || "No se pudo compartir el recuerdo.");
    } finally { setBusy(false); }
  }

  return <>
    {!preview && !open && <button className="book-share-open" type="button" onClick={() => setOpen(true)}>Compartir mi recuerdo en la red →</button>}
    {!preview && open && <div className="book-share-sheet" role="region" aria-label="Compartir recuerdo">
      {success ? <div className="book-share-success" role="status">
        <div className="book-share-success-card" aria-hidden="true">✦</div>
        <h2>Tu recuerdo ya forma parte de la biblioteca</h2>
        <p>Quedó en revisión. Otras personas podrán leerlo cuando se apruebe.</p>
        <button type="button" className="book-share-action" onClick={() => {
          try { window.sessionStorage.setItem("biblioteca-abrir-mis-compartidos", "1"); } catch { /* La red sigue accesible. */ }
          journey?.turnTo("community");
        }}>Ver mi publicación en la red →</button>
        <button type="button" className="book-share-cancel" onClick={() => setOpen(false)}>Volver a mi página</button>
      </div> : <form onSubmit={submit}>
        <h2>¿Querés que otros viajeros puedan leer tu recuerdo?</h2>
        <p>Se publicará este texto después de una revisión. Tu página privada seguirá en tu libro.</p>
        <blockquote className="book-share-preview">{answer}</blockquote>
        <label className="book-share-choice"><input type="radio" name={`share-name-${chapterId}`} checked={anonymous} onChange={() => setAnonymous(true)} /> Publicar como Anónimo</label>
        <label className="book-share-choice"><input type="radio" name={`share-name-${chapterId}`} checked={!anonymous} onChange={() => setAnonymous(false)} /> Publicar con mi nombre</label>
        {!anonymous && <label className="book-share-name">Nombre público<input type="text" value={name} onChange={(event) => setName(event.target.value.slice(0, 40))} maxLength={40} required autoComplete="nickname" /></label>}
        {!uid && <p className="book-share-note">Para compartir, conectá Firebase e iniciá sesión. Tu recuerdo privado sigue guardado.</p>}
        {message && <p className="book-share-error" role="alert">{message}</p>}
        <div className="book-share-actions">
          <button className="book-share-action" type="submit" disabled={!uid || busy || (!anonymous && !name.trim())}>{busy ? "Compartiendo…" : "Compartir recuerdo"}</button>
          <button className="book-share-cancel" type="button" onClick={() => setOpen(false)} disabled={busy}>Cancelar</button>
        </div>
      </form>}
    </div>}
  </>;
}
