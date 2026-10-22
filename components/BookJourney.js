"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BookScene from "@/components/BookScene";

const BookJourneyContext = createContext(null);

export function useBookJourney() {
  return useContext(BookJourneyContext);
}

export default function BookJourney({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const shellRef = useRef(null);
  const [intendedPath, setIntendedPath] = useState(null);
  const [phase, setPhase] = useState(() => pathname === "/biblioteca" ? "reading" : "intro");
  const [unavailable, setUnavailable] = useState(false);
  const [mobilePage, setMobilePage] = useState("left");
  const isBookRoute = pathname === "/" || pathname === "/biblioteca";

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIntendedPath(null));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  const activePhase = phase === "opening" || phase === "returning" || intendedPath
    ? phase
    : pathname === "/biblioteca" ? "reading" : "intro";

  const begin = useCallback(() => {
    if (activePhase !== "intro") return;
    if (unavailable || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIntendedPath("/biblioteca");
      setPhase("reading");
      router.push("/biblioteca");
      return;
    }
    setPhase("opening");
  }, [activePhase, router, unavailable]);

  const returnToIntro = useCallback(() => {
    if (activePhase !== "reading") return;
    if (unavailable || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIntendedPath("/");
      setPhase("intro");
      router.push("/");
      return;
    }
    setPhase("returning");
  }, [activePhase, router, unavailable]);

  const forwardComplete = useCallback(() => {
    setIntendedPath("/biblioteca");
    setPhase("reading");
    router.push("/biblioteca");
  }, [router]);

  const returnComplete = useCallback(() => {
    setIntendedPath("/");
    setPhase("intro");
    router.push("/");
  }, [router]);

  const context = { begin, mobilePage, phase: activePhase, returnToIntro, setMobilePage, unavailable };

  if (!isBookRoute) return children;

  return <BookJourneyContext.Provider value={context}>
    <div ref={shellRef} className={`book-journey book-journey--${activePhase}${unavailable ? " book-journey--fallback" : ""}`}>
      {!unavailable && <BookScene
        phase={activePhase}
        mobilePage={mobilePage}
        projectionHostRef={shellRef}
        onUnavailable={() => setUnavailable(true)}
        onForwardComplete={forwardComplete}
        onReturnComplete={returnComplete}
      />}
      {children}
    </div>
  </BookJourneyContext.Provider>;
}
