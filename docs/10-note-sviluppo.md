# Note di sviluppo — materiale per interview

## Il punto più interessante
Il troncamento a 4 decimali richiesto dall'art. 13 TUIR (non arrotondamento) si
scontra con la virgola mobile: `0,4075` viene memorizzato internamente come
`0,407499999...`, e un troncamento ingenuo lo taglia a `0,4074` — un errore
silenzioso, nessun crash, solo un numero leggermente sbagliato. Risolto con un
epsilon prima del troncamento. Il bug è emerso da un solo test su 42, quello
con RAL 25.000: gli altri casi cadevano per caso su valori "puliti" in binario.

## Perché il progetto resta volutamente piccolo
Zero dipendenze, zero build step, funzioni pure in un file solo. La
tentazione con l'AI a disposizione è aggiungere: più input, più output, più
UI. Qui il valore non sta nella quantità di feature ma nella
tracciabilità di ogni numero alla norma che lo giustifica. Aggiungere ambiti
non richiesti (netto orario, giornaliero) avrebbe significato numeri senza un
riferimento normativo altrettanto solido.