# Ambiguità normative e come le ho risolte

## Somma esente del cuneo fiscale: aliquota piatta o progressiva?

La norma (art. 1 co. 4 L. 207/2024) stabilisce tre percentuali sulla somma
esente per redditi da lavoro fino a 20.000 €, ciascuna con un importo
massimo dichiarato:

| Fascia di reddito | Aliquota | Massimo dichiarato |
|---|---|---|
| fino a 8.500 € | 7,1% | 603,50 € |
| 8.500 – 15.000 € | 5,3% | 795 € |
| 15.000 – 20.000 € | 4,8% | 960 € |

**Verifica dei massimi**: 8.500 × 7,1% = 603,50 · 15.000 × 5,3% = 795 ·
20.000 × 4,8% = 960. I tre massimi tornano esatti **solo se l'aliquota si
applica piatta sull'intero reddito**, non a scaglioni progressivi come
l'IRPEF.

Fonti secondarie, però, la calcolano progressivamente — nello stesso modo in
cui si calcola l'IRPEF, sommando la quota di ogni fascia. Per un reddito di
18.000 €:

| Metodo | Calcolo | Risultato |
|---|---|---|
| Piatto (INPS) | 18.000 × 4,8% | 864 € |
| Progressivo | 8.500×7,1% + 6.500×5,3% + 3.000×4,8% | 1.092 € |

**228 € di differenza sullo stesso lavoratore**, a seconda di quale
interpretazione si adotta.

### Decisione

Ho implementato il **metodo piatto**, per due motivi:

1. È l'unico compatibile con i massimi dichiarati dalla norma stessa — la
   verifica sopra è una controprova aritmetica.
2. È il metodo riportato dalle fonti istituzionali (INPS), non da guide
   fiscali di terze parti.

Il codice implementa esplicitamente questa scelta in `calcolaCuneoFiscale`
([engine.js](../src/engine.js)) con un commento che rimanda a questo file, e
il config marca il campo `metodo: "piatto"` in
[config-2026.js](../src/config-2026.js) per rendere la decisione visibile a
chi legge i dati, non solo a chi legge il codice.

Un test dedicato ([test/engine.test.js](../test/engine.test.js)) verifica
proprio il caso RC = 18.000 €, quello dove i due metodi divergono di più in
termini assoluti nella fascia bassa.