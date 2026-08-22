# Il problema, come l'ho letto

La consegna chiede un calcolatore RAL → netto. Ho scelto lo stack più
minimale possibile: vanilla JS, HTML, CSS, zero librerie, zero framework
(niente React, niente Angular), zero build step.
(dettagli in [03-scelte-tecniche.md](03-scelte-tecniche.md)).

## La vera difficoltà è normativa, non tecnica

Il calcolo in sé è semplice da scrivere. La parte che richiede attenzione è
la normativa dietro ai numeri: contributi e imposte non condividono la stessa
base imponibile, detrazioni e somme esenti agiscono in modo diverso pur
sembrando equivalenti in busta paga, e alcune soglie producono effetti a
scalino invece che graduali. Le fonti, anche istituzionali, non sono sempre
concordi (vedi [06-ambiguita-normative.md](06-ambiguita-normative.md)).

Un errore di battitura in una percentuale lo trova un test. Un errore di
lettura della norma no: il codice gira, il numero sembra plausibile, e resta
comunque sbagliato. Per questo la parte di lavoro più lunga è la
ricerca delle fonti, non la scrittura del motore — sette funzioni pure,
isolate in [engine.js](../src/engine.js), con i parametri normativi separati
in [config-2026.js](../src/config-2026.js).
