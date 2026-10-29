"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useProgress } from "@/hooks/useProgress";
import { getFirebaseServices, hasFirebaseConfig } from "@/lib/firebase";
import { chapterState, mergeStoryProgress, normalizeStoryProgress, storyChapterIds, storySummary } from "@/lib/storyProgress";

const STORAGE_KEY = "biblioteca-tres-recuerdos-v1";

function localKey(uid) { return `${STORAGE_KEY}:${uid || "local"}`; }

function readLocal(uid) {
  try { return normalizeStoryProgress(JSON.parse(window.localStorage.getItem(localKey(uid)) || "{}")); }
  catch { return {}; }
}

function writeLocal(uid, chapters) {
  try { window.localStorage.setItem(localKey(uid), JSON.stringify(chapters)); }
  catch (error) { console.warn("No se pudo guardar el nuevo recorrido en este navegador.", error); }
}

export function useStoryProgress() {
  const auth = useProgress();
  const uid = auth.authUser?.uid || null;
  const [chapters, setChapters] = useState({});
  const [ready, setReady] = useState(false);
  const [hydratedKey, setHydratedKey] = useState(null);
  const [syncState, setSyncState] = useState(hasFirebaseConfig ? "connecting" : "local");
  const chaptersRef = useRef({});
  const uidRef = useRef(null);
  const hydratedRef = useRef(null);
  const transferRef = useRef(null);
  const writesRef = useRef(Promise.resolve());

  useEffect(() => {
    if (!auth.ready || (hasFirebaseConfig && !uid && auth.syncState !== "offline")) return;
    const key = uid || "local";
    if (hydratedRef.current === key) return;
    let cancelled = false;
    async function hydrate() {
      let remote = {};
      let cloud = Boolean(uid);
      if (uid) {
        try {
          const { db } = getFirebaseServices();
          const snapshot = await getDoc(doc(db, "storyProgress", uid));
          remote = normalizeStoryProgress(snapshot.exists() ? snapshot.data().chapters : {});
        } catch (error) {
          console.warn("No se pudo leer el recorrido nuevo en Firestore.", error);
          cloud = false;
        }
      }
      if (cancelled) return;
      const next = mergeStoryProgress(readLocal(uid), remote, transferRef.current);
      transferRef.current = null;
      uidRef.current = uid;
      hydratedRef.current = key;
      setHydratedKey(key);
      chaptersRef.current = next;
      setChapters(next);
      setReady(true);
      setSyncState(uid ? cloud ? "cloud" : "offline" : hasFirebaseConfig ? "offline" : "local");
      writeLocal(uid, next);
      if (uid && cloud && JSON.stringify(next) !== JSON.stringify(remote)) {
        const { db } = getFirebaseServices();
        writesRef.current = writesRef.current.catch(() => {}).then(() => setDoc(
          doc(db, "storyProgress", uid),
          { userId: uid, chapters: next, updatedAt: serverTimestamp() },
          { merge: true },
        ));
        writesRef.current.catch((error) => {
          console.warn("No se pudo sincronizar el nuevo recorrido.", error);
          if (!cancelled) setSyncState("offline");
        });
      }
    }
    hydrate();
    return () => { cancelled = true; };
  }, [auth.ready, auth.syncState, uid]);

  const persist = useCallback((next) => {
    chaptersRef.current = next;
    setChapters(next);
    const currentUid = uidRef.current;
    writeLocal(currentUid, next);
    if (!currentUid || !hasFirebaseConfig) return Promise.resolve();
    const { db } = getFirebaseServices();
    writesRef.current = writesRef.current.catch(() => {}).then(() => setDoc(
      doc(db, "storyProgress", currentUid),
      { userId: currentUid, chapters: next, updatedAt: serverTimestamp() },
      { merge: true },
    ));
    return writesRef.current.then(
      () => setSyncState("cloud"),
      (error) => { console.warn("No se pudo sincronizar el nuevo recorrido.", error); setSyncState("offline"); },
    );
  }, []);

  const startGame = useCallback((id) => {
    if (!ready || !storyChapterIds.includes(id)) return Promise.resolve(false);
    if (chaptersRef.current[id]?.started) return Promise.resolve(true);
    return persist({ ...chaptersRef.current, [id]: { started: true, gameComplete: false, objectRecovered: false, ticketRecovered: false, answer: "", pageRestored: false, updatedAt: Date.now() } }).then(() => true);
  }, [persist, ready]);

  const completeGame = useCallback((id) => {
    if (!ready || !storyChapterIds.includes(id)) return Promise.resolve(false);
    if (chaptersRef.current[id]?.gameComplete) return Promise.resolve(true);
    return persist({ ...chaptersRef.current, [id]: { started: true, gameComplete: true, objectRecovered: true, ticketRecovered: id === "chihiro", answer: "", pageRestored: false, updatedAt: Date.now() } }).then(() => true);
  }, [persist, ready]);

  const saveAnswer = useCallback((id, value) => {
    const answer = typeof value === "string" ? value.trim().slice(0, 500) : "";
    if (!ready || !storyChapterIds.includes(id) || !chaptersRef.current[id]?.gameComplete || !chaptersRef.current[id]?.objectRecovered || !answer) return Promise.resolve(false);
    return persist({ ...chaptersRef.current, [id]: { started: true, gameComplete: true, objectRecovered: true, ticketRecovered: id === "chihiro", answer, pageRestored: true, updatedAt: Date.now() } }).then(() => true);
  }, [persist, ready]);

  const signInWithGoogle = useCallback(async () => {
    transferRef.current = !auth.authUser || auth.authUser.isAnonymous ? chaptersRef.current : null;
    try { await auth.signInWithGoogle(); }
    catch (error) { transferRef.current = null; throw error; }
  }, [auth]);

  const submitEmail = useCallback(async (details) => {
    transferRef.current = !auth.authUser || auth.authUser.isAnonymous ? chaptersRef.current : null;
    try { await auth.submitEmail(details); }
    catch (error) { transferRef.current = null; throw error; }
  }, [auth]);

  const hydrated = ready && hydratedKey === (uid || "local");
  return {
    authError: auth.authError,
    authLoading: auth.authLoading,
    authUser: auth.authUser,
    continueAsGuest: auth.continueAsGuest,
    firebaseConfigured: auth.firebaseConfigured,
    signInWithGoogle,
    submitEmail,
    ready: hydrated,
    syncState,
    startGame,
    completeGame,
    saveAnswer,
    chapter: (id) => chapterState(chapters, id),
    overall: storySummary(chapters),
  };
}
