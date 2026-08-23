// @ts-check
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcolaAddizionali,
  calcolaContributiInps,
  calcolaCostoAzienda,
  calcolaCuneoFiscale,
  calcolaDetrazioneLavoroDipendente,
  calcolaIrpefLorda,
  calcolaNetto,
  calcolaTrattamentoIntegrativo,
} from "../src/engine.js";
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

// Bordo esatto primo scaglione somma esente (7,1%, tetto 603,50€).
test("calcolaCuneoFiscale — bordo primo scaglione (8.500)", () => {
  const risultato = calcolaCuneoFiscale(8500, CONFIG_2026.cuneoFiscale);
  assert.equal(risultato.sommaEsente, 603.5);
  assert.equal(risultato.ulterioreDetrazione, 0);
});

// Terzo scaglione somma esente, sotto il tetto — è anche il caso dell'ambiguità normativa (metodo piatto vs progressivo).
test("calcolaCuneoFiscale — terzo scaglione somma esente (18.000)", () => {
  const risultato = calcolaCuneoFiscale(18000, CONFIG_2026.cuneoFiscale);
  assert.equal(risultato.sommaEsente, 864);
  assert.equal(risultato.ulterioreDetrazione, 0);
});

// Detrazione fissa, range 20.001-32.000.
test("calcolaCuneoFiscale — detrazione fissa (25.000)", () => {
  const risultato = calcolaCuneoFiscale(25000, CONFIG_2026.cuneoFiscale);
  assert.equal(risultato.sommaEsente, 0);
  assert.equal(risultato.ulterioreDetrazione, 1000);
});

// Detrazione decrescente, range 32.001-40.000.
test("calcolaCuneoFiscale — detrazione decrescente (36.000)", () => {
  const risultato = calcolaCuneoFiscale(36000, CONFIG_2026.cuneoFiscale);
  assert.equal(risultato.sommaEsente, 0);
  assert.equal(risultato.ulterioreDetrazione, 500);
});

// Fuori da entrambi i binari.
test("calcolaCuneoFiscale — sopra 40.000, nessun beneficio", () => {
  const risultato = calcolaCuneoFiscale(41000, CONFIG_2026.cuneoFiscale);
  assert.equal(risultato.sommaEsente, 0);
  assert.equal(risultato.ulterioreDetrazione, 0);
});

// Bordo esatto dove i due binari si toccano: RC=20.000 è ancora somma esente (4,8%, tetto 960€).
test("calcolaCuneoFiscale — bordo esatto 20.000 (ancora somma esente)", () => {
  const risultato = calcolaCuneoFiscale(20000, CONFIG_2026.cuneoFiscale);
  assert.equal(risultato.sommaEsente, 960);
  assert.equal(risultato.ulterioreDetrazione, 0);
});

// Un euro sopra: passa al binario detrazione.
test("calcolaCuneoFiscale — 20.001, passa al binario detrazione", () => {
  const risultato = calcolaCuneoFiscale(20001, CONFIG_2026.cuneoFiscale);
  assert.equal(risultato.sommaEsente, 0);
  assert.equal(risultato.ulterioreDetrazione, 1000);
});

// Fascia intera, anno completo.
test("calcolaTrattamentoIntegrativo — RC in fascia, anno intero", () => {
  const risultato = calcolaTrattamentoIntegrativo(12000, 365, CONFIG_2026.trattamentoIntegrativo);
  assert.equal(risultato, 1200);
});

// Ragguaglio ai giorni parziali.
test("calcolaTrattamentoIntegrativo — RC in fascia, 180 giorni", () => {
  const risultato = calcolaTrattamentoIntegrativo(12000, 180, CONFIG_2026.trattamentoIntegrativo);
  assert.ok(Math.abs(risultato - 591.78) < 0.01);
});

// Fuori soglia, zero indipendentemente dai giorni.
test("calcolaTrattamentoIntegrativo — RC fuori soglia", () => {
  const risultato = calcolaTrattamentoIntegrativo(16000, 365, CONFIG_2026.trattamentoIntegrativo);
  assert.equal(risultato, 0);
});

