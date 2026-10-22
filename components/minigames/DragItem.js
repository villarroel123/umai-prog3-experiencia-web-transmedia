"use client";

import { useRef, useState } from "react";

// Pointer Events give mouse, pen and touch the same drop behaviour. The caller
// also supplies a click action so every task remains usable from the keyboard.
export default function DragItem({ id, label, children, onDrop, onClick, className = "", disabled = false }) {
  const start = useRef(null);
  const suppressClick = useRef(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function pointerDown(event) {
    if (disabled) return;
    start.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event) {
    if (!start.current) return;
    setOffset({ x: event.clientX - start.current.x, y: event.clientY - start.current.y });
  }

  function dropAt(x, y) {
    const zones = document.querySelectorAll("[data-game-drop]");
    for (const zone of zones) {
      const box = zone.getBoundingClientRect();
      if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
        onDrop?.(id, zone.dataset.gameDrop);
        break;
      }
    }
  }

  function pointerUp(event) {
    if (!start.current) return;
    const moved = Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y) > 9;
    if (moved) {
      suppressClick.current = true;
      setTimeout(() => { suppressClick.current = false; }, 100);
      dropAt(event.clientX, event.clientY);
    }
    start.current = null;
    setOffset({ x: 0, y: 0 });
  }

  return <button type="button" className={"game-draggable " + className} aria-label={label} disabled={disabled} draggable={!disabled}
    onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp}
    onPointerCancel={() => { start.current = null; setOffset({ x: 0, y: 0 }); }}
    onDragStart={(event) => { event.dataTransfer.setData("text/plain", id); event.dataTransfer.effectAllowed = "move"; }}
    onDragEnd={(event) => { start.current = null; setOffset({ x: 0, y: 0 }); if (event.clientX || event.clientY) dropAt(event.clientX, event.clientY); }}
    onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } onClick?.(id); }}
    style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, zIndex: offset.x || offset.y ? 20 : undefined }}>
    {children}
  </button>;
}
