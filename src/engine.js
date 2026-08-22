// @ts-check

/**
 * Calcola i contributi INPS a carico del dipendente.
 * Fonte: circolare INPS n. 6/2026, art. 3-ter D.L. 384/1992.
 * @param {number} ral
 * @param {{aliquotaOrdinaria: number, aliquotaAggiuntiva: number, primaFasciaRetribuzionePensionabile: number, massimaleContributivoAnnuo: number}} config
 * @returns {number}
 */
export function calcolaContributiInps(ral, config) {
  const { aliquotaOrdinaria, aliquotaAggiuntiva, primaFasciaRetribuzionePensionabile, massimaleContributivoAnnuo } = config;

  const imponibileContributivo = Math.min(ral, massimaleContributivoAnnuo);

  if (imponibileContributivo <= primaFasciaRetribuzionePensionabile) {
    return imponibileContributivo * aliquotaOrdinaria;
  }

  const fasciaBase = primaFasciaRetribuzionePensionabile * aliquotaOrdinaria;
  const fasciaEccedente = (imponibileContributivo - primaFasciaRetribuzionePensionabile) * aliquotaAggiuntiva;
  return fasciaBase + fasciaEccedente;
}

/**
 * Calcola l'IRPEF lorda, progressiva per scaglioni.
 * Fonte: art. 11 TUIR, come modificato da L. 199/2025 art. 1 co. 3-4.
 * @param {number} imponibileFiscale
 * @param {{scaglioni: Array<{limiteSuperiore: number, aliquota: number}>}} config
 * @returns {number}
 */
export function calcolaIrpefLorda(imponibileFiscale, config) {
  let imposta = 0;
  let limiteInferiore = 0;

  for (const scaglione of config.scaglioni) {
    if (imponibileFiscale <= limiteInferiore) break;

    const quotaInScaglione = Math.min(imponibileFiscale, scaglione.limiteSuperiore) - limiteInferiore;
    imposta += quotaInScaglione * scaglione.aliquota;
    limiteInferiore = scaglione.limiteSuperiore;
  }

  return imposta;
}

/**
 * Tronca un numero a 4 cifre decimali, SENZA arrotondare.
 * Richiesto esplicitamente dalla norma per il rapporto nelle formule art. 13 TUIR.
 * @param {number} valore
 * @returns {number}
 */
function truncate4(valore) {
  return Math.trunc(valore * 10000) / 10000;
}

/**
 * Calcola la detrazione per lavoro dipendente, ragguagliata ai giorni lavorati.
 * Fonte: art. 13 co. 1 e 1.1 TUIR.
 * @param {number} redditoComplessivo
 * @param {number} giorniLavorati
 * @param {{
 *   sogliaBassa: number,
 *   importoFisso: number,
 *   minimoTempoIndeterminato: number,
 *   fasciaMedia: {sogliaMin: number, sogliaMax: number, base: number, moltiplicatore: number, divisore: number, riferimento: number},
 *   fasciaAlta: {sogliaMin: number, sogliaMax: number, base: number, divisore: number, riferimento: number},
 *   maggiorazione65: {sogliaMin: number, sogliaMax: number, importo: number}
 * }} config
 * @returns {number}
 */
export function calcolaDetrazioneLavoroDipendente(redditoComplessivo, giorniLavorati, config) {
  const { sogliaBassa, importoFisso, minimoTempoIndeterminato, fasciaMedia, fasciaAlta, maggiorazione65 } = config;

  if (redditoComplessivo > fasciaAlta.sogliaMax) return 0;

  let detrazioneBase;
  if (redditoComplessivo <= sogliaBassa) {
    detrazioneBase = importoFisso;
  } else if (redditoComplessivo <= fasciaMedia.sogliaMax) {
    const rapporto = truncate4((fasciaMedia.riferimento - redditoComplessivo) / fasciaMedia.divisore);
    detrazioneBase = fasciaMedia.base + fasciaMedia.moltiplicatore * rapporto;
  } else {
    const rapporto = truncate4((fasciaAlta.riferimento - redditoComplessivo) / fasciaAlta.divisore);
    detrazioneBase = fasciaAlta.base * rapporto;
  }

  const conMaggiorazione =
    redditoComplessivo > maggiorazione65.sogliaMin && redditoComplessivo <= maggiorazione65.sogliaMax
      ? detrazioneBase + maggiorazione65.importo
      : detrazioneBase;

  const ragguagliata = conMaggiorazione * (giorniLavorati / 365);

  // il pavimento minimo esiste SOLO nella fascia bassa (art. 13 co. 1 lett. a) — non è un floor universale
  if (redditoComplessivo <= sogliaBassa) {
    return Math.max(ragguagliata, minimoTempoIndeterminato);
  }
  return ragguagliata;
}

