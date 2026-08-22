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