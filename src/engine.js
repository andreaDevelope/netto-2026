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
