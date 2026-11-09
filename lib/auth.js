import { EmailAuthProvider, GoogleAuthProvider, createUserWithEmailAndPassword, linkWithCredential, linkWithPopup, sendPasswordResetEmail, signInWithCredential, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase";

export function validPublicName(value) {
  const name = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (name.length < 2 || name.length > 32 || !/^[\p{L}\p{N} .'-]+$/u.test(name)) throw new Error("Elegí un nombre de 2 a 32 caracteres, sin símbolos especiales.");
  return name;
}

export function accountPublicName(user) {
  try { return validPublicName(user?.displayName?.trim().slice(0, 32)); }
  catch { return ""; }
}

export async function savePublicName(uid, value) {
  const name = validPublicName(value);
  const { db } = getFirebaseServices();
  await setDoc(doc(db, "users", uid), { userId: uid, publicName: name, updatedAt: serverTimestamp() }, { merge: true });
  return name;
}

export async function loadPublicName(uid) {
  const { db } = getFirebaseServices();
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data().publicName || "" : "";
}

export async function authenticateEmail({ email, password, mode, publicName }) {
  const { auth } = getFirebaseServices();
  const normalized = email.trim();
  if (mode === "signup") {
    const name = validPublicName(publicName);
    const credential = auth.currentUser?.isAnonymous
      ? await linkWithCredential(auth.currentUser, EmailAuthProvider.credential(normalized, password))
      : await createUserWithEmailAndPassword(auth, normalized, password);
    await updateProfile(credential.user, { displayName: name });
    await savePublicName(credential.user.uid, name);
    return credential.user;
  }
  return (await signInWithEmailAndPassword(auth, normalized, password)).user;
}

export async function authenticateGoogle() {
  const { auth } = getFirebaseServices();
  const provider = new GoogleAuthProvider();
  let credential;
  try {
    credential = auth.currentUser?.isAnonymous
      ? await linkWithPopup(auth.currentUser, provider)
      : await signInWithPopup(auth, provider);
  } catch (error) {
    const existing = GoogleAuthProvider.credentialFromError(error);
    if (!existing || error.code !== "auth/credential-already-in-use") throw error;
    credential = await signInWithCredential(auth, existing);
  }
  return credential.user;
}

export async function recoverPassword(email) {
  const { auth } = getFirebaseServices();
  await sendPasswordResetEmail(auth, email.trim());
}

export async function closeSession() {
  const { auth } = getFirebaseServices();
  await signOut(auth);
}
