import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const port = 9277;
const appPort = Number(process.env.APP_PORT || 3005);
const mobile = process.argv.includes("--mobile");
const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--disable-gpu", "--no-sandbox", `--remote-debugging-port=${port}`,
  "--remote-allow-origins=*", `--user-data-dir=${join(tmpdir(), `community-smoke-${Date.now()}`)}`, "about:blank",
], { stdio: "ignore" });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
try {
  let tabs;
  for (let i = 0; i < 50; i += 1) {
    try { tabs = await (await fetch(`http://localhost:${port}/json`)).json(); break; }
    catch { await wait(200); }
  }
  if (!tabs) throw new Error("Chrome no inició");
  const socket = new WebSocket(tabs.find((tab) => tab.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    const task = pending.get(message.id);
    if (!task) return;
    pending.delete(message.id);
    message.error ? task.reject(message.error) : task.resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const current = ++id;
    pending.set(current, { resolve, reject });
    socket.send(JSON.stringify({ id: current, method, params }));
    setTimeout(() => { if (pending.delete(current)) reject(new Error(`${method} agotó el tiempo`)); }, 45000);
  });
  const evalPage = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true })).result.value;
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Emulation.setDeviceMetricsOverride", { width: mobile ? 390 : 1440, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile });
  await send("Page.navigate", { url: `http://localhost:${appPort}/red-recuerdos` });
  let ready = false;
  for (let i = 0; i < 100; i += 1) {
    ready = await evalPage('!!document.querySelector(".community-right .community-filters")');
    if (ready) break;
    await wait(200);
  }
  if (!ready) throw new Error(`La Red de recuerdos no se mostró dentro del libro: ${JSON.stringify(await evalPage('({ route: location.pathname, text: document.body.innerText.slice(0,500), markup: document.body.innerHTML.slice(0,400) })'))}`);
  if (await evalPage('document.querySelectorAll(".community-filters button").length') !== 4) throw new Error("Faltan filtros");
  if (process.argv.includes("--auth-check")) {
    await wait(15000);
    console.log(JSON.stringify(await evalPage('({ authState: document.querySelector(".story-screen-chapter")?.dataset.authState, syncState: document.querySelector(".story-screen-chapter")?.dataset.syncState, networkMessage: document.querySelector(".community-list [role=alert]")?.textContent || "" })')));
  }
  if (process.argv.includes("--google-check")) {
    await evalPage('document.querySelector(".story-account-button").click()');
    await wait(300);
    await evalPage('document.querySelector(".auth-google").click()');
    await wait(5000);
    const openTabs = await (await fetch(`http://localhost:${port}/json`)).json();
    console.log(JSON.stringify({ popupHosts: openTabs.filter((tab) => tab.type === "page").map((tab) => { try { return new URL(tab.url).hostname; } catch { return "unknown"; } }), authError: await evalPage('document.querySelector(".auth-error")?.textContent || ""') }));
  }
  if (mobile && process.argv.includes("--right")) { await evalPage('document.querySelector(".book-mobile-pages button:last-child").click()'); await wait(300); }
  const shot = await send("Page.captureScreenshot", { format: "png" });
  const path = join(tmpdir(), `community-book-smoke-${mobile ? process.argv.includes("--right") ? "mobile-right" : "mobile-left" : "desktop"}.png`);
  await writeFile(path, Buffer.from(shot.data, "base64"));
  console.log(JSON.stringify({ book: true, filters: 4, screenshot: path }));
  socket.close();
} finally { chrome.kill(); }
