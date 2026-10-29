import test from "node:test";
import assert from "node:assert/strict";
import { chapterState, mergeStoryProgress, normalizeStoryProgress, storySummary } from "../lib/storyProgress.js";

test("los recuerdos históricos no cuentan en el progreso nuevo", () => {
  const historical = { "mascara-sin-cara": { gameComplete: true, answer: "antiguo" } };
  assert.deepEqual(normalizeStoryProgress(historical), {});
  assert.deepEqual(storySummary(historical), { savedCount: 0, total: 3, finalUnlocked: false });
});

test("completar el juego no restaura la página sin respuesta", () => {
  const progress = { chihiro: { gameComplete: true, ticketRecovered: true, answer: "", pageRestored: false } };
  assert.equal(chapterState(progress, "chihiro").gameComplete, true);
  assert.equal(chapterState(progress, "chihiro").ticketRecovered, true);
  assert.equal(chapterState(progress, "chihiro").pageRestored, false);
  assert.equal(chapterState(progress, "chihiro").saved, false);
  assert.equal(storySummary(progress).finalUnlocked, false);
});

test("el capítulo restaurado conserva el boleto y la respuesta", () => {
  const progress = { chihiro: { gameComplete: true, ticketRecovered: true, answer: "Un viaje propio", pageRestored: true } };
  assert.deepEqual(chapterState(progress, "chihiro"), {
    started: true, gameComplete: true, objectRecovered: true, ticketRecovered: true, answer: "Un viaje propio", pageRestored: true, saved: true,
  });
});

test("Howl y Totoro avanzan de iniciado a objeto y recién después a recuerdo", () => {
  for (const id of ["howl", "totoro"]) {
    const started = chapterState({ [id]: { started: true } }, id);
    assert.equal(started.started, true);
    assert.equal(started.objectRecovered, false);
    assert.equal(started.saved, false);
    const recovered = chapterState({ [id]: { started: true, gameComplete: true, objectRecovered: true } }, id);
    assert.equal(recovered.objectRecovered, true);
    assert.equal(recovered.saved, false);
    const restored = chapterState({ [id]: { gameComplete: true, objectRecovered: true, answer: "Un recuerdo" } }, id);
    assert.equal(restored.saved, true);
  }
});

test("el final requiere las tres respuestas guardadas", () => {
  const progress = Object.fromEntries(["chihiro", "howl", "totoro"].map((id) => [id, { gameComplete: true, answer: "Un recuerdo propio" }]));
  assert.deepEqual(storySummary(progress), { savedCount: 3, total: 3, finalUnlocked: true });
});

test("la sincronización conserva una respuesta frente a un juego sin guardar", () => {
  const local = { chihiro: { gameComplete: true, answer: "Mi viaje", updatedAt: 1 } };
  const remote = { chihiro: { gameComplete: true, answer: "", updatedAt: 2 } };
  assert.equal(mergeStoryProgress(local, remote).chihiro.answer, "Mi viaje");
});

test("una sincronización no reemplaza un objeto recuperado con un inicio más reciente", () => {
  const local = { howl: { started: true, gameComplete: true, objectRecovered: true, updatedAt: 1 } };
  const remote = { howl: { started: true, updatedAt: 2 } };
  assert.equal(mergeStoryProgress(local, remote).howl.objectRecovered, true);
});
