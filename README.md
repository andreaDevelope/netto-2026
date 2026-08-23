# netto-2026

Calcolatore di stipendio netto da RAL, anno d'imposta 2026. Caso standard:
dipendente privato a tempo indeterminato, residente a Milano, nessuna
agevolazione particolare.

[Prova il calcolatore](https://github.com/andreaDevelope/netto-2026)

## Come funziona

Inserisci la RAL (e opzionalmente mensilità e giorni lavorati), il
calcolatore mostra il netto annuo e mensile con ogni voce trattenuta —
contributi, IRPEF, detrazioni, addizionali — ciascuna con il riferimento di
legge accanto. Un pannello a parte mostra anche il costo per l'azienda
(contributi datore, INAIL, TFR).

## Eseguire in locale

Nessuna installazione richiesta: apri `index.html` con un server statico
(es. estensione "Live Server" di VSCode) — serve `http://`, non `file://`,
perché il progetto usa moduli ES.

## Eseguire i test

```bash
node --test
```

42 test, nessuna dipendenza da installare (usa il test runner nativo di
Node).

## Perché vanilla JS, zero dipendenze

Uso Angular quotidianamente al lavoro. L'ho valutato e scartato: per una
funzione pura senza stato né backend avrebbe aggiunto complessità a costo
zero di valore. Il tempo risparmiato l'ho investito nella ricerca normativa
e nei test. Il motore è comunque isolato dal DOM: portarlo in Angular, React
o in un backend Java è un'operazione di riscrittura contenuta, non un
rifacimento (dettagli in
[docs/03-scelte-tecniche.md](docs/03-scelte-tecniche.md)).

## Struttura

    index.html          → interfaccia (toggle light/dark in CSS puro, zero JS)
    calcolatore.css      → stile
    src/
      engine.js          → motore di calcolo, funzioni pure (netto + costo azienda)
      config-2026.js      → parametri normativi, ognuno con riferimento di legge
      ui.js               → collega form e motore
    test/
      engine.test.js      → 42 test (node --test)
    docs/                → documentazione (indice sotto)

## Documentazione

1. [Il problema, come l'ho letto](docs/01-problema.md)
2. [Il modello di calcolo](docs/02-modello-calcolo.md)
3. [Scelte tecniche](docs/03-scelte-tecniche.md)
4. [Lingua del codice](docs/04-lingua-del-codice.md)
5. [Semplificazioni adottate](docs/05-semplificazioni.md)
6. [Ambiguità normative e come le ho risolte](docs/06-ambiguita-normative.md)
7. [Test e validazione](docs/07-test-e-validazione.md)
8. [Limiti noti e cosa farei con più tempo](docs/08-limiti-e-roadmap.md)
9. [Fonti](docs/09-fonti.md)
