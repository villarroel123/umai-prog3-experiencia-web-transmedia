"use client";
import { useCallback, useEffect, useState } from "react";
import { hasFirebaseConfig } from "@/lib/firebase";
import { listOwnMemories, listSharedMemories } from "@/lib/sharedMemories";

function withTimeout(promise) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("timeout")), 12000); })])
    .finally(() => clearTimeout(timer));
}

function newestFirst(items) {
  return [...items].sort((left, right) =>
    (right.publishedAt?.toMillis?.() || 0) - (left.publishedAt?.toMillis?.() || 0));
}

export function useSharedMemories(filmId, uid) {
  const [items, setItems] = useState([]);
  const [own, setOwn] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ownError, setOwnError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const refresh = useCallback(async () => {
    if (!hasFirebaseConfig) { setError("La Red de recuerdos necesita conexión con Firebase."); return; }
    setLoading(true); setError(""); setOwnError("");
    try {
      const [publicResult, ownResult] = await Promise.allSettled([
        withTimeout(listSharedMemories({ filmId })),
        uid ? withTimeout(listOwnMemories(uid)) : Promise.resolve([]),
      ]);
      if (publicResult.status === "fulfilled") {
        const page = publicResult.value;
        setItems(newestFirst(page.items)); setCursor(page.cursor); setHasMore(page.items.length === 6);
      } else {
        console.warn("No se pudieron cargar las historias públicas.", publicResult.reason);
        setError("No se pudieron cargar las historias. Intentá de nuevo.");
      }
      if (ownResult.status === "fulfilled") setOwn(ownResult.value);
      else {
        console.warn("No se pudieron cargar tus recuerdos compartidos.", ownResult.reason);
        setOwnError("No se pudieron cargar tus recuerdos compartidos.");
      }
    } catch (reason) { console.warn("No se pudo actualizar la red.", reason); setError("No se pudieron cargar las historias. Intentá de nuevo."); }
    finally { setLoading(false); }
  }, [filmId, uid]);
  useEffect(() => { queueMicrotask(refresh); }, [refresh]);
  const more = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const page = await withTimeout(listSharedMemories({ filmId, cursor }));
      setItems((old) => newestFirst([...old, ...page.items])); setCursor(page.cursor); setHasMore(page.items.length === 6);
    } catch (reason) { console.warn("No se pudo cargar la siguiente página.", reason); setError("No se pudo cargar la siguiente página."); }
    finally { setLoading(false); }
  }, [cursor, filmId, loading]);
  return { items, own, loading, error, ownError, hasMore, refresh, more };
}
