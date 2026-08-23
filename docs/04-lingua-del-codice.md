Uso `// @ts-check` + JSDoc invece di TypeScript: stesso controllo tipi in editor, zero build step.

## La regola

| Categoria | Lingua | Esempi |
|---|---|---|
| Termini normativi | italiano | `aliquota`, `scaglioni`, `imponibileFiscale`, `detrazioneLavoroDipendente`, `cuneoFiscale`, `addizionaleComunaleMilano` |
| Funzioni che toccano il dominio | italiano, **verbo incluso** | `calcolaIrpefLorda`, `calcolaCuneoFiscale`, `calcolaCostoAzienda` |
| Helper senza dominio | inglese | `truncate4` |
| Commenti, documentazione, nomi dei test | italiano | fonti italiane, lettori italiani |

Il verbo resta italiano quando il resto del nome lo è. `calcolaDetrazioneLavoroDipendente`
si legge come una frase sola; `calculateDetrazioneLavoroDipendente` obbliga a cambiare
lingua a metà identificatore, in cambio di nulla. L'inglese è riservato a ciò che non ha
dominio dentro: `truncate4` tronca un numero e basta, non sa cosa sia una detrazione.

## Il motivo principale: l'inglese perde informazione

In inglese **detrazione** e **deduzione** diventano entrambe `deduction`. Ma è la distinzione che
regge tutto il calcolo:

| Termine | Cosa fa | Dove agisce |
|---|---|---|
| deduzione | abbassa la base su cui si calcola l'imposta | sul reddito |
| detrazione | abbassa l'imposta già calcolata | sull'imposta |

A parità di importo, una detrazione vale sempre più di una deduzione. Un nome che confonde le due
è un nome che invita all'errore.

Lo stesso problema si ripete altrove:

| Italiano | Traduzione inglese naturale | Cosa si perde |
|---|---|---|
| imponibile fiscale / reddito complessivo | `taxable income` per entrambi | sono due grandezze diverse nella stessa formula |
| somma esente / detrazione | `tax relief` per entrambe | una non concorre al reddito, l'altra riduce l'imposta |
| addizionale / imposta | `tax` per entrambe | l'addizionale ha base e soglie proprie |

## Il motivo secondario: tracciabilità

L'obiettivo dichiarato di questo progetto è che ogni numero sia risalibile alla sua norma
(vedi [02-modello-calcolo.md](02-modello-calcolo.md)). I nomi in italiano rendono il collegamento
diretto, senza traduzione mentale:

```js
// art. 13 co. 1.1 TUIR: "La detrazione spettante è aumentata di un importo pari a 65 euro"
maggiorazione65: { sogliaMin: 25000, sogliaMax: 35000, importo: 65 }
```

La variante inglese — `employmentTaxCreditSurcharge` — costringe chi rilegge a tradurre
all'indietro per verificare che il codice dica quello che dice la legge. È attrito aggiunto in
un punto dove l'errore costa caro.

