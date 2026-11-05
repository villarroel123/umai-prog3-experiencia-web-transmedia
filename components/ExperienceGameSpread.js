"use client";

import Image from "next/image";

export default function ExperienceGameSpread({ theme, title, instruction, children, stageC = false }) {
  return <>
    <div className={`storybook-page storybook-title-page book-game-left${stageC ? " stage-c-game-left" : ""}`}>
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <div className="book-game-art" style={{ "--art-image": `url("${theme.scene}")` }}>
        <Image src={theme.scene} alt={theme.sceneAlt} fill sizes="(max-width: 700px) 100vw, 80vw" priority />
      </div>
      <span className="page-botanical page-botanical-bottom" aria-hidden="true" />
    </div>
    <div className={`storybook-page storybook-index-page book-game-right${stageC ? " stage-c-game-right" : ""}`}>
      <span className="page-botanical page-botanical-top" aria-hidden="true" />
      <h1>{title}</h1>
      <span className="memory-divider" aria-hidden="true" />
      <p>{instruction}</p>
      {children}
      <span className="page-botanical page-botanical-bottom-right" aria-hidden="true" />
    </div>
  </>;
}
