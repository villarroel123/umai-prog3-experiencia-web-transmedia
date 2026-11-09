"use client";
import { useState } from "react";
export default function ShareMemoryActions({ chapterId, journey, preview }) {
  const [privateNotice, setPrivateNotice] = useState(false);
  if (preview) return null;
  return <div className="book-share-actions">
    <button type="button" onClick={() => setPrivateNotice(true)}>Guardar en mi libro</button>
    <button type="button" onClick={() => {
      window.sessionStorage.setItem("pending-shared-memory", chapterId);
      journey?.turnTo("community");
    }}>Compartir en la red →</button>
    {privateNotice && <span role="status">Este recuerdo sigue siendo privado.</span>}
  </div>;
}
