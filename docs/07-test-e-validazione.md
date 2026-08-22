# Come sono stati validati i calcoli

## Metodo

Ogni funzione di `engine.js` ha:

- 2-3 casi nel range standard del task (RAL 25.000-35.000 €)
- Casi limite (bordo di ogni soglia, sopra il massimale, valore a zero)

## Validazione esterna

Confronto su RAL 30.000 € (Milano, tempo indeterminato, 13 mensilità, 365 giorni):

| Fonte              | Netto annuo | Scostamento      |
| ------------------ | ----------- | ---------------- |
| Questo motore      | 23.425,48 € | —                |
| Calcolatore Jet HR | 23.395 €    | −30,48 € (0,13%) |
| tuttocalcolato.it  | 22.425,52 € | −999,96 € (4,3%) |

Lo scostamento con tuttocalcolato.it è isolabile a una voce sola. Tutte le altre
combaciano al centesimo (INPS 2.757, imponibile 27.243, IRPEF lorda 6.266,
detrazione art. 13 2.044, addizionale regionale 378, comunale 218), ma il loro
dettaglio riporta come unica detrazione applicata quella dell'art. 13 TUIR:
non compare l'ulteriore detrazione di 1.000 € prevista dall'art. 1 co. 6
L. 207/2024 per la fascia di reddito complessivo 20.000-32.000 €.

Non è escluso che il loro tool la gestisca in un'opzione non esplorata. Il
confronto è riportato perché isola con precisione dove due modelli divergono.
