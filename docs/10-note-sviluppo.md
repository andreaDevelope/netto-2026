# Note di sviluppo — materiale per interview

## Rigore nel processo (bug trovati e corretti)
- INPS: aliquota aggiuntiva 0.0119 invece di 0.1019 (battitura, commento giusto ma valore sbagliato)
- Detrazione lavoro dipendente: minimi 690/1.380 invertiti nel config
- Detrazione lavoro dipendente: pavimento minimo applicato a tutte le fasce invece che solo a RC ≤ 15.000 (art. 13 co. 1 lett. a) — trovato con test sul bordo RC=50.000

## Scoperte nel dominio (non solo errori miei)
- (in arrivo — ambiguità cuneo fiscale, somma esente)