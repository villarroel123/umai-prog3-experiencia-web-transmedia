import {
  collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp,
  setDoc, updateDoc, where, writeBatch,
} from "firebase/firestore";
import { getFirebaseServices, hasFirebaseConfig } from "@/lib/firebase";
import { chapterExperiences } from "@/data/chapterExperiences";

export const sharedMovieIds = ["chihiro", "howl", "totoro"];
export const sharedMovieSymbols = { chihiro: "✧", howl: "✉", totoro: "✿" };
export const sharedMemoryLimit = 500;

function database() {
  const services = getFirebaseServices();
  if (!services?.db) throw new Error("La red necesita una conexión con Firebase.");
  return services.db;
}

function ownerRef(db, uid, movieId) {
  return doc(db, "sharedMemoryOwners", uid, "items", movieId);
}

export function publicName(value) {
  return typeof value === "string" ? value.trim().slice(0, 40) : "";
}

export function safeSharedMemory(snapshot) {
  const data = snapshot.data();
  if (!sharedMovieIds.includes(data.movieId) || typeof data.memoryText !== "string") return null;
  return {
    id: snapshot.id,
    authorName: data.isAnonymous ? "Anónimo" : publicName(data.authorName) || "Anónimo",
    isAnonymous: data.isAnonymous === true,
    movieId: data.movieId,
    memoryTitle: chapterExperiences[data.movieId].title,
    memoryText: data.memoryText.slice(0, sharedMemoryLimit),
    status: data.status,
    createdAt: data.createdAt?.toMillis?.() || 0,
  };
}

export function watchPublishedMemories(onData, onError) {
  if (!hasFirebaseConfig) { onData([]); return () => {}; }
  const db = database();
  return onSnapshot(
    query(collection(db, "sharedMemories"), where("status", "==", "published")),
    (snapshot) => onData(snapshot.docs.map(safeSharedMemory).filter(Boolean).sort((a, b) => b.createdAt - a.createdAt)),
    onError,
  );
}

export async function ownSharedMemories(uid) {
  if (!uid || !hasFirebaseConfig) return [];
  const db = database();
  const mappings = await getDocs(collection(db, "sharedMemoryOwners", uid, "items"));
  const documents = await Promise.all(mappings.docs.map(async (mapping) => {
    const memoryId = mapping.data().memoryId;
    if (typeof memoryId !== "string") return null;
    const snapshot = await getDoc(doc(db, "sharedMemories", memoryId));
    return snapshot.exists() ? safeSharedMemory(snapshot) : null;
  }));
  return documents.filter(Boolean);
}

export async function shareMemory({ uid, movieId, memoryText, authorName, isAnonymous }) {
  if (!uid || !hasFirebaseConfig || !sharedMovieIds.includes(movieId)) throw new Error("Iniciá sesión para compartir.");
  if (typeof memoryText !== "string" || !memoryText.trim() || memoryText.length > sharedMemoryLimit) throw new Error("El recuerdo debe tener entre 1 y 500 caracteres.");
  const name = isAnonymous ? "Anónimo" : publicName(authorName);
  if (!name) throw new Error("Elegí un nombre público o publicá como Anónimo.");
  const db = database();
  const existing = await getDoc(ownerRef(db, uid, movieId));
  if (existing.exists()) throw new Error("Este recuerdo ya se compartió. Podés administrarlo en Mis recuerdos compartidos.");
  const memory = doc(collection(db, "sharedMemories"));
  const batch = writeBatch(db);
  batch.set(ownerRef(db, uid, movieId), { memoryId: memory.id, movieId, createdAt: serverTimestamp() });
  batch.set(memory, {
    authorName: name, isAnonymous: Boolean(isAnonymous), movieId,
    memoryTitle: chapterExperiences[movieId].title,
    memoryText, status: "pending",
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return memory.id;
}

export async function editSharedMemory(memory, uid, { memoryText, authorName, isAnonymous }) {
  if (!uid || !memory) throw new Error("No se pudo identificar la publicación.");
  if (typeof memoryText !== "string" || !memoryText.trim() || memoryText.length > sharedMemoryLimit) throw new Error("El recuerdo debe tener entre 1 y 500 caracteres.");
  const name = isAnonymous ? "Anónimo" : publicName(authorName);
  if (!name) throw new Error("Elegí un nombre público o publicá como Anónimo.");
  const db = database();
  const mapping = await getDoc(ownerRef(db, uid, memory.movieId));
  if (mapping.data()?.memoryId !== memory.id) throw new Error("Solo podés editar tus publicaciones.");
  await updateDoc(doc(db, "sharedMemories", memory.id), {
    authorName: name, isAnonymous: Boolean(isAnonymous), memoryText,
    updatedAt: serverTimestamp(),
  });
}

export async function removeSharedMemory(memory, uid) {
  if (!uid || !memory) throw new Error("No se pudo identificar la publicación.");
  const db = database();
  const mapping = await getDoc(ownerRef(db, uid, memory.movieId));
  if (mapping.data()?.memoryId !== memory.id) throw new Error("Solo podés retirar tus publicaciones.");
  const batch = writeBatch(db);
  batch.delete(doc(db, "sharedMemories", memory.id));
  batch.delete(ownerRef(db, uid, memory.movieId));
  await batch.commit();
}

export async function reportSharedMemory(memoryId, uid) {
  if (!uid || !memoryId || !hasFirebaseConfig) throw new Error("Iniciá sesión para reportar.");
  const db = database();
  const report = doc(db, "sharedMemoryReports", uid, "items", memoryId);
  const existing = await getDoc(report);
  if (existing.exists()) throw new Error("Ya reportaste este recuerdo.");
  await setDoc(report, { memoryId, reason: "contenido-inapropiado", createdAt: serverTimestamp() });
}
