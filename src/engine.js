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