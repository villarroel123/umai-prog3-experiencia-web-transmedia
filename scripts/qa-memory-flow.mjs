import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const port = 9256;
const appPort = Number(process.env.APP_PORT || 3000);
const mobile = process.argv.includes("--mobile");
const reduced = process.argv.includes("--reduced");
const visual = process.argv.includes("--visual");
const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-extensions",
  `--remote-debugging-port=${port}`, "--remote-allow-origins=*",
  `--user-data-dir=${join(tmpdir(), `memory-flow-${Date.now()}`)}`, "about:blank",
], { stdio: "ignore" });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  let tabs;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { tabs = await (await fetch(`http://localhost:${port}/json`)).json(); break; }
    catch { await wait(200); }
  }
  if (!tabs) throw new Error("Chrome CDP unavailable");
  const socket = new WebSocket(tabs.find((tab) => tab.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const task = pending.get(message.id);
    if (!task) return;
    pending.delete(message.id);
    message.error ? task.reject(message.error) : task.resolve(message.result);
  });
  const send = (method, params = {}, timeout = 12000) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
    setTimeout(() => { if (pending.delete(id)) reject(new Error(`${method} timed out`)); }, timeout);
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true });
    return result.result.value;
  };
  const until = async (expression, label, timeout = 45000) => {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      if (await evaluate(expression)) return;
      await wait(150);
    }
    throw new Error(`Timed out: ${label}; route=${await evaluate("location.pathname")}`);
  };
  const navigate = async (route) => {
    await send("Page.navigate", { url: `http://localhost:${appPort}${route}` }, 45000);
    await until('!!document.querySelector(".book-journey--reading .storybook-page")', route);
  };
  const snapshot = async (label) => {
    if (!visual) return;
    await until('Array.from(document.querySelectorAll(".book-chapter-art img, .book-game-art img, .book-restored-art img, .totoro-weather img, .book-ticket-piece img")).every((img) => img.complete && img.naturalWidth > 0)', `${label} images`, 30000);
    await wait(350);
    const shot = await send("Page.captureScreenshot", { format: "png" }, 45000);
    const path = join(tmpdir(), `memory-visual-${label}-${mobile ? "mobile" : "desktop"}.png`);
    await writeFile(path, Buffer.from(shot.data, "base64"));
    console.log(path);
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: mobile ? 390 : 1440, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile });
  if (reduced) await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await navigate("/biblioteca");
  await snapshot("library-prologue");
  await navigate("/biblioteca/indice");
  await snapshot("library-index");
  for (const id of ["chihiro", "howl", "totoro"]) {
    await navigate(`/recuerdos/${id}`);
    await snapshot(`${id}-chapter`);
  }
  await navigate("/recuerdos/chihiro/experiencia");
  await snapshot("chihiro-game");
  for (let index = 0; index < 4; index += 1) {
    await evaluate(`document.querySelector('[aria-label="Seleccionar pieza ${index + 1}"]').click()`);
    await until(`document.querySelector('[aria-label="Seleccionar pieza ${index + 1}"]')?.getAttribute("aria-pressed") === "true"`, `ticket piece ${index + 1}`);
    await evaluate(`document.querySelector('[data-ticket-slot="${index}"]').click()`);
    await until(`!!document.querySelector('[data-ticket-slot="${index}"].is-filled')`, `ticket slot ${index + 1}`);
  }
  await until('location.pathname === "/recuerdos/chihiro/objeto"', "ticket recovered");
  await navigate("/recuerdos/howl/experiencia");
  await snapshot("howl-game");
  await evaluate('document.querySelector(".howl-hotspot-drawer").click()');
  await until('!!document.querySelector(".howl-key")', "Howl key");
  await evaluate('document.querySelector(".howl-hotspot-box").click()');
  await until('!!document.querySelector(".howl-desk-letter")', "Howl box");
  await evaluate('document.querySelector(".howl-desk-letter").click()');
  await until('location.pathname === "/recuerdos/howl/objeto"', "letter recovered");
  await navigate("/recuerdos/totoro/experiencia");
  await snapshot("totoro-game");
  await evaluate('document.querySelector(".totoro-cloud").click()');
  await until('!!document.querySelector(".totoro-forest-board.is-watered")', "Totoro rain");
  await evaluate('document.querySelector(".totoro-sun").click()');
  await until('!!document.querySelector(".totoro-forest-board.is-sunlit")', "Totoro sun");
  await evaluate('document.querySelector(".totoro-leaf-pick").click()');
  await until('location.pathname === "/recuerdos/totoro/objeto"', "leaf recovered");
  console.log(JSON.stringify({ miniGames: ["chihiro", "howl", "totoro"], objectsRecovered: true }));

  for (const id of ["chihiro", "howl", "totoro"]) {
    const answer = id === "totoro"
      ? ("Recuerdo la lluvia, el sol y los días compartidos en el jardín. ".repeat(9)).slice(0, 500)
      : `Recuerdo de ${id}: lluvia y luz.\n  Tal como lo escribí.  `;
    await navigate(`/recuerdos/${id}/objeto`);
    await until('!!document.querySelector("textarea:not(:disabled)")', `${id} form`);
    await evaluate(`(() => {
      const textarea = document.querySelector("textarea");
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
      setter.call(textarea, ${JSON.stringify(answer)});
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    })()`);
    await until('!!document.querySelector("button[type=submit]:not(:disabled)")', `${id} submit`);
    await evaluate('document.querySelector("button[type=submit]").click()');
    if (!reduced) await until('!!document.querySelector(".memory-restoration-frame img")', `${id} GIF`);
    const gif = reduced ? "(omitted for reduced motion)" : await evaluate('document.querySelector(".memory-restoration-frame img").getAttribute("src")');
    const expected = `/images/experiences/${id}/memories/${id}-recuerdo.gif`;
    if (!reduced && gif !== expected) throw new Error(`${id}: GIF ${gif}, expected ${expected}`);
    if (mobile && !reduced) {
      const shot = await send("Page.captureScreenshot", { format: "png" });
      await writeFile(join(tmpdir(), `memory-gif-${id}-mobile.png`), Buffer.from(shot.data, "base64"));
    }
    if (id === "howl" && !reduced) await evaluate('document.querySelector(".memory-restoration-skip").click()');
    await until(`location.pathname.endsWith("/restaurado") && !!document.querySelector(".book-restored-answer .memory-ink-text")`, `${id} restored`, 16000);
    await snapshot(`${id}-restored`);
    const saved = await evaluate('document.querySelector(".book-restored-answer .memory-ink-text").textContent');
    if (saved !== answer) throw new Error(`${id}: answer changed ${JSON.stringify(saved)}`);
    if (reduced && await evaluate('!!document.querySelector(".memory-ink-quote.is-writing")')) throw new Error(`${id}: ink animated with reduced motion`);
    if (mobile) {
      await wait(4300);
      const shot = await send("Page.captureScreenshot", { format: "png" });
      await writeFile(join(tmpdir(), `memory-restored-${id}-mobile.png`), Buffer.from(shot.data, "base64"));
    }
    await navigate(`/recuerdos/${id}/restaurado`);
    await until('!!document.querySelector(".book-restored-answer .memory-ink-text")', `${id} revisit`);
    if (await evaluate('!!document.querySelector(".memory-restoration-frame img, .memory-ink-quote.is-writing")')) {
      throw new Error(`${id}: animation replayed on revisit`);
    }
    await navigate(`/recuerdos/${id}`);
    await until('!!document.querySelector(".book-restored-right .memory-ink-text")', `${id} completed chapter`);
    if (await evaluate('document.querySelector(".book-restored-right h1")?.textContent') !== "Mi recuerdo") {
      throw new Error(`${id}: completed chapter did not open the diary page`);
    }
    if (await evaluate('!!document.querySelector(".memory-restoration-frame img, .book-chapter-description")')) {
      throw new Error(`${id}: completed chapter showed an intermediate screen`);
    }
    if (mobile && id === "totoro" && !await evaluate('document.querySelector(".book-restored-answer").scrollHeight > document.querySelector(".book-restored-answer").clientHeight')) {
      throw new Error("Long memory did not scroll within the diary page");
    }
    await snapshot(`${id}-completed-chapter`);
    await evaluate('document.querySelector(".book-restored-right .book-chapter-replay").click()');
    await until(`location.pathname === "/recuerdos/${id}/experiencia"`, `${id} return to minigame`);
    console.log(JSON.stringify({ id, gif, exactAnswer: true, revisitWithoutAnimation: true }));
  }
  await navigate("/biblioteca/indice");
  await until('document.querySelectorAll(".book-contents-list > li").length === 3', "three chapter index");
  await evaluate('document.querySelector(".book-page-arrow-next").click()');
  await until('location.pathname === "/recuerdos/chihiro"', "index next page");
  await evaluate('document.querySelector(".book-page-arrow-prev").click()');
  await until('location.pathname === "/biblioteca/indice"', "chapter previous page");
  await evaluate('Array.from(document.querySelectorAll(".book-contents-final")).find((button) => button.textContent.includes("mi biblioteca"))?.click()');
  await until('location.pathname === "/final" && !!document.querySelector(".book-finale-object")', "unlocked finale");
  await evaluate('document.querySelector(".book-page-arrow-next").click()');
  await until('location.pathname === "/red-recuerdos" && !!document.querySelector(".community-right")', "community chapter");
  await evaluate('document.querySelector(".book-page-arrow-prev").click()');
  await until('location.pathname === "/final"', "community previous page");
  await evaluate('document.querySelector(".book-page-arrow-prev").click()');
  await until('location.pathname === "/recuerdos/totoro/restaurado"', "final previous page");
  await evaluate('document.querySelector(".book-index-bookmark").click()');
  await until('location.pathname === "/biblioteca/indice"', "index bookmark");
  console.log(JSON.stringify({ indexChapters: 3, arrows: true, finaleUnlocked: true, communityChapter: true, indexBookmark: true }));
  socket.close();
} finally {
  chrome.kill();
}
