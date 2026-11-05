import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const port = 9256;
const mobile = process.argv.includes("--mobile");
const reduced = process.argv.includes("--reduced");
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
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
    setTimeout(() => { if (pending.delete(id)) reject(new Error(`${method} timed out`)); }, 12000);
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true });
    return result.result.value;
  };
  const until = async (expression, label, timeout = 13000) => {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      if (await evaluate(expression)) return;
      await wait(150);
    }
    throw new Error(`Timed out: ${label}; route=${await evaluate("location.pathname")}`);
  };
  const navigate = async (route) => {
    await send("Page.navigate", { url: `http://localhost:3000${route}` });
    await until('!!document.querySelector(".book-journey--reading .storybook-page")', route);
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: mobile ? 390 : 1440, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile });
  if (reduced) await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await navigate("/biblioteca");
  await evaluate(`localStorage.setItem("biblioteca-tres-recuerdos-v1:local", JSON.stringify(Object.fromEntries(["chihiro","howl","totoro"].map(id => [id,{started:true,gameComplete:true,objectRecovered:true,ticketRecovered:id==="chihiro",answer:"",pageRestored:false,updatedAt:Date.now()}]))))`);

  for (const id of ["chihiro", "howl", "totoro"]) {
    const answer = `Recuerdo de ${id}: lluvia y luz.\n  Tal como lo escribí.  `;
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
    console.log(JSON.stringify({ id, gif, exactAnswer: true, revisitWithoutAnimation: true }));
  }
  socket.close();
} finally {
  chrome.kill();
}