// Bordo esatto: 15.000 è ancora dentro (<=), deve dare l'importo pieno.
test("calcolaTrattamentoIntegrativo — bordo esatto 15.000", () => {
  const risultato = calcolaTrattamentoIntegrativo(15000, 365, CONFIG_2026.trattamentoIntegrativo);
  assert.equal(risultato, 1200);
});

// RC ben dentro la soglia 15.000, ma irpefLorda non supera la detrazione
// art. 13 — la funzione isolata NON conosce questa condizione (è verificata
// solo dentro calcolaNetto), quindi qui il candidato resta pieno.
test("calcolaTrattamentoIntegrativo — candidato pieno anche se poi la capienza lo azzererà altrove", () => {
  const risultato = calcolaTrattamentoIntegrativo(7264.8, 365, CONFIG_2026.trattamentoIntegrativo);
  assert.equal(risultato, 1200);
});

// Due scaglioni regionali attraversati, comunale sotto soglia.
test("calcolaAddizionali — imponibile 20.000, comunale esente", () => {
  const risultato = calcolaAddizionali(20000, CONFIG_2026);
  assert.ok(Math.abs(risultato.regionale - 263.5) < 0.01);
  assert.equal(risultato.comunale, 0);
});

// Tre scaglioni regionali attraversati, comunale sopra soglia.
test("calcolaAddizionali — imponibile 30.000, comunale dovuta", () => {
  const risultato = calcolaAddizionali(30000, CONFIG_2026);
  assert.ok(Math.abs(risultato.regionale - 424.3) < 0.01);
  assert.equal(risultato.comunale, 240);
});

// Bordo esatto esenzione comunale: 23.000 è ancora escluso (condizione è >, non >=).
test("calcolaAddizionali — bordo esatto soglia comunale (23.000), ancora esente", () => {
  const risultato = calcolaAddizionali(23000, CONFIG_2026);
  assert.ok(Math.abs(risultato.regionale - 310.9) < 0.01);
  assert.equal(risultato.comunale, 0);
});

// Un euro sopra: l'aliquota comunale scatta sull'INTERO imponibile, non solo sull'eccedenza — salto da 0€ a 184€.
test("calcolaAddizionali — un euro sopra soglia (23.001), effetto scalino", () => {
  const risultato = calcolaAddizionali(23001, CONFIG_2026);
  assert.ok(Math.abs(risultato.regionale - 310.9158) < 0.01);
  assert.ok(Math.abs(risultato.comunale - 184.008) < 0.01);
});

// Caso completo, RAL 30.000 — verifica ogni voce della catena, non solo il totale.
test("calcolaNetto — RAL 30.000, 365 giorni, 13 mensilità", () => {
  const risultato = calcolaNetto(30000, 365, 13, CONFIG_2026);

  assert.ok(Math.abs(risultato.contributiInps - 2757) < 0.01);
  assert.ok(Math.abs(risultato.imponibileFiscale - 27243) < 0.01);
  assert.ok(Math.abs(risultato.irpefLorda - 6265.89) < 0.01);
  assert.ok(Math.abs(risultato.detrazioneLavoroDipendente - 2044.258) < 0.01);
  assert.ok(Math.abs(risultato.cuneoFiscale.sommaEsente - 0) < 0.01);
  assert.ok(Math.abs(risultato.cuneoFiscale.ulterioreDetrazione - 1000) < 0.01);
  assert.ok(Math.abs(risultato.irpefNetta - 3221.632) < 0.01);
  assert.ok(Math.abs(risultato.trattamentoIntegrativo - 0) < 0.01);
  assert.ok(Math.abs(risultato.addizionali.regionale - 377.9394) < 0.01);
  assert.ok(Math.abs(risultato.addizionali.comunale - 217.944) < 0.01);
  assert.ok(Math.abs(risultato.nettoAnnuo - 23425.4846) < 0.01);
  assert.ok(Math.abs(risultato.nettoMensile - 1801.9604) < 0.01);
});

