// @ts-check
import { calcolaNetto } from "./engine.js";
import { CONFIG_2026 } from "./config-2026.js";

const euroBase = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

/**
 * Formatta un importo in euro, sostituendo il punto delle migliaia con un punto medio (·),
 * coerente con lo stile tipografico tecnico del resto dell'interfaccia.
 * @param {number} valore
 * @returns {string}
 */
function euro(valore) {
  return euroBase.format(valore).replace(/\./g, "·");
}

/**
 * Legge un input numerico, con fallback se vuoto o non valido.
 * @param {string} id
 * @param {number} fallback
 * @returns {number}
 */
function leggiInput(id, fallback) {
  const elemento = /** @type {HTMLInputElement | null} */ (document.getElementById(id));
  if (elemento === null) return fallback;
  const valore = parseFloat(elemento.value);
  return Number.isFinite(valore) ? valore : fallback;
}

/**
 * Costruisce una riga dell'output: etichetta, importo, riferimento normativo.
 * @param {string} etichetta
 * @param {number} importo
 * @param {string} riferimento
 * @returns {string}
 */
function riga(etichetta, importo, riferimento) {
  return `<tr>
    <td>${etichetta}</td>
    <td>${euro(importo)}</td>
    <td><small>${riferimento}</small></td>
  </tr>`;
}

function calcolaEMostra() {
  const ral = leggiInput("ral", 0);
  const mensilita = leggiInput("mensilita", CONFIG_2026.default.mensilita);
  const giorni = leggiInput("giorni", CONFIG_2026.default.giorniLavorati);

  const contenitore = document.getElementById("risultato");
  if (contenitore === null) return;

  if (ral <= 0) {
    contenitore.innerHTML = "<p>Inserisci una RAL maggiore di zero.</p>";
    return;
  }

  const r = calcolaNetto(ral, giorni, mensilita, CONFIG_2026);

  contenitore.innerHTML = `
    <h2>Netto annuo: ${euro(r.nettoAnnuo)}</h2>
    <h3>Netto mensile (${mensilita} mensilità): ${euro(r.nettoMensile)}</h3>

    <table>
      <thead>
        <tr><th>Voce</th><th>Importo</th><th>Riferimento</th></tr>
      </thead>
      <tbody>
        ${riga("RAL", r.ral, "—")}
        ${riga("− Contributi INPS", -r.contributiInps, "art. 3-ter D.L. 384/1992 · circ. INPS 6/2026")}
        ${riga("= Imponibile fiscale", r.imponibileFiscale, "RAL − contributi deducibili")}
        ${riga("IRPEF lorda", -r.irpefLorda, "art. 11 TUIR · L. 199/2025")}
        ${riga("+ Detrazione lavoro dipendente", r.detrazioneLavoroDipendente, "art. 13 co. 1 e 1.1 TUIR")}
        ${riga("+ Ulteriore detrazione (cuneo)", r.cuneoFiscale.ulterioreDetrazione, "art. 1 co. 6 L. 207/2024")}
        ${riga("= IRPEF netta", -r.irpefNetta, "lorda − detrazioni, minimo zero")}
        ${riga("− Addizionale regionale", -r.addizionali.regionale, "art. 72 l.r. Lombardia 10/2003")}
        ${riga("− Addizionale comunale", -r.addizionali.comunale, "delibera Comune di Milano · esenzione fino a 23.000 €")}
        ${riga("+ Somma esente (cuneo)", r.cuneoFiscale.sommaEsente, "art. 1 co. 4 L. 207/2024")}
        ${riga("+ Trattamento integrativo", r.trattamentoIntegrativo, "D.L. 3/2020")}
        ${riga("= Netto annuo", r.nettoAnnuo, "—")}
      </tbody>
    </table>
  `;
}

document.getElementById("calcola")?.addEventListener("click", calcolaEMostra);
