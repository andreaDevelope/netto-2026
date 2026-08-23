# Semplificazioni adottate

Qui sono elencate quelle rilevanti.

## Reddito complessivo = imponibile fiscale

**La più importante, perché governa tutte le soglie del cuneo fiscale e delle
detrazioni** (15.000 / 20.000 / 32.000 / 40.000 €).

Normativamente, il reddito complessivo può includere redditi diversi da
quello di lavoro dipendente (fondiari, altri redditi) e va calcolato al netto
di eventuali oneri deducibili e della rendita catastale della prima casa. Nel
caso standard — un solo rapporto di lavoro, nessun altro reddito — il reddito
complessivo coincide con l'imponibile fiscale (RAL − contributi INPS). Il
codice usa questa identità esplicitamente in `calcolaNetto`
([engine.js](../src/engine.js)).

Conseguenza pratica: tutte le soglie citate in
[02-modello-calcolo.md](02-modello-calcolo.md) si applicano all'imponibile
fiscale, non alla RAL lorda.

## Solo Lombardia e Milano

Le addizionali regionale e comunale sono cablate per un solo scenario. Un
lavoratore residente altrove avrebbe aliquote diverse (il resto della catena
di calcolo è invariato). Estendere ad altre regioni/comuni significa
aggiungere dati a [config-2026.js](../src/config-2026.js), non toccare
`engine.js`.

## Solo tempo indeterminato

Il pavimento minimo della detrazione lavoro dipendente per tempo determinato
(690/1.380 € invertiti rispetto all'indeterminato) è presente nel config ma
non usato dal motore: non c'è un parametro "tipo contratto" in input.

## Nessuna agevolazione, nessun carico di famiglia

Non sono modellate: decontribuzioni (giovani, donne, Sud), regimi agevolati
per rimpatriati, welfare aziendale/fringe benefit, detrazioni per coniuge o
figli a carico. Ognuna cambierebbe uno o più importi nella catena, ma non la
sua struttura.

## Contribuzione INPS standard

L'aliquota 9,19% (+1% oltre soglia) è quella della generalità dei lavoratori
dipendenti privati. Apprendistato, dirigenza e alcuni settori hanno aliquote
diverse, non modellate.

## Un solo rapporto di lavoro nell'anno

Ragguaglio a giorni e mensilità presume un rapporto continuativo. Cambi di
contratto, sospensioni o rapporti multipli nello stesso anno non sono gestiti.

## INAIL a aliquota fissa (costo azienda)

Il premio INAIL varia molto per mansione e rischio (dallo 0,4% per lavoro
d'ufficio a oltre il 2% per mansioni a rischio). Il calcolo del costo azienda
usa il valore per impiegato d'ufficio (0,4%), coerente con il profilo del
caso standard (impiegato, nessuna mansione a rischio). Un'azienda con
lavoratori in altre categorie di rischio avrebbe un'aliquota diversa.
