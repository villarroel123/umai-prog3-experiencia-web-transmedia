import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

let services = null;

export function getFirebaseServices() {
  if (!hasFirebaseConfig) return null;
  if (services) return services;

  // During development the environment can change while an older Firebase app
  // remains in memory. Reuse only an app initialized with this exact config.
  const apps = getApps();
  const app = apps.find((candidate) =>
    candidate.options.apiKey === firebaseConfig.apiKey &&
    candidate.options.projectId === firebaseConfig.projectId &&
    candidate.options.appId === firebaseConfig.appId,
  ) ?? initializeApp(firebaseConfig, `biblioteca-${apps.length}`);
  services = {
    auth: getAuth(app),
    db: getFirestore(app),
  };

  return services;
}
