// @ts-check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcolaContributiInps } from '../src/engine.js';
import { CONFIG_2026 } from '../src/config-2026.js';

// Caso base, ben dentro il range RAL 25-35k del task.
test('calcolaContributiInps — RAL sotto la prima fascia (9,19% piatto)', () => {
  const risultato = calcolaContributiInps(25000, CONFIG_2026.inps);
  assert.equal(risultato, 2297.5);
});

// Secondo punto nel range standard, per avere due riferimenti diversi.
test('calcolaContributiInps — RAL 30.000, ancora sotto la prima fascia', () => {
  const risultato = calcolaContributiInps(30000, CONFIG_2026.inps);
  assert.equal(risultato, 2757);
});

// Fuori dal range standard, ma verifica che la seconda aliquota si attivi correttamente.
test('calcolaContributiInps — RAL sopra la prima fascia (scatta il 10,19%)', () => {
  const risultato = calcolaContributiInps(60000, CONFIG_2026.inps);
  // 56.224 × 9,19% + 3.776 × 10,19% = 5166.9856 + 384.7744 = 5551.76
  assert.ok(Math.abs(risultato - 5551.76) < 0.01);
});

// Bordo esatto: qui un `<` al posto di `<=` romperebbe il calcolo senza dare errore.
test('calcolaContributiInps — al bordo esatto della prima fascia (56.224)', () => {
  const risultato = calcolaContributiInps(56224, CONFIG_2026.inps);
  assert.ok(Math.abs(risultato - 5166.99) < 0.01);
});

// Nessun altro test passa mai dal Math.min() del massimale: senza questo, si potrebbe
// cancellare quella riga e i test resterebbero comunque tutti verdi.
test('calcolaContributiInps — RAL sopra il massimale contributivo (150.000)', () => {
  const risultato = calcolaContributiInps(150000, CONFIG_2026.inps);
  assert.ok(Math.abs(risultato - 11899.62) < 0.01);
});

// Caso degenere: deve dare 0, non NaN o errore.
test('calcolaContributiInps — RAL a zero', () => {
  const risultato = calcolaContributiInps(0, CONFIG_2026.inps);
  assert.equal(risultato, 0);
});