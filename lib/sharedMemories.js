import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, startAfter, where } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase";

export const filmIds = ["chihiro", "howl", "totoro"];
export const MAX_MEMORY_LENGTH = 500;
export const PAGE_SIZE = 6;

export function validateMemory(filmId, text) {
  if (!filmIds.includes(filmId)) throw new Error("Película inválida.");
  const clean = typeof text === "string" ? text.trim() : "";
  if (!clean || clean.length > MAX_MEMORY_LENGTH) throw new Error("Escribí un recuerdo de hasta 500 caracteres.");
  return clean;
}

function memoryRef(uid, filmId) {
  return doc(getFirebaseServices().db, "sharedMemories", `${uid}_${filmId}`);
}

export async function publishMemory({ uid, filmId, text, publicName, anonymous }) {
  const clean = validateMemory(filmId, text);
  if (!uid) throw new Error("Iniciá sesión para compartir.");
  if (!anonymous && !publicName) throw new Error("Elegí un nombre público o publicá como Anónimo.");
  const ref = memoryRef(uid, filmId);
  const existing = await getDoc(ref);
  const payload = {
    authorUid: uid, filmId, text: clean, authorName: anonymous ? "Anónimo" : publicName,
    anonymous: Boolean(anonymous), status: "published", updatedAt: serverTimestamp(),
  };
  if (!existing.exists()) payload.publishedAt = serverTimestamp();
  await setDoc(ref, payload, { merge: true });
  return ref.id;
}

export async function withdrawMemory(uid, filmId) {
  await deleteDoc(memoryRef(uid, filmId));
}

export async function listSharedMemories({ filmId = "all", cursor = null } = {}) {
  const { db } = getFirebaseServices();
  const filters = [where("status", "==", "published")];
  if (filmId !== "all") filters.push(where("filmId", "==", filmId));
  const q = query(collection(db, "sharedMemories"), ...filters, ...(cursor ? [startAfter(cursor)] : []), limit(PAGE_SIZE));
  const snapshot = await getDocs(q);
  return { items: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })), cursor: snapshot.docs.at(-1) || null };
}

export async function listOwnMemories(uid) {
  const snapshots = await Promise.all(filmIds.map((filmId) => getDoc(memoryRef(uid, filmId))));
  return snapshots.filter((item) => item.exists()).map((item) => ({ id: item.id, ...item.data() }));
}

export async function reportMemory(memoryId, reporterUid, reason) {
  if (!reporterUid || !memoryId || !["inapropiado", "spam", "otro"].includes(reason)) throw new Error("Reporte inválido.");
  const { db } = getFirebaseServices();
  await setDoc(doc(db, "memoryReports", `${memoryId}_${reporterUid}`), {
    memoryId, reporterUid, reason, createdAt: serverTimestamp(), status: "pending",
  });
}
