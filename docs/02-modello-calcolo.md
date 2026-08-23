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
I contributi si calcolano sulla RAL (fino al massimale contributivo);
l'IRPEF su ciò che resta dopo i contributi.

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

**Cuneo fiscale, due binari mutuamente esclusivi.** Fino a 20.000 € inclusi
di reddito complessivo è una somma esente (non concorre al reddito, si somma
al netto). Da 20.001 a 40.000 € è una detrazione (riduce l'IRPEF). Sono
meccanismi diversi, per questo `calcolaCuneoFiscale` restituisce i due
importi separati invece di un totale unico.

**Trattamento integrativo condizionato.** Spetta solo se l'IRPEF lorda supera
la detrazione art. 13. La condizione si verifica in `calcolaNetto`, perché
`calcolaTrattamentoIntegrativo` da sola non ha i dati per saperlo.

## Parametri di input

`mensilità` (default 13) e `giorni lavorati` (default 365) sono esposti come
input perché la normativa vi è sensibile: le mensilità cambiano solo il
divisore del netto mensile; i giorni incidono sul ragguaglio della detrazione
art. 13 e del trattamento integrativo (non sull'ulteriore detrazione del
cuneo fiscale, che non è ragguagliata ai giorni).

## Costo azienda (calcolo separato)

Oltre al netto per il dipendente, il progetto calcola quanto costa lo stesso
dipendente all'azienda — prospettiva diversa sulla stessa RAL, gestita da
una funzione indipendente (`calcolaCostoAzienda`) che non condivide stato
con `calcolaNetto`.

    RAL
     + contributi INPS a carico datore
     + INAIL
     + TFR
     = COSTO AZIENDA ANNUO

| #   | Voce                   | Riferimento normativo                | Funzione              |
| --- | ---------------------- | ------------------------------------ | --------------------- |
| 1   | Contributi INPS datore | aliquota IVS 23,81% · INPS           | `calcolaCostoAzienda` |
| 2   | INAIL                  | 0,4% (impiegato d'ufficio)           | `calcolaCostoAzienda` |
| 3   | TFR                    | art. 2120 c.c. — RAL/13,5 − 0,5% FAP | `calcolaCostoAzienda` |

Il TFR è calcolato con la formula esatta (non l'approssimazione 6,91%): la
quota lorda RAL/13,5 (7,41%), meno lo 0,5% versato all'INPS per il Fondo
Adeguamento Pensioni, che non resta a carico dell'azienda.
