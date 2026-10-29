"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BookScene from "@/components/BookScene";
import BookReader from "@/components/BookReader";

const BookJourneyContext = createContext(null);
const bookPaths = {
  index: "/biblioteca",
  contents: "/biblioteca/indice",
  chihiro: "/recuerdos/chihiro",
  game: "/recuerdos/chihiro/experiencia",
  object: "/recuerdos/chihiro/objeto",
  restored: "/recuerdos/chihiro/restaurado",
  howl: "/recuerdos/howl",
  howlGame: "/recuerdos/howl/experiencia",
  howlObject: "/recuerdos/howl/objeto",
  howlRestored: "/recuerdos/howl/restaurado",
  totoro: "/recuerdos/totoro",
  totoroGame: "/recuerdos/totoro/experiencia",
  totoroObject: "/recuerdos/totoro/objeto",
  totoroRestored: "/recuerdos/totoro/restaurado",
  finale: "/final",
};
const bookOrder = ["index", "contents", "chihiro", "game", "object", "restored", "howl", "howlGame", "howlObject", "howlRestored", "totoro", "totoroGame", "totoroObject", "totoroRestored", "finale"];

function pageForPath(pathname) {
  const key = Object.keys(bookPaths).find((item) => bookPaths[item] === pathname);
  return key || "index";
}
function filmPage(key) { return key === "howl" ? 2 : key === "totoro" ? 3 : key === "index" ? 0 : 1; }

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
  const [mobilePage, setMobilePage] = useState(() => ["game", "object", "howlGame", "howlObject", "totoroGame", "totoroObject"].includes(pageForPath(pathname)) ? "right" : "left");
  const [spread, setSpread] = useState(() => pageForPath(pathname));
  const [turn, setTurn] = useState(null);
  const turnSerial = useRef(0);
  const turningRef = useRef(false);
  const activeTurnRef = useRef(null);
  const isBookRoute = pathname === "/" || Object.values(bookPaths).includes(pathname);
  const isReadingRoute = Object.values(bookPaths).includes(pathname);
  const pageIndex = filmPage(spread);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIntendedPath(null));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  useEffect(() => {
    if (!turningRef.current && isReadingRoute) {
      const frame = requestAnimationFrame(() => setSpread(pageForPath(pathname)));
      return () => cancelAnimationFrame(frame);
    }
  }, [pathname, isReadingRoute]);
  const activePhase = phase === "opening" || phase === "returning" || intendedPath
    ? phase
    : isReadingRoute ? "reading" : "intro";

  const turnTo = useCallback((target) => {
    const key = typeof target === "number" ? ["contents", "chihiro", "howl", "totoro"][target] : target;
    if (turningRef.current || activePhase !== "reading" || !bookPaths[key] || key === spread) return;
    const direction = Math.sign(bookOrder.indexOf(key) - bookOrder.indexOf(spread));
    if (unavailable || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSpread(key);
      setMobilePage(direction > 0 ? "right" : "left");
      window.history.pushState(null, "", bookPaths[key]);
      return;
    }
    setMobilePage(direction > 0 ? "right" : "left");
    turningRef.current = true;
    turnSerial.current += 1;
    const nextTurn = { id: turnSerial.current, direction, source: spread, target: key };
    activeTurnRef.current = nextTurn;
    setTurn(nextTurn);
  }, [activePhase, spread, unavailable]);

  const turnComplete = useCallback(() => {
    const finished = activeTurnRef.current;
    if (!finished) return;
    activeTurnRef.current = null;
    setSpread(finished.target);
    window.history.pushState(null, "", bookPaths[finished.target]);
    turningRef.current = false;
    setTurn(null);
  }, []);

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

  const context = { begin, mobilePage, pageIndex, spread, turn, phase: activePhase, returnToIntro, setMobilePage, turnTo, turning: !!turn, unavailable };

  if (!isBookRoute) return children;

  return <BookJourneyContext.Provider value={context}>
    <div ref={shellRef} className={`book-journey book-journey--${activePhase}${turn ? " book-journey--turning" : ""}${unavailable ? " book-journey--fallback" : ""}`}>
      {!unavailable && <BookScene
        phase={activePhase}
        mobilePage={mobilePage}
        turn={turn}
        projectionHostRef={shellRef}
        onUnavailable={() => setUnavailable(true)}
        onForwardComplete={forwardComplete}
        onReturnComplete={returnComplete}
        onTurnComplete={turnComplete}
      />}
      {isReadingRoute ? <BookReader /> : children}
    </div>
  </BookJourneyContext.Provider>;
}
