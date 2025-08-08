/**
 * Remove espaços extras do início e do fim do texto.
 * @param {string} text - Texto bruto copiado.
 * @returns {string} Texto tratado.
 */
export interface RawOrdersInput {
  text: string;
}

export interface RawOrdersOutput {
  result: string;
}

export function getRawOrders(text: string): string {
  return text.trim();
}

/**
 * Converte o texto bruto em um array de linhas válidas.
 * Ignora linhas vazias ou apenas com espaços.
 * @param {string} rawText - Texto bruto tratado.
 * @returns {string[]} Lista de linhas.
 */
export interface SplitOrdersInput {
  rawText: string;
}

export interface SplitOrdersOutput {
  lines: string[];
}

export function splitOrders(rawText: SplitOrdersInput['rawText']): SplitOrdersOutput['lines'] {
  const lines = rawText.split("\n");         // separa por quebra de linha
  const trimmed = lines.map(line => line.trim()); // remove espaços de cada linha
  const filtered = trimmed.filter(line => line.length > 0); // ignora vazias
  return filtered;
}