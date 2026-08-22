# Limiti noti e cosa farei con più tempo

## Rappresentazione numerica

Il motore usa il tipo `Number` di JavaScript (virgola mobile IEEE 754), con un
epsilon guard nel punto dove la norma richiede un troncamento a 4 decimali
(art. 13 TUIR, rapporto nelle formule di detrazione).

Alternative valutate:

| Approccio | Perché non l'ho scelto |
|---|---|
| Interi in centesimi | Risolve le somme di denaro, non il rapporto frazionario da troncare — quello va gestito esplicitamente in qualunque rappresentazione. In più, i valori nel config non assomiglierebbero più ai numeri scritti nella norma (`1.955 €` → `195500`), perdendo la confrontabilità a colpo d'occhio che è il punto di `config-2026.js` |
| `decimal.js` o simili | Introduce una dipendenza esterna, in contrasto con la scelta dichiarata in [03-scelte-tecniche.md](03-scelte-tecniche.md) |


## Dove starebbe il calcolo in produzione

Il motore girerebbe lato server, non nel browser: la normativa cambia a ogni
Legge di Bilancio, e le aliquote nel bundle JS significherebbero un rilascio del
client a ogni aggiornamento normativo. Il frontend farebbe solo form,
validazione e presentazione.

Lato server userei Spring Boot con `BigDecimal`: aritmetica decimale esatta,
che risolve sia le somme sia il troncamento richiesto dall'art. 13 TUIR
(`setScale(4, RoundingMode.DOWN)`) senza epsilon e senza sacrificare la
leggibilità del config.

`engine.js` è isolato dal DOM anche per questo: portarlo su un backend è
un'operazione di riscrittura contenuta.