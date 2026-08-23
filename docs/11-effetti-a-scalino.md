# Effetti a scalino

[01-problema.md](01-problema.md) afferma che alcune soglie producono effetti a
scalino invece che graduali. Questo file è la verifica di quell'affermazione:
il motore è stato eseguito euro per euro da 10.000 a 50.000 € di RAL,
confrontando ogni risultato con quello ottenuto un euro più in basso.

Tutti i numeri qui sotto vengono dal motore e dai parametri già in
[config-2026.js](../src/config-2026.js): nessun dato nuovo, nessuna fonte
aggiuntiva.

## Le cinque discontinuità

Caso standard: Milano, tempo indeterminato, 365 giorni, 13 mensilità.

| RAL   | Netto sotto la soglia | Netto sopra la soglia | Δ su **+1 €** di RAL | Soglia attraversata |
| ----- | --------------------- | --------------------- | -------------------- | ------------------- |
| 16.519 | 15.315,50 €          | 15.186,11 €           | **−129,39 €**        | RC supera 15.000 €  |
| 22.025 | 18.738,70 €          | 18.779,39 €           | +40,69 €             | RC supera 20.000 €  |
| 25.328 | 20.766,36 €          | 20.582,92 €           | **−183,44 €**        | imponibile supera 23.000 € |
| 27.531 | 21.892,03 €          | 21.957,59 €           | +65,56 €             | RC supera 25.000 €  |
| 38.543 | 27.451,93 €          | 27.387,21 €           | **−64,72 €**         | RC supera 35.000 €  |

In tre casi su cinque **guadagnare un euro lordo in più fa incassare meno netto**.
Il salto più grande vale 183 €: per recuperarlo servono circa 300 € di RAL in più.

Le soglie sono espresse in reddito complessivo (RC) o in imponibile fiscale, non
in RAL — la RAL corrispondente è più alta perché i contributi INPS si tolgono
prima (vedi [05-semplificazioni.md](05-semplificazioni.md)).

## Perché succede, voce per voce

**RAL 16.519 — RC supera 15.000 € (−129,39 €).** È il caso più articolato:
tre parametri si muovono insieme.

| Voce | Sotto soglia | Sopra soglia | Effetto |
| ---- | ------------ | ------------ | ------- |
| Trattamento integrativo | 1.200,00 € | 0 € | −1.200 € |
| Detrazione art. 13 | 1.955,00 € | 3.099,88 € | +1.145 € |
| Somma esente (cuneo) | 795,00 € | 720,04 € | −75 € |

Il trattamento integrativo si azzera di colpo, ma la detrazione lavoro dipendente
passa dall'importo fisso alla formula della fascia media e **risale quasi
altrettanto**: il legislatore ha costruito la compensazione. Non è esatta, e
quello che resta scoperto è il salto. La somma esente cala per un motivo
indipendente: sopra i 15.000 € si applica il 4,8% invece del 5,3%, e
15.000 × 5,3% (795 €) è più di 15.001 × 4,8% (720 €).

**RAL 22.025 — RC supera 20.000 € (+40,69 €).** Il cuneo fiscale cambia binario:
si perdono 960 € di somma esente (il 4,8% di un reddito ormai al limite dei
20.000 €) e si guadagna l'ulteriore detrazione, 1.000 € fissi. Qui lo scalino è
a favore del lavoratore, ma resta
uno scalino — e i due strumenti non sono equivalenti, perché la somma esente non
concorre al reddito mentre la detrazione agisce sull'imposta.

**RAL 25.328 — imponibile supera 23.000 € (−183,44 €).** È il salto più grande
ed è il più semplice: l'addizionale comunale di Milano **non ha franchigia**.
Sotto soglia non si paga nulla; un euro sopra, lo 0,8% si applica all'intero
imponibile — 184 € in un colpo solo.

**RAL 27.531 (+65,56 €) e RAL 38.543 (−64,72 €).** Sono la stessa norma vista
due volte: la maggiorazione di 65 € dell'art. 13 co. 1.1 TUIR spetta per
25.000 < RC ≤ 35.000 €. Entra tutta insieme alla soglia inferiore, esce tutta
insieme a quella superiore.

## L'aliquota marginale non è monotona

Quota trattenuta su un aumento di RAL di 1.000 €:

| RAL     | Trattenuto su +1.000 € |
| ------- | ---------------------- |
| 16.000  | 43,8%                  |
| 22.000  | 35,7%                  |
| 25.000  | **58,7%**              |
| 26.000  | 40,6%                  |
| 30.000  | 42,0%                  |
| 33.000  | 49,3%                  |
| 35.000  | 58,0%                  |
| 40.000  | **60,7%**              |
| 44.000  | 49,9%                  |

Chi guadagna 25.000 € subisce una marginale più alta di chi ne guadagna 30.000.
Il picco tra 33.000 e 40.000 € non viene dagli scaglioni IRPEF ma dal
*phase-out* dell'ulteriore detrazione: la formula
`1.000 × (40.000 − RC) / 8.000` sottrae 12,5 centesimi ogni euro guadagnato,
cioè aggiunge 12,5 punti di aliquota marginale implicita che non compaiono in
nessuna tabella ufficiale.

## Come è verificato

Cinque test in [test/engine.test.js](../test/engine.test.js) bloccano queste
discontinuità. Verificano prima il **segno** del salto e poi la sua entità: se
una modifica futura al motore o al config attenuasse uno scalino, il test
fallirebbe indicando quale soglia è cambiata.

Non sono test di regressione su un numero: sono l'affermazione che il sistema
fiscale modellato ha, in questi cinque punti, un comportamento discontinuo.
