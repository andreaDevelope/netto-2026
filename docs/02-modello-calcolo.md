# Il modello di calcolo

Catena completa, dalla RAL al netto. Ogni passaggio rimanda al parametro
corrispondente in [config-2026.js](../src/config-2026.js).

    RAL
     − contributi INPS                    → imponibile fiscale
     → IRPEF lorda (su imponibile fiscale)
     − detrazione lavoro dipendente
     − ulteriore detrazione (cuneo fiscale)
     = IRPEF netta (minimo zero)
     − addizionale regionale
     − addizionale comunale
     + somma esente (cuneo fiscale)
     + trattamento integrativo
     = NETTO ANNUO ÷ mensilità = NETTO MENSILE

Principio chiave: **contributi e imposte non condividono la base imponibile**.
I contributi si calcolano sulla RAL; l'IRPEF su ciò che resta dopo i contributi.

## Voce per voce

| #   | Voce                                                | Riferimento normativo                        | Funzione                            |
| --- | --------------------------------------------------- | -------------------------------------------- | ----------------------------------- |
| 1   | Contributi INPS                                     | art. 3-ter D.L. 384/1992 · circ. INPS 6/2026 | `calcolaContributiInps`             |
| 2   | Imponibile fiscale                                  | RAL − contributi (deducibili)                | —                                   |
| 3   | IRPEF lorda                                         | art. 11 TUIR, mod. L. 199/2025               | `calcolaIrpefLorda`                 |
| 4   | Detrazione lavoro dipendente                        | art. 13 co. 1 e 1.1 TUIR                     | `calcolaDetrazioneLavoroDipendente` |
| 5   | Cuneo fiscale (somma esente / ulteriore detrazione) | art. 1 co. 4 e 6, L. 207/2024                | `calcolaCuneoFiscale`               |
| 6   | Trattamento integrativo                             | D.L. 3/2020                                  | `calcolaTrattamentoIntegrativo`     |
| 7   | Addizionale regionale (Lombardia)                   | art. 72 l.r. 10/2003                         | `calcolaAddizionali`                |
| 8   | Addizionale comunale (Milano)                       | delibera comunale                            | `calcolaAddizionali`                |

## Due punti che il codice gestisce esplicitamente

**Cuneo fiscale, due binari mutuamente esclusivi.** Sotto i 20.000 € di
reddito complessivo è una somma esente (non concorre al reddito, si somma
al netto). Tra 20.000 e 40.000 € è una detrazione (riduce l'IRPEF). Sono
meccanismi diversi, per questo `calcolaCuneoFiscale` restituisce i due
importi separati invece di un totale unico.

**Trattamento integrativo condizionato.** Spetta solo se l'IRPEF lorda supera
la detrazione art. 13. La condizione si verifica in `calcolaNetto`, perché
`calcolaTrattamentoIntegrativo` da sola non ha i dati per saperlo.

## Parametri di input

`mensilità` (default 13) e `giorni lavorati` (default 365) sono esposti come
input perché la normativa vi è sensibile: le mensilità cambiano solo il
divisore del netto mensile, i giorni incidono sul ragguaglio delle detrazioni.
