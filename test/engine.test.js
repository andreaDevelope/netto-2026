// @ts-check
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcolaContributiInps, calcolaDetrazioneLavoroDipendente, calcolaIrpefLorda } from "../src/engine.js";
import { CONFIG_2026 } from "../src/config-2026.js";

// Caso base, ben dentro il range RAL 25-35k del task.
test("calcolaContributiInps — RAL sotto la prima fascia (9,19% piatto)", () => {
  const risultato = calcolaContributiInps(25000, CONFIG_2026.inps);
  assert.equal(risultato, 2297.5);
});

// Secondo punto nel range standard, per avere due riferimenti diversi.
test("calcolaContributiInps — RAL 30.000, ancora sotto la prima fascia", () => {
  const risultato = calcolaContributiInps(30000, CONFIG_2026.inps);
  assert.equal(risultato, 2757);
});

// Fuori dal range standard, ma verifica che la seconda aliquota si attivi correttamente.
test("calcolaContributiInps — RAL sopra la prima fascia (scatta il 10,19%)", () => {
  const risultato = calcolaContributiInps(60000, CONFIG_2026.inps);
  // 56.224 × 9,19% + 3.776 × 10,19% = 5166.9856 + 384.7744 = 5551.76
  assert.ok(Math.abs(risultato - 5551.76) < 0.01);
});

// Bordo esatto: qui un `<` al posto di `<=` romperebbe il calcolo senza dare errore.
test("calcolaContributiInps — al bordo esatto della prima fascia (56.224)", () => {
  const risultato = calcolaContributiInps(56224, CONFIG_2026.inps);
  assert.ok(Math.abs(risultato - 5166.99) < 0.01);
});

// Nessun altro test passa mai dal Math.min() del massimale: senza questo, si potrebbe
// cancellare quella riga e i test resterebbero comunque tutti verdi.
test("calcolaContributiInps — RAL sopra il massimale contributivo (150.000)", () => {
  const risultato = calcolaContributiInps(150000, CONFIG_2026.inps);
  assert.ok(Math.abs(risultato - 11899.62) < 0.01);
});

// Caso degenere: deve dare 0, non NaN o errore.
test("calcolaContributiInps — RAL a zero", () => {
  const risultato = calcolaContributiInps(0, CONFIG_2026.inps);
  assert.equal(risultato, 0);
});

// Solo primo scaglione, tutto al 23%.
test("calcolaIrpefLorda — solo primo scaglione (23%)", () => {
  const risultato = calcolaIrpefLorda(20000, CONFIG_2026.irpef);
  assert.equal(risultato, 4600);
});

// Attraversa il secondo scaglione: verifica che il 33% si applichi solo alla quota eccedente 28.000.
test("calcolaIrpefLorda — attraversa il secondo scaglione (23%+33%)", () => {
  const risultato = calcolaIrpefLorda(35000, CONFIG_2026.irpef);
  assert.equal(risultato, 8750);
});

// Attraversa tutti e tre gli scaglioni fino al 43%.
test("calcolaIrpefLorda — attraversa tutti e tre gli scaglioni", () => {
  const risultato = calcolaIrpefLorda(60000, CONFIG_2026.irpef);
  assert.equal(risultato, 18000);
});

// Bordo esatto del primo scaglione: deve restare tutto al 23%, il 33% non deve scattare su 0€.
test("calcolaIrpefLorda — bordo esatto primo scaglione (28.000)", () => {
  const risultato = calcolaIrpefLorda(28000, CONFIG_2026.irpef);
  assert.equal(risultato, 6440);
});

// Bordo esatto del secondo scaglione: stesso principio, il 43% non deve toccare nulla.
test("calcolaIrpefLorda — bordo esatto secondo scaglione (50.000)", () => {
  const risultato = calcolaIrpefLorda(50000, CONFIG_2026.irpef);
  assert.equal(risultato, 13700);
});

// Un euro sopra il bordo: verifica che il 43% scatti solo su quell'euro, non su tutto.
test("calcolaIrpefLorda — un euro sopra il secondo scaglione (50.001)", () => {
  const risultato = calcolaIrpefLorda(50001, CONFIG_2026.irpef);
  assert.ok(Math.abs(risultato - 13700.43) < 0.01);
});

// Caso degenere: imponibile zero, imposta zero, nessun errore né NaN.
test("calcolaIrpefLorda — imponibile a zero", () => {
  const risultato = calcolaIrpefLorda(0, CONFIG_2026.irpef);
  assert.equal(risultato, 0);
});

test("calcolaDetrazioneLavoroDipendente — fascia bassa (RC ≤ 15.000)", () => {
  const risultato = calcolaDetrazioneLavoroDipendente(12000, 365, CONFIG_2026.detrazioneLavoroDipendente);
  assert.equal(risultato, 1955);
});

test("calcolaDetrazioneLavoroDipendente — fascia media (15.000 < RC ≤ 28.000)", () => {
  const risultato = calcolaDetrazioneLavoroDipendente(22000, 365, CONFIG_2026.detrazioneLavoroDipendente);
  assert.equal(risultato, 2459.185);
});

test("calcolaDetrazioneLavoroDipendente — fascia alta + maggiorazione 65€", () => {
  const risultato = calcolaDetrazioneLavoroDipendente(30000, 365, CONFIG_2026.detrazioneLavoroDipendente);
  assert.equal(risultato, 1801.19);
});

// Bordo esatto RC=50.000: la formula dà 0, il pavimento minimo NON deve applicarsi qui.
test("calcolaDetrazioneLavoroDipendente — RC a 50.000, nessun pavimento applicato", () => {
  const risultato = calcolaDetrazioneLavoroDipendente(50000, 365, CONFIG_2026.detrazioneLavoroDipendente);
  assert.equal(risultato, 0);
});

// Sopra 50.000: deve restare 0.
test("calcolaDetrazioneLavoroDipendente — RC sopra 50.000", () => {
  const risultato = calcolaDetrazioneLavoroDipendente(60000, 365, CONFIG_2026.detrazioneLavoroDipendente);
  assert.equal(risultato, 0);
});

// Giorni parziali in fascia bassa: qui il pavimento DEVE scattare.
test("calcolaDetrazioneLavoroDipendente — fascia bassa con pochi giorni, scatta il pavimento", () => {
  const risultato = calcolaDetrazioneLavoroDipendente(10000, 30, CONFIG_2026.detrazioneLavoroDipendente);
  // 1.955 × 30/365 = 160,68 → sotto 690, deve salire al minimo
  assert.equal(risultato, 690);
});
