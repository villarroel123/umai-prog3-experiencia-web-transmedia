import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const port = 9257;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-extensions",
  `--remote-debugging-port=${port}`, "--remote-allow-origins=*",
  `--user-data-dir=${join(tmpdir(), `community-layout-${Date.now()}`)}`, "about:blank",
], { stdio: "ignore" });

try {
  let tabs;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { tabs = await (await fetch(`http://localhost:${port}/json`)).json(); break; }
    catch { await wait(200); }
  }
  if (!tabs) throw new Error("Chrome CDP unavailable");
  const socket = new WebSocket(tabs.find((tab) => tab.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
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
  const value = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true })).result.value;
  const until = async (expression, label) => {
    for (let attempt = 0; attempt < 90; attempt += 1) {
      if (await value(expression)) return;
      await wait(150);
    }
    throw new Error(`Timed out: ${label}`);
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "http://localhost:3000/biblioteca/indice" });
  await until('!!document.querySelector(".book-contents-community button")', "index entry");
  await value('document.querySelector(".book-contents-community button").click()');
  await until('location.pathname === "/red-recuerdos" && !!document.querySelector(".community-right")', "page turn");
  const desktop = await value('({title:document.querySelector(".community-left h1")?.textContent, state:document.querySelector(".community-state")?.textContent, filters:[...document.querySelectorAll(".community-filters button")].map(x=>x.textContent), book:!!document.querySelector(".book-journey-stage canvas")})');
  if (!desktop.book || !desktop.title.includes("Red de") || desktop.filters.length !== 4) throw new Error(JSON.stringify(desktop));
  await value('document.querySelector(".community-filters button:nth-child(4)").click()');
  if (!await value('document.querySelector(".community-filters button:nth-child(4)").getAttribute("aria-pressed") === "true"')) throw new Error("Totoro filter failed");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send("Page.navigate", { url: "http://localhost:3000/red-recuerdos" });
  await until('!!document.querySelector(".community-right .community-filters")', "mobile community");
  await wait(1800);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(join(tmpdir(), "community-mobile.png"), Buffer.from(shot.data, "base64"));
  const mobile = await value('({viewport:innerWidth,scroll:document.documentElement.scrollWidth,page:document.querySelector(".community-right")?.getBoundingClientRect().toJSON(),filters:document.querySelector(".community-filters")?.getBoundingClientRect().toJSON(),bookmark:!!document.querySelector(".book-community-bookmark")})');
  if (mobile.scroll > mobile.viewport + 1 || !mobile.bookmark) throw new Error(JSON.stringify(mobile));
  const cardScroll = await value(`(() => {
    document.querySelector(".community-state")?.remove();
    const area = document.querySelector(".community-card-scroll");
    for (let i = 0; i < 8; i++) {
      const card = document.createElement("article");
      card.className = "community-card community-card--totoro";
      card.innerHTML = '<span class="community-card-symbol">✿</span><div class="community-card-head"><strong>Luna</strong><em>Mi vecino Totoro</em></div><p>Un recuerdo compartido entre las páginas de este libro.</p><div class="community-card-actions"><button>Leer recuerdo ↗</button></div>';
      area.append(card);
    }
    return {scrollHeight:area.scrollHeight,clientHeight:area.clientHeight,viewport:innerWidth,pageWidth:document.documentElement.scrollWidth};
  })()`);
  if (cardScroll.scrollHeight <= cardScroll.clientHeight || cardScroll.pageWidth > cardScroll.viewport + 1) throw new Error(JSON.stringify(cardScroll));
  const cardsShot = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(join(tmpdir(), "community-cards-mobile.png"), Buffer.from(cardsShot.data, "base64"));
  await value(`localStorage.setItem("biblioteca-tres-recuerdos-v1:local", JSON.stringify({chihiro:{started:true,gameComplete:true,objectRecovered:true,ticketRecovered:true,answer:"El tren me recuerda a mi familia.",pageRestored:true,updatedAt:Date.now()}}))`);
  await send("Page.navigate", { url: "http://localhost:3000/recuerdos/chihiro/restaurado" });
  await until('!!document.querySelector(".book-share-open")', "share option");
  await value('document.querySelector(".book-share-open").click()');
  await until('!!document.querySelector(".book-share-sheet .book-share-preview")', "share consent");
  await value('document.querySelector(".book-mobile-pages button:last-child").click()');
  await wait(1000);
  const share = await value('({preview:document.querySelector(".book-share-preview")?.textContent,anonymous:document.querySelector(".book-share-choice input")?.checked,disabled:document.querySelector(".book-share-action")?.disabled})');
  const shareShot = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(join(tmpdir(), "community-share-mobile.png"), Buffer.from(shareShot.data, "base64"));
  if (share.preview !== "El tren me recuerda a mi familia." || !share.anonymous || !share.disabled) throw new Error(JSON.stringify(share));
  console.log(JSON.stringify({ desktop, mobile, cardScroll, share }));
  socket.close();
} finally { chrome.kill(); }
