import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | Date): string {
  if (!dateString) return "N/A";
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(date, "dd MMM yyyy");
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString?: string | Date): string {
  if (!dateString) return "N/A";
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(date, "dd MMM yyyy, hh:mm a");
  } catch {
    return String(dateString);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDaysUntilExpiry(validUntilDate?: string): { days: number; isExpired: boolean; isDueSoon: boolean } {
  if (!validUntilDate) return { days: 0, isExpired: false, isDueSoon: false };
  try {
    const target = parseISO(validUntilDate);
    const now = new Date();
    const days = differenceInDays(target, now);
    return {
      days,
      isExpired: days < 0,
      isDueSoon: days >= 0 && days <= 30,
    };
  } catch {
    return { days: 0, isExpired: false, isDueSoon: false };
  }
}

export function generateApplicationNumber(stateCode: string = "DL"): string {
  const random = Math.floor(100000 + Math.random() * 900000);
  const year = new Date().getFullYear();
  return `APP/${stateCode}/${year}/${random}`;
}

export function generateCertificateNumber(stateCode: string = "DL", instrumentType: string = "WS"): string {
  const random = Math.floor(10000 + Math.random() * 90000);
  const year = new Date().getFullYear();
  const typeCode = instrumentType.toUpperCase().slice(0, 2);
  return `${stateCode}/${year}/${typeCode}/${random}`;
}

export function generateSealNumber(officerId: string = "LMO"): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SEAL-${officerId.toUpperCase()}-${random}`;
}

export function generateVerificationToken(): string {
  return `tok_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
}

export function generateCryptoHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852${hex}`;
}
