"use client";

import { useState } from "react";
import LibraryIndex from "@/components/LibraryIndex";
import AuthPanel from "@/components/AuthPanel";
import { useStoryProgress } from "@/hooks/useStoryProgress";

export default function BookReader() {
  const progress = useStoryProgress();
  const [authOpen, setAuthOpen] = useState(false);
  if (!progress.ready) return <main className="story-world story-loading" role="status"><span className="story-loading-mark" aria-hidden="true">✦</span><p>Abriendo el libro de los recuerdos…</p></main>;
  return <main className="story-world story-screen-chapter">
    {progress.firebaseConfigured && <button type="button" className="story-account-button" onClick={() => setAuthOpen(true)}>{progress.authUser?.isAnonymous ? "Mi cuenta" : progress.authUser?.displayName || progress.authUser?.email || "Mi cuenta"}</button>}
    <div className="story-grain" aria-hidden="true" />
    <div className="story-content"><LibraryIndex progress={progress} /></div>
    {authOpen && <AuthPanel authError={progress.authError} authLoading={progress.authLoading} onClose={() => setAuthOpen(false)} onContinueAsGuest={progress.continueAsGuest} onGoogle={progress.signInWithGoogle} onSubmitEmail={progress.submitEmail} user={progress.authUser} />}
  </main>;
}
