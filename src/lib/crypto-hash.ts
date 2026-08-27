import crypto from "crypto";

export interface CertificateHashPayload {
  certificateNumber: string;
  applicationId: string;
  instrumentId: string;
  businessId: string;
  issuedByUserId: string;
  sealNumber: string;
  issueDate: string | Date;
  validFrom: string | Date;
  validUntil: string | Date;
  verificationToken: string;
}

/**
 * Generates an immutable SHA-256 cryptographic hash over certificate metadata
 */
export function generateCertificateSha256(payload: CertificateHashPayload): string {
  const normalized = {
    certificateNumber: payload.certificateNumber.trim(),
    applicationId: payload.applicationId.trim(),
    instrumentId: payload.instrumentId.trim(),
    businessId: payload.businessId.trim(),
    issuedByUserId: payload.issuedByUserId.trim(),
    sealNumber: payload.sealNumber.trim(),
    issueDate: typeof payload.issueDate === "string" ? payload.issueDate : payload.issueDate.toISOString(),
    validFrom: typeof payload.validFrom === "string" ? payload.validFrom.split("T")[0] : payload.validFrom.toISOString().split("T")[0],
    validUntil: typeof payload.validUntil === "string" ? payload.validUntil.split("T")[0] : payload.validUntil.toISOString().split("T")[0],
    verificationToken: payload.verificationToken.trim(),
  };

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex");
}

/**
 * Verifies if a certificate's stored SHA-256 hash matches the live reconstructed metadata
 */
export function verifyCertificateHashIntegrity(certificate: any): {
  isValid: boolean;
  computedHash: string;
  recordedHash: string;
} {
  const computedHash = generateCertificateSha256({
    certificateNumber: certificate.certificateNumber,
    applicationId: certificate.applicationId,
    instrumentId: certificate.instrumentId,
    businessId: certificate.businessId,
    issuedByUserId: certificate.issuedByUserId,
    sealNumber: certificate.sealNumber || "",
    issueDate: certificate.issueDate,
    validFrom: certificate.validFrom,
    validUntil: certificate.validUntil,
    verificationToken: certificate.verificationToken,
  });

  return {
    isValid: computedHash === certificate.sha256Hash,
    computedHash,
    recordedHash: certificate.sha256Hash,
  };
}

/**
 * Generates a unique verification token
 */
export function generateVerificationToken(): string {
  return `vtok_${crypto.randomUUID().replace(/-/g, "").substring(0, 16)}`;
}
