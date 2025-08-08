/**
 * Remove espaços desnecessários do texto bruto
 * @param {string} text
 * @returns {string}
 */
export function getRawOrders (text) {
  return text.trim();
}

/**
 * Divide o texto em linhas válidas, ignorando vazias
 * @param {string} rawText
 * @returns {string[]}
 */
export function splitOrders (rawText) {
  return rawText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);
}
