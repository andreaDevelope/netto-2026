# Scelte tecniche

## "Zero dipendenze" — cosa significa esattamente

Il progetto non usa npm, non ha build step, non usa framework JS o CSS: ogni
file è scritto a mano ed è eseguibile aprendo direttamente index.html o
servendolo staticamente (GitHub Pages).
L'unica risorsa esterna è il font (JetBrains Mono + Inter, da Google Fonts),
caricata via `<link>` nell'head.
