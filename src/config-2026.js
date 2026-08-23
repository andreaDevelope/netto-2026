// @ts-check

/**
 * config-2026.js
 * Parametri normativi per il calcolo dello stipendio netto — anno d'imposta 2026.
 * Caso standard: dipendente privato, tempo indeterminato, residenza Milano (Lombardia).
 *
 * REGOLA DI QUESTO FILE: ogni numero ha un riferimento di legge o circolare.
 * Se cambia una norma, si tocca SOLO questo file — engine.js non va mai modificato.
 *
 * Verificato via ricerca web il 21/08/2026. Fonti principali:
 * - Circolare INPS n. 6 del 30/01/2026 (contributi, massimali)
 * - Circolare INPS n. 8 del 03/02/2026 (Gestione Separata — non usata qui)
 * - L. 30 dicembre 2025, n. 199 (Legge di Bilancio 2026)
 * - Art. 11, 13 TUIR (D.P.R. 917/1986) come modificati
 * - Art. 72 l.r. Lombardia 10/2003 (addizionale regionale)
 * - Delibera comunale Milano (addizionale comunale, invariata 2025→2026)
 */

export const CONFIG_2026 = {
  // ---------------------------------------------------------------------
  // 1) CONTRIBUTI INPS A CARICO DIPENDENTE
  // Fonte: circolare INPS n. 6/2026; art. 3-ter D.L. 384/1992 (aliquota aggiuntiva 1%)
  // ---------------------------------------------------------------------
  inps: {
    aliquotaOrdinaria: 0.0919, // 9,19% sulla RAL, fascia base
    aliquotaAggiuntiva: 0.1019, // 10,19% = 9,19% + 1% sulla quota eccedente la prima fascia
    primaFasciaRetribuzionePensionabile: 56224, // €/anno 2026 — sopra questa soglia scatta l'aliquota aggiuntiva
    massimaleContributivoAnnuo: 122295, // €/anno 2026 — oltre questo importo non si versano più contributi
  },

  // ---------------------------------------------------------------------
  // 2) IRPEF — SCAGLIONI PROGRESSIVI
  // Fonte: art. 11 TUIR, come modificato da L. 199/2025 (Legge di Bilancio 2026) art. 1 co. 3-4
  // Ogni aliquota si applica SOLO alla porzione di reddito dentro la fascia.
  // ---------------------------------------------------------------------
  irpef: {
    scaglioni: [
      { limiteSuperiore: 28000, aliquota: 0.23 },
      { limiteSuperiore: 50000, aliquota: 0.33 },
      { limiteSuperiore: Infinity, aliquota: 0.43 },
    ],
  },

  // ---------------------------------------------------------------------
  // 3) DETRAZIONE LAVORO DIPENDENTE
  // Fonte: art. 13 co. 1 e 1.1 TUIR
  // Importante: il rapporto nelle formule va troncato alle prime 4 cifre decimali
  // (NON arrotondato) — logica in engine.js, qui solo i parametri.
  // ---------------------------------------------------------------------
  detrazioneLavoroDipendente: {
    sogliaBassa: 15000,
    importoFisso: 1955, // per reddito complessivo <= 15.000 €
    minimoTempoIndeterminato: 690, // pavimento minimo, tempo indeterminato
    minimoTempoDeterminato: 1380, // pavimento minimo, tempo determinato (non usato nel caso standard)

    // 15.001 – 28.000 €: 1.910 + 1.190 × (28.000 − RC) / 13.000
    fasciaMedia: { sogliaMin: 15000, sogliaMax: 28000, base: 1910, moltiplicatore: 1190, divisore: 13000, riferimento: 28000 },

    // 28.001 – 50.000 €: 1.910 × (50.000 − RC) / 22.000
    fasciaAlta: { sogliaMin: 28000, sogliaMax: 50000, base: 1910, divisore: 22000, riferimento: 50000 },

    // Maggiorazione art. 13 co. 1.1 TUIR: +65 € se 25.000 < RC <= 35.000
    maggiorazione65: { sogliaMin: 25000, sogliaMax: 35000, importo: 65 },
  },

  // ---------------------------------------------------------------------
  // 4) CUNEO FISCALE — L. 207/2024 (Legge di Bilancio 2025), reso strutturale da L. 199/2025
  // Due binari mutuamente esclusivi in base al reddito complessivo (RC).
  // ---------------------------------------------------------------------
  cuneoFiscale: {
    // RC <= 20.000 €: SOMMA ESENTE (non è una detrazione, non concorre al reddito)
    // Fonte: INPS (nota CU 2026 / portale INPS) — art. 1 co. 4 L. 207/2024
    //
    //⚠️ AMBIGUITÀ NORMATIVA (vedi docs/06-ambiguita-normative.md):
    // Le fonti indicano tre percentuali con importi massimi:
    //   7,1% (fino a 8.500€, max 603,50€) · 5,3% (8.500-15.000€, max 795€) · 4,8% (15.000-20.000€, max 960€)
    // I massimi tornano SOLO se la percentuale è applicata piatta sull'intero reddito da lavoro
    // (es. 15.000 × 5,3% = 795), non a scaglioni progressivi come l'IRPEF.
  
    // si implementa il metodo INPS (piatto), fonte istituzionale.
    sommaEsente: {
      sogliaMassima: 20000,
      scaglioni: [
        { sogliaMax: 8500, aliquota: 0.071, massimo: 603.5 },
        { sogliaMax: 15000, aliquota: 0.053, massimo: 795 },
        { sogliaMax: 20000, aliquota: 0.048, massimo: 960 },
      ],
      metodo: "piatto", // non progressivo — vedi ambiguità sopra
    },

    // 20.001 – 40.000 €: ULTERIORE DETRAZIONE (agisce sull'imposta, non sul reddito)
    // Fonte: art. 1 co. 6 L. 207/2024
    ulterioreDetrazione: {
      sogliaMin: 20000,
      sogliaMedia: 32000, // fino a qui: importo fisso 1.000 €
      sogliaMax: 40000, // oltre: si azzera
      importoFisso: 1000,
      divisoreRiduzione: 8000, // formula: 1.000 × (40.000 − RC) / 8.000 tra 32.000 e 40.000
    },
  },

  // 5) TRATTAMENTO INTEGRATIVO (ex bonus Renzi)
  // Fonte: D.L. 3/2020, confermato per il 2026
  // Condizione: spetta solo se l'imposta lorda supera la detrazione art. 13
  trattamentoIntegrativo: {
    sogliaMassima: 15000,
    importoAnnuo: 1200,
  },

  // 6) ADDIZIONALE REGIONALE — LOMBARDIA
  // Fonte: art. 72 l.r. Lombardia 14 luglio 2003, n. 10
  // Progressiva per scaglioni (stessi scaglioni IRPEF pre-riforma, mantenuti dalla norma regionale)
  addizionaleRegionaleLombardia: {
    scaglioni: [
      { limiteSuperiore: 15000, aliquota: 0.0123 },
      { limiteSuperiore: 28000, aliquota: 0.0158 },
      { limiteSuperiore: 50000, aliquota: 0.0172 },
      { limiteSuperiore: Infinity, aliquota: 0.0173 },
    ],
  },

  // 7) ADDIZIONALE COMUNALE — MILANO
  // Fonte: delibera comunale Milano (aliquota 2025, confermata per il 2026)
  // Aliquota UNICA (non a scaglioni). Esenzione totale sotto soglia — NON è una
  // franchigia: superata la soglia, l'aliquota si applica sull'INTERO imponibile.
  addizionaleComunaleMilano: {
    aliquota: 0.008,
    sogliaEsenzione: 23000, // sotto o pari: zero. Sopra: 0,8% su tutto.
  },

  // 8) PARAMETRI DI INPUT CON DEFAULT.
  default: {
    mensilita: 13, // cambia solo il divisore del netto mensile, non le imposte
    giorniLavorati: 365, // incide sul ragguaglio delle detrazioni
  },
};
