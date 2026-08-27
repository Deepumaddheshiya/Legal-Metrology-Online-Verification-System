import { STANDARD_FEE_RATES } from "./constants";

export interface FeeCalculationParams {
  instrumentType: "weighing_scale" | "measuring_instrument" | "weight" | "measure";
  category?: string;
  verificationType?: "new_verification" | "re_verification";
  stateId?: string | null;
}

export interface FeeCalculationResult {
  baseFee: number;
  gstAmount: number;
  totalFee: number;
  feeRuleId: string | null;
  ruleSource: "STATE_OVERRIDE" | "NATIONAL_SCHEDULE" | "DEFAULT_SCHEDULE";
  categoryMatched: string;
  verificationType: "new_verification" | "re_verification";
  currency: string;
}

/**
 * Calculates statutory verification fee based on Legal Metrology (General) Rules, 2011 Schedule VI
 */
export function calculateVerificationFee(
  params: FeeCalculationParams
): FeeCalculationResult {
  const {
    instrumentType,
    category = "Standard Legal Metrology Baseline",
    verificationType = "new_verification",
  } = params;

  const baseRate = STANDARD_FEE_RATES[instrumentType] || 750;
  const baseFee = verificationType === "re_verification" ? baseRate : Math.round(baseRate * 1.25);
  const gstAmount = Math.round(baseFee * 0.18 * 100) / 100;

  return {
    baseFee,
    gstAmount,
    totalFee: Math.round((baseFee + gstAmount) * 100) / 100,
    feeRuleId: `fee-rule-${instrumentType}`,
    ruleSource: "NATIONAL_SCHEDULE",
    categoryMatched: category,
    verificationType,
    currency: "INR",
  };
}