test("calcolaNetto — RAL 25.000, estremo basso range", () => {
  const risultato = calcolaNetto(25000, 365, 13, CONFIG_2026);
  assert.ok(Math.abs(risultato.nettoAnnuo - 20569.6505) < 0.01);
  assert.ok(Math.abs(risultato.nettoMensile - 1582.2808) < 0.01);
});

test("calcolaNetto — RAL 35.000, estremo alto range", () => {
  const risultato = calcolaNetto(35000, 365, 13, CONFIG_2026);
  assert.ok(Math.abs(risultato.nettoAnnuo - 26032.1808) < 0.01);
  assert.ok(Math.abs(risultato.nettoMensile - 2002.4754) < 0.01);
});

// RC sotto 15.000: fa scattare davvero il trattamento integrativo (capienza soddisfatta).
test("calcolaNetto — RAL 14.000, trattamento integrativo capiente", () => {
  const risultato = calcolaNetto(14000, 365, 13, CONFIG_2026);
  assert.ok(Math.abs(risultato.trattamentoIntegrativo - 1200) < 0.01);
  assert.ok(Math.abs(risultato.nettoAnnuo - 13461.7534) < 0.01);
  assert.ok(Math.abs(risultato.nettoMensile - 1035.5195) < 0.01);
});

// RAL molto bassa: irpefLorda (1.670,904) non supera la detrazione (1.955) —
// caso "non capiente". Il trattamento integrativo deve azzerarsi qui,
// anche se RC è ben dentro la soglia 15.000 che normalmente lo darebbe pieno.
// Unico ramo del genere finora privo di copertura.
test("calcolaNetto — RAL 8.000, trattamento integrativo NON capiente", () => {
  const risultato = calcolaNetto(8000, 365, 13, CONFIG_2026);
  assert.ok(Math.abs(risultato.irpefLorda - 1670.904) < 0.01);
  assert.ok(Math.abs(risultato.detrazioneLavoroDipendente - 1955) < 0.01);
  assert.equal(risultato.trattamentoIntegrativo, 0);
  assert.ok(Math.abs(risultato.irpefNetta - 0) < 0.01);
  assert.ok(Math.abs(risultato.cuneoFiscale.sommaEsente - 515.8008) < 0.01);
  assert.ok(Math.abs(risultato.nettoAnnuo - 7691.24376) < 0.01);
});

// Verifica le tre componenti singolarmente, non solo il totale.
test("calcolaCostoAzienda — RAL 30.000", () => {
  const risultato = calcolaCostoAzienda(30000, CONFIG_2026.costoAzienda);
  assert.ok(Math.abs(risultato.inpsDatore - 7143) < 0.01);
  assert.ok(Math.abs(risultato.inail - 120) < 0.01);
  assert.ok(Math.abs(risultato.tfr - 2072.2222) < 0.01);
  assert.ok(Math.abs(risultato.costoTotale - 39335.2222) < 0.01);
});

// Caso degenere: RAL zero, tutto zero.
test("calcolaCostoAzienda — RAL a zero", () => {
  const risultato = calcolaCostoAzienda(0, CONFIG_2026.costoAzienda);
  assert.equal(risultato.costoTotale, 0);
});

// ---------------------------------------------------------------------
// Effetti a scalino — documentati in docs/11-effetti-a-scalino.md.
// Ogni test verifica prima il SEGNO del salto (la proprietà: qui il netto
// non è graduale) e poi la sua entità. Se una modifica al motore o al
// config attenuasse uno scalino, il test dice quale soglia è cambiata.
// ---------------------------------------------------------------------

