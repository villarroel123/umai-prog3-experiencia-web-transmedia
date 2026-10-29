"use client";

import { useState } from "react";

export default function QaCleanup() {
  const [done, setDone] = useState(false);
  return <main style={{ padding: 40 }}><h1>Limpiar datos de prueba</h1><button onClick={() => { window.localStorage.removeItem("biblioteca-tres-recuerdos-v1:local"); setDone(true); }}>Limpiar</button>{done && <p>Datos de prueba eliminados.</p>}</main>;
}
