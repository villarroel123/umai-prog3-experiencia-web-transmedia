"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { memories } from "@/data/memories";
import { useProgress } from "@/hooks/useProgress";
import { getFirebaseServices, hasFirebaseConfig } from "@/lib/firebase";
import {
  getMemoryStatus, getMovieProgress, getOverallProgress,
  mergeMemoryStates, normalizeMemoryStates,
} from "@/lib/memoryProgress";

const LOCAL_KEY = "biblioteca-nueve-recuerdos-v1";
const validIds = new Set(memories.map((memory) => memory.id));

function storageKey(uid) {
  return uid ? LOCAL_KEY + ":" + uid : LOCAL_KEY + ":local";
}

function readLocal(uid) {
  try {
    return normalizeMemoryStates(JSON.parse(window.localStorage.getItem(storageKey(uid)) || "{}"));
  } catch {
    return {};
  }
}

function writeLocal(uid, states) {
  try {
    window.localStorage.setItem(storageKey(uid), JSON.stringify(states));
  } catch (error) {
    console.warn("No se pudo guardar el progreso de recuerdos en este navegador.", error);
  }
}

export function useMemoryProgress() {
  const auth = useProgress();
  const [states, setStates] = useState({});
  const [ready, setReady] = useState(false);
  const [memorySync, setMemorySync] = useState(hasFirebaseConfig ? "connecting" : "local");
  const statesRef = useRef({});
  const uidRef = useRef(null);
  const hydratedKeyRef = useRef(null);
  const transferRef = useRef(null);
  const writesRef = useRef(Promise.resolve());
  const uid = auth.authUser?.uid || null;

  useEffect(() => {
    if (hasFirebaseConfig && uidRef.current && uidRef.current !== uid) {
      uidRef.current = null;
      hydratedKeyRef.current = null;
      statesRef.current = {};
      queueMicrotask(() => {
        setStates({});
        setReady(false);
        setMemorySync("connecting");
      });
    }
    if (!auth.ready) return;
    if (hasFirebaseConfig && !uid && auth.syncState !== "offline") return;
    let cancelled = false;
    const nextUid = hasFirebaseConfig ? uid : null;
    const nextKey = nextUid || "local";
    if (hydratedKeyRef.current === nextKey) return;

    async function hydrate() {
      const local = readLocal(nextUid);
      let remote = {};
      let cloudAvailable = Boolean(nextUid);
      if (nextUid) {
        try {
          const { db } = getFirebaseServices();
          const snapshot = await getDoc(doc(db, "progress", nextUid));
          remote = normalizeMemoryStates(snapshot.exists() ? snapshot.data().memories : {});
        } catch (error) {
          console.warn("No se pudo leer el progreso de recuerdos en Firestore.", error);
          cloudAvailable = false;
        }
      } else {
        await Promise.resolve();
      }
      if (cancelled) return;
      const merged = mergeMemoryStates(local, remote, transferRef.current);
      transferRef.current = null;
      uidRef.current = nextUid;
      hydratedKeyRef.current = nextKey;
      statesRef.current = merged;
      setStates(merged);
      setReady(true);
      writeLocal(nextUid, merged);
      setMemorySync(nextUid ? cloudAvailable ? "cloud" : "offline" : hasFirebaseConfig ? "offline" : "local");

      if (nextUid && cloudAvailable && JSON.stringify(merged) !== JSON.stringify(remote)) {
        const { db } = getFirebaseServices();
        writesRef.current = writesRef.current.catch(() => {}).then(() => setDoc(
          doc(db, "progress", nextUid),
          { userId: nextUid, memories: merged, updatedAt: serverTimestamp() },
          { merge: true },
        ));
        writesRef.current.catch((error) => {
          console.warn("No se pudo sincronizar el progreso de recuerdos.", error);
          if (!cancelled) setMemorySync("offline");
        });
      }
    }
    hydrate();
    return () => { cancelled = true; };
  }, [auth.ready, auth.syncState, uid]);

  const persist = useCallback((next) => {
    const currentUid = uidRef.current;
    statesRef.current = next;
    setStates(next);
    writeLocal(currentUid, next);
    if (!currentUid || !hasFirebaseConfig) return Promise.resolve();
    const { db } = getFirebaseServices();
    writesRef.current = writesRef.current.catch(() => {}).then(() => setDoc(
      doc(db, "progress", currentUid),
      { userId: currentUid, memories: next, updatedAt: serverTimestamp() },
      { merge: true },
    ));
    return writesRef.current.then(
      () => setMemorySync("cloud"),
      (error) => {
        console.warn("No se pudo sincronizar el progreso de recuerdos.", error);
        setMemorySync("offline");
      },
    );
  }, []);

  const beginMemory = useCallback((memoryId) => {
    if (!validIds.has(memoryId) || !ready) return Promise.resolve(false);
    if (statesRef.current[memoryId]) return Promise.resolve(true);
    return persist({ ...statesRef.current, [memoryId]: "in-progress" }).then(() => true);
  }, [persist, ready]);

  const recoverMemory = useCallback((memoryId) => {
    if (!validIds.has(memoryId) || !ready) return Promise.resolve(false);
    if (statesRef.current[memoryId] === "recovered") return Promise.resolve(true);
    return persist({ ...statesRef.current, [memoryId]: "recovered" }).then(() => true);
  }, [persist, ready]);

  const signInWithGoogle = useCallback(async () => {
    transferRef.current = !auth.authUser || auth.authUser.isAnonymous ? statesRef.current : null;
    try {
      await auth.signInWithGoogle();
    } catch (error) {
      transferRef.current = null;
      throw error;
    }
  }, [auth]);

  const submitEmail = useCallback(async (details) => {
    transferRef.current = !auth.authUser || auth.authUser.isAnonymous ? statesRef.current : null;
    try {
      await auth.submitEmail(details);
    } catch (error) {
      transferRef.current = null;
      throw error;
    }
  }, [auth]);

  const continueAsGuest = useCallback(async () => {
    transferRef.current = null;
    await auth.continueAsGuest();
  }, [auth]);

  const overall = getOverallProgress(states);
  return {
    authError: auth.authError,
    authLoading: auth.authLoading,
    authUser: auth.authUser,
    beginMemory,
    continueAsGuest,
    firebaseConfigured: auth.firebaseConfigured,
    getMovieProgress: (movieId) => getMovieProgress(states, movieId),
    overall,
    ready,
    recoverMemory,
    signInWithGoogle,
    states,
    statusFor: (memoryId) => getMemoryStatus(states, memoryId),
    submitEmail,
    syncState: memorySync,
  };
}
