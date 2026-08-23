# Limiti noti e cosa farei con più tempo

## Rappresentazione numerica

Il motore usa il tipo `Number` di JavaScript (virgola mobile IEEE 754), con un
epsilon guard nel punto dove la norma richiede un troncamento a 4 decimali
(art. 13 TUIR, rapporto nelle formule di detrazione).

Alternative valutate:

| Approccio             | Perché non l'ho scelto                                                                                                                                                                                                                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Interi in centesimi   | Risolve le somme di denaro, non il rapporto frazionario da troncare — quello va gestito esplicitamente in qualunque rappresentazione. In più, i valori nel config non assomiglierebbero più ai numeri scritti nella norma (`1.955 €` → `195500`), perdendo la confrontabilità a colpo d'occhio che è il punto di `config-2026.js` |
| `decimal.js` o simili | Introduce una dipendenza esterna, in contrasto con la scelta dichiarata in [03-scelte-tecniche.md](03-scelte-tecniche.md)                                                                                                                                                                                                         |

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

## Altri limiti, se dovessi estendere il progetto

**Solo Lombardia/Milano.** Le altre regioni e comuni richiedono solo dati
aggiuntivi in `config-2026.js` (aliquote e soglie), non modifiche al motore —
è il vantaggio della configurazione isolata. Con più tempo, la userei per
estendere e confermare che l'astrazione regge.

**Nessun carico di famiglia.** Le detrazioni per coniuge e figli a carico
(art. 12 TUIR) sono formule note quanto quelle già implementate, ma
aggiungerebbero 2-3 parametri di input e una nuova funzione. Non le ho
incluse perché il task specifica "nessuna agevolazione particolare".

**Nessuna validazione degli input.** Il motore assume input già validati
(RAL positiva, giorni tra 1 e 365). L'interfaccia ha vincoli HTML (`min`,
`max`) ma `calcolaNetto` chiamata direttamente non li verifica.

**Un solo anno d'imposta.** `config-2026.js` è nominato per il 2026 di
proposito: cambiando Legge di Bilancio, si crea un nuovo file
(`config-2027.js`) invece di sovrascrivere quello esistente, mantenendo lo
storico calcolabile. Oggi l'interfaccia importa solo il 2026; un selettore
d'anno è l'estensione naturale.