/**
 * Calcola il cuneo fiscale: somma esente (RC ≤ 20.000) o ulteriore detrazione (20.000 < RC ≤ 40.000).
 * I due binari sono mutuamente esclusivi.
 * Fonte: art. 1 co. 4 e co. 6 L. 207/2024, reso strutturale da L. 199/2025.
 * @param {number} redditoComplessivo
 * @param {{
 *   sommaEsente: {sogliaMassima: number, scaglioni: Array<{sogliaMax: number, aliquota: number, massimo: number}>},
 *   ulterioreDetrazione: {sogliaMin: number, sogliaMedia: number, sogliaMax: number, importoFisso: number, divisoreRiduzione: number}
 * }} config
 * @returns {{sommaEsente: number, ulterioreDetrazione: number}}
 */
export function calcolaCuneoFiscale(redditoComplessivo, config) {
  if (redditoComplessivo <= config.sommaEsente.sogliaMassima) {
    const scaglione = config.sommaEsente.scaglioni.find((s) => redditoComplessivo <= s.sogliaMax);
    if (scaglione === undefined) throw new Error("Scaglione non trovato per redditoComplessivo: " + redditoComplessivo);
    const importo = Math.min(redditoComplessivo * scaglione.aliquota, scaglione.massimo);
    return { sommaEsente: importo, ulterioreDetrazione: 0 };
  }

  const { sogliaMedia, sogliaMax, importoFisso, divisoreRiduzione } = config.ulterioreDetrazione;

  if (redditoComplessivo > sogliaMax) {
    return { sommaEsente: 0, ulterioreDetrazione: 0 };
  }
  if (redditoComplessivo <= sogliaMedia) {
    return { sommaEsente: 0, ulterioreDetrazione: importoFisso };
  }

  const importo = (importoFisso * (sogliaMax - redditoComplessivo)) / divisoreRiduzione;
  return { sommaEsente: 0, ulterioreDetrazione: importo };
}

/**
 * Calcola l'importo candidato del trattamento integrativo (ex bonus Renzi), ragguagliato ai giorni.
 * la condizione di capienza (spetta solo se l'imposta lorda supera la detrazione art. 13)
 * Fonte: D.L. 3/2020, confermato per il 2026.
 * @param {number} redditoComplessivo
 * @param {number} giorniLavorati
 * @param {{sogliaMassima: number, importoAnnuo: number}} config
 * @returns {number}
 */
export function calcolaTrattamentoIntegrativo(redditoComplessivo, giorniLavorati, config) {
  if (redditoComplessivo > config.sogliaMassima) return 0;
  return config.importoAnnuo * (giorniLavorati / 365);
}

/**
 * Calcola addizionale regionale (Lombardia, progressiva) e comunale (Milano, aliquota unica con soglia).
 * Fonte: art. 72 l.r. Lombardia 10/2003; delibera comunale Milano.
 * L'addizionale regionale riusa la stessa logica a scaglioni dell'IRPEF (identica forma dati).
 * @param {number} imponibileFiscale
 * @param {{
 *   addizionaleRegionaleLombardia: {scaglioni: Array<{limiteSuperiore: number, aliquota: number}>},
 *   addizionaleComunaleMilano: {aliquota: number, sogliaEsenzione: number}
 * }} config
 * @returns {{regionale: number, comunale: number}}
 */
export function calcolaAddizionali(imponibileFiscale, config) {
  const regionale = calcolaIrpefLorda(imponibileFiscale, config.addizionaleRegionaleLombardia);

  // NON è una franchigia: sopra soglia, l'aliquota si applica sull'INTERO imponibile.
  const comunale = imponibileFiscale > config.addizionaleComunaleMilano.sogliaEsenzione ? imponibileFiscale * config.addizionaleComunaleMilano.aliquota : 0;

  return { regionale, comunale };
}
