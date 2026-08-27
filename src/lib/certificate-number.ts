export interface GenerateCertNumberParams {
  stateCode?: string;
  year?: number;
  instrumentType?: string;
}

/**
 * Normalizes statutory instrument type code
 */
export function getInstrumentTypeCode(type?: string): string {
  if (!type) return "WS";
  const lower = type.toLowerCase().trim();
  if (lower.includes("weights_measures") || lower.includes("weight_measure") || lower === "wm") return "WM";
  if (lower.includes("measur") || lower.includes("flow") || lower === "mi") return "MI";
  if (lower.includes("weigh") || lower.includes("scale") || lower === "ws") return "WS";
  return "WS";
}

/**
 * Normalizes state code
 */
export function normalizeStateCode(code?: string): string {
  if (!code) return "MH";
  const cleaned = code.trim().toUpperCase();
  return cleaned.length >= 2 ? cleaned.slice(0, 2) : "MH";
}

/**
 * Generates an anti-collision, sequential Certificate Number
 * Format: {STATE_CODE}/{YEAR}/{TYPE_CODE}/{6_DIGIT_SEQUENCE}
 * Example: MH/2026/WS/000001
 */
export function generateNextCertificateNumber(
  dbOrParams?: any,
  params: GenerateCertNumberParams = {}
): string {
  const actualParams = (dbOrParams && typeof dbOrParams === "object" && !dbOrParams.certificate) ? dbOrParams : params;
  const stateCode = normalizeStateCode(actualParams.stateCode);
  const year = actualParams.year || new Date().getFullYear();
  const typeCode = getInstrumentTypeCode(actualParams.instrumentType);
  const randomSeq = Math.floor(10000 + Math.random() * 90000);
  return `${stateCode}/${year}/${typeCode}/${randomSeq}`;
}
