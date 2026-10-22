export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function StoryIcon({ name, className = "" }) {
  const common = { viewBox: "0 0 64 64", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", className, "aria-hidden": true };
  if (name === "star") return <svg {...common}><path d="m32 5 7 19 20 1-16 12 6 20-17-12-17 12 6-20L5 25l20-1z" fill="#e7c77f" /></svg>;
  if (name === "key") return <svg {...common}><circle cx="19" cy="22" r="11" fill="#dbbd78" /><path d="m27 30 27 26m-12-12 7-7m-1 13 7-7" /></svg>;
  if (name === "feather") return <svg {...common}><path d="M11 54C28 37 25 11 53 8c5 24-9 40-42 46Z" fill="#b9ccbb" /><path d="M11 54c13-19 23-27 42-46M24 40l-6-15m18 2-3-15" /></svg>;
  if (name === "hat") return <svg {...common}><path d="M17 40c1-15 7-25 15-25s14 10 15 25M7 43c11 8 39 8 50 0" fill="#b77f58" /></svg>;
  if (name === "bag") return <svg {...common}><path d="M16 25h32l4 31H12l4-31Zm8 0v-7a8 8 0 0 1 16 0v7" fill="#c99b75" /></svg>;
  if (name === "lantern") return <svg {...common}><path d="M25 12h14m-7-7v7M20 22h24l-4 31H24l-4-31Zm4 8h16M26 53h12" fill="#e6ba67" /><path d="M31 35c-5 6-4 10 1 12 5-2 6-6 1-12" fill="#f6e0a0" /></svg>;
  if (name === "watering") return <svg {...common}><path d="M14 26h34l-6 27H20l-6-27Zm34 6 12-8m-1 0-4-5M15 31C-2 21 1 47 16 44" fill="#80a8a1" /><path d="M27 25c0-10 12-10 12 0" /></svg>;
  if (name === "sun") return <svg {...common}><circle cx="32" cy="32" r="13" fill="#f5d784" /><path d="M32 3v10m0 38v10M3 32h10m38 0h10M11 11l7 7m28 28 7 7m0-42-7 7M18 46l-7 7" /></svg>;
  if (name === "spark") return <svg {...common}><path d="m32 3 7 22 22 7-22 7-7 22-7-22-22-7 22-7z" fill="#f9d47a" /></svg>;
  if (name === "acorn") return <svg {...common}><path d="M18 28c0 23 9 30 14 30s14-7 14-30" fill="#b87843" /><path d="M13 29c5-14 33-14 38 0-10 8-29 8-38 0ZM32 18v-8" fill="#765939" /></svg>;
  return null;
}

export function ZenibaMoment({ kind }) {
  return <svg className="zeniba-sketch" viewBox="0 0 180 122" role="img" aria-label={kind === "arrival" ? "Chihiro llega a la casa de Zeniba" : kind === "making" ? "Zeniba prepara el regalo con sus acompañantes" : "Chihiro recibe la cinta"}>
    <rect width="180" height="122" fill="#d8dbbc" />
    <path d="M0 92Q50 75 91 92T180 90V122H0" fill="#99b69b" />
    {kind === "arrival" ? <><path d="m46 59 44-34 44 34v43H46z" fill="#c68d70" stroke="#6e5546" strokeWidth="3" /><path d="M42 60h96L90 21z" fill="#6d6352" /><rect x="77" y="69" width="25" height="33" fill="#554b41" /><circle cx="147" cy="70" r="9" fill="#453c43" /><path d="M142 79h11l8 28h-27z" fill="#dfc8a3" /></> : null}
    {kind === "making" ? <><rect x="17" y="66" width="146" height="20" fill="#8b6148" /><path d="M30 85v28m118-28v28" stroke="#624535" strokeWidth="8" /><circle cx="56" cy="46" r="13" fill="#e6cba6" /><path d="M41 39q14-29 29 0" fill="#d8d4bd" /><circle cx="117" cy="49" r="11" fill="#e7d0b1" /><path d="M106 48q11-24 22 0" fill="#4c4140" /><path d="M68 74q35-28 63 0" fill="none" stroke="#9a7cac" strokeWidth="7" /></> : null}
    {kind === "gift" ? <><circle cx="45" cy="50" r="14" fill="#e5ccaa" /><path d="M30 48q14-27 29 0M28 64h34l8 48H21z" fill="#62504c" /><circle cx="134" cy="46" r="11" fill="#e9d3b5" /><path d="M122 39q12-25 25 0" fill="#494044" /><path d="M91 78q19-20 36 0" fill="none" stroke="#9d7aa8" strokeWidth="8" /><circle cx="108" cy="77" r="8" fill="#d4a5b4" /></> : null}
    <path d="M12 105q30-18 54 0m45-2q24-16 57-2" fill="none" stroke="#6d8a6b" strokeWidth="2" />
  </svg>;
}