// RC supera 15.000: il trattamento integrativo (1.200 €) si azzera, ma la
// detrazione art. 13 passa alla fascia media e risale di ~1.145 € — la
// compensazione voluta dal legislatore non è esatta, e resta un salto negativo.
test("effetto a scalino — RC oltre 15.000 (RAL 16.519), un euro in più fa perdere netto", () => {
  const sotto = calcolaNetto(16518, 365, 13, CONFIG_2026);
  const sopra = calcolaNetto(16519, 365, 13, CONFIG_2026);
  const delta = sopra.nettoAnnuo - sotto.nettoAnnuo;

  assert.ok(delta < 0, "sopra la soglia il netto deve scendere");
  assert.ok(Math.abs(delta - -129.3905) < 0.01);
  assert.equal(sotto.trattamentoIntegrativo, 1200);
  assert.equal(sopra.trattamentoIntegrativo, 0);
});

// RC supera 20.000: il cuneo cambia binario, si perde la somma esente (960 €)
// e si guadagna l'ulteriore detrazione (1.000 €). Scalino a favore, ma scalino.
test("effetto a scalino — RC oltre 20.000 (RAL 22.025), il cuneo cambia binario", () => {
  const sotto = calcolaNetto(22024, 365, 13, CONFIG_2026);
  const sopra = calcolaNetto(22025, 365, 13, CONFIG_2026);
  const delta = sopra.nettoAnnuo - sotto.nettoAnnuo;

  assert.ok(delta > 0, "sopra la soglia il netto deve salire");
  assert.ok(Math.abs(delta - 40.6852) < 0.01);
  // 959,9997 €: a RC 19.999,99 il 4,8% resta un soffio sotto il tetto di 960 €,
  // che si tocca solo a RC = 20.000 esatti.
  assert.ok(Math.abs(sotto.cuneoFiscale.sommaEsente - 960) < 0.01);
  assert.equal(sopra.cuneoFiscale.ulterioreDetrazione, 1000);
});

// Imponibile supera 23.000: l'addizionale comunale di Milano NON è una
// franchigia — lo 0,8% si applica di colpo sull'intero imponibile.
// È il salto più grande della catena.
test("effetto a scalino — imponibile oltre 23.000 (RAL 25.328), addizionale comunale piena", () => {
  const sotto = calcolaNetto(25327, 365, 13, CONFIG_2026);
  const sopra = calcolaNetto(25328, 365, 13, CONFIG_2026);
  const delta = sopra.nettoAnnuo - sotto.nettoAnnuo;

  assert.ok(delta < 0, "sopra la soglia il netto deve scendere");
  assert.ok(Math.abs(delta - -183.437) < 0.01);
  assert.equal(sotto.addizionali.comunale, 0);
  assert.ok(Math.abs(sopra.addizionali.comunale - 184) < 0.01);
});

// RC supera 25.000: entra tutta insieme la maggiorazione di 65 €
// dell'art. 13 co. 1.1 TUIR.
test("effetto a scalino — RC oltre 25.000 (RAL 27.531), entra la maggiorazione 65 €", () => {
  const sotto = calcolaNetto(27530, 365, 13, CONFIG_2026);
  const sopra = calcolaNetto(27531, 365, 13, CONFIG_2026);
  const delta = sopra.nettoAnnuo - sotto.nettoAnnuo;

  assert.ok(delta > 0, "sopra la soglia il netto deve salire");
  assert.ok(Math.abs(delta - 65.5586) < 0.01);
  assert.ok(sopra.detrazioneLavoroDipendente > sotto.detrazioneLavoroDipendente);
});

// RC supera 35.000: la stessa maggiorazione di 65 € esce tutta insieme.
// Stessa norma del test precedente, vista dall'altro bordo.
test("effetto a scalino — RC oltre 35.000 (RAL 38.543), esce la maggiorazione 65 €", () => {
  const sotto = calcolaNetto(38542, 365, 13, CONFIG_2026);
  const sopra = calcolaNetto(38543, 365, 13, CONFIG_2026);
  const delta = sopra.nettoAnnuo - sotto.nettoAnnuo;

  assert.ok(delta < 0, "sopra la soglia il netto deve scendere");
  assert.ok(Math.abs(delta - -64.719) < 0.01);
  assert.ok(sopra.detrazioneLavoroDipendente < sotto.detrazioneLavoroDipendente);
});
