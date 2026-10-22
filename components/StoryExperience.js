"use client";

import Image from "next/image";
import LibraryIndex from "@/components/LibraryIndex";
import ChapterView from "@/components/ChapterView";
import MinigameView from "@/components/MinigameView";
import FinalView from "@/components/FinalView";
import { useMemoryProgress } from "@/hooks/useMemoryProgress";

export default function StoryExperience({ screen, movie, memory, film }) {
  const progress = useMemoryProgress();
  if (!progress.ready && screen !== "library") {
    return <main className="story-world story-loading" role="status">
      <span className="story-loading-mark" aria-hidden="true">✦</span>
      <p>Abriendo el libro de los recuerdos…</p>
    </main>;
  }

  return <main className={"story-world story-screen-" + screen}>
    {movie && <Image src={movie.sceneImage} alt="" fill sizes="100vw" className="story-world-backdrop" />}
    <div className="story-grain" aria-hidden="true" />
    <div className="story-content" key={screen + (movie?.id || "") + (memory?.id || "")}>
      {screen === "library" && <LibraryIndex progress={progress} />}
      {screen === "chapter" && <ChapterView movie={movie} film={film} progress={progress} />}
      {screen === "minigame" && <MinigameView movie={movie} memory={memory} progress={progress} />}
      {screen === "final" && <FinalView progress={progress} />}
    </div>
  </main>;
}
