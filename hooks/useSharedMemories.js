"use client";

import { useCallback, useEffect, useState } from "react";
import { hasFirebaseConfig } from "@/lib/firebase";
import { ownSharedMemories, watchPublishedMemories } from "@/lib/sharedMemories";

export function useSharedMemories(uid) {
  const [items, setItems] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(hasFirebaseConfig);
  const [error, setError] = useState("");
  const [mineLoading, setMineLoading] = useState(false);

  useEffect(() => {
    if (!hasFirebaseConfig) return;
    return watchPublishedMemories(
      (next) => { setItems(next); setLoading(false); setError(""); },
      () => { setLoading(false); setError("No se pudieron cargar los recuerdos compartidos. Intentá de nuevo más tarde."); },
    );
  }, []);

  const refreshMine = useCallback(async () => {
    if (!uid || !hasFirebaseConfig) { setMine([]); return []; }
    setMineLoading(true);
    try {
      const next = await ownSharedMemories(uid);
      setMine(next);
      return next;
    } finally { setMineLoading(false); }
  }, [uid]);

  return { items, mine, loading, error, mineLoading, refreshMine, available: hasFirebaseConfig };
}
