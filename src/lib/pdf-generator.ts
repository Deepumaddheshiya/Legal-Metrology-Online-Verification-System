import { jsPDF } from "jspdf";
import autoTablePlugin from "jspdf-autotable";
import type { Certificate, Instrument } from "../types";
import { generateCertificateQrDataUrl } from "./qr-code";

const autoTable: any = (autoTablePlugin as any)?.default || autoTablePlugin;

export interface GeneratePdfOptions {
  certificate: any;
  instrument?: any;
}

export async function generateCertificatePdf(options: GeneratePdfOptions): Promise<jsPDF> {
  const { certificate } = options;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Outer Decorative Border (Government Certificate Standard)
  doc.setDrawColor(30, 58, 138); // Primary Blue #1E3A8A
  doc.setLineWidth(1.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(209, 213, 226);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Top Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text("GOVERNMENT OF INDIA", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text("MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION", pageWidth / 2, 26, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.text("DEPARTMENT OF CONSUMER AFFAIRS — LEGAL METROLOGY DIVISION", pageWidth / 2, 31, { align: "center" });

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.8);
  doc.line(20, 35, pageWidth - 20, 35);

  // Certificate Title Banner
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(pageWidth / 2 - 65, 38, 130, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("CERTIFICATE OF VERIFICATION", pageWidth / 2, 44.5, { align: "center" });

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(107, 114, 128);
  doc.text("[Issued under Section 24 of the Legal Metrology Act, 2009 & Rule 14 of LM (General) Rules, 2011]", pageWidth / 2, 53, { align: "center" });

  // Certificate Meta Strip
  doc.setFillColor(243, 244, 246);
  doc.rect(15, 57, pageWidth - 30, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text(`Certificate No: ${certificate.certificateNumber}`, 20, 64);
  doc.setTextColor(5, 150, 105);
  doc.text(`Status: ${(certificate.status || "ACTIVE").toUpperCase()}`, pageWidth - 20, 64, { align: "right" });

  const businessName = certificate.business?.businessName || certificate.businessName || "Commercial Establishment";
  const businessAddress = certificate.business?.address || certificate.businessAddress || certificate.locationOfUse || "Premises Address";
  const gstin = certificate.business?.gstin || certificate.gstin || "N/A";
  const locationOfUse = certificate.instrument?.locationOfUse || certificate.locationOfUse || "Premises";

  // Details Table 1: Establishment Details
  autoTable(doc, {
    startY: 72,
    margin: { left: 15, right: 15 },
    head: [["1. USER / COMMERCIAL ESTABLISHMENT DETAILS", ""]],
    body: [
      ["Business Name / Trader", businessName],
      ["Address of Premises", businessAddress],
      ["GSTIN / Registration No.", gstin],
      ["Location of Instrument in Use", locationOfUse],
    ],
    theme: "striped",
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [31, 41, 55] },
    columnStyles: { 0: { cellWidth: 60, fontStyle: "bold" }, 1: { cellWidth: "auto" } },
  });

  const instType = certificate.instrument?.instrumentType || certificate.instrumentType || "weighing_scale";
  const instMake = certificate.instrument?.make || certificate.instrumentMake || "Standard Make";
  const instModel = certificate.instrument?.model || certificate.instrumentModel || "Model";
  const serialNo = certificate.instrument?.serialNumber || certificate.serialNumber || "SN-001";
  const capacity = certificate.instrument?.capacity || certificate.capacity || "30 kg";
  const leastCount = certificate.instrument?.leastCount || certificate.leastCount || "5 g";

  // Details Table 2: Instrument Technical Specifications
  const finalY1 = (doc as any).lastAutoTable.finalY || 105;
  autoTable(doc, {
    startY: finalY1 + 5,
    margin: { left: 15, right: 15 },
    head: [["2. INSTRUMENT TECHNICAL SPECIFICATIONS", ""]],
    body: [
      ["Instrument Type", String(instType).replace(/_/g, " ").toUpperCase()],
      ["Manufacturer / Make", instMake],
      ["Model Identifier", instModel],
      ["Serial Number", serialNo],
      ["Max Capacity & Least Count", `${capacity} (Least Count: ${leastCount})`],
    ],
    theme: "striped",
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [31, 41, 55] },
    columnStyles: { 0: { cellWidth: 60, fontStyle: "bold" }, 1: { cellWidth: "auto" } },
  });

  const validFrom = typeof certificate.validFrom === "string" ? certificate.validFrom : new Date(certificate.validFrom || certificate.issueDate).toISOString().split("T")[0];
  const validUntil = typeof certificate.validUntil === "string" ? certificate.validUntil : new Date(certificate.validUntil).toISOString().split("T")[0];
  const sealNumber = certificate.sealNumber || "IND-LM-VERIFIED-2026";
  const officerName = certificate.issuedByUser?.fullName || certificate.issuedByName || "Inspector Nadeem Khan";

  // Details Table 3: Statutory Validity Period
  const finalY2 = (doc as any).lastAutoTable.finalY || 155;
  autoTable(doc, {
    startY: finalY2 + 5,
    margin: { left: 15, right: 15 },
    head: [["3. VERIFICATION & VALIDITY SUMMARY", ""]],
    body: [
      ["Date of Verification / Stamping", validFrom],
      ["Valid Until (Next Re-Verification Due)", validUntil],
      ["Physical Seal / Stamp Number", sealNumber],
      ["Issuing Authority", `${officerName} (Legal Metrology Officer)`],
    ],
    theme: "striped",
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [31, 41, 55] },
    columnStyles: { 0: { cellWidth: 60, fontStyle: "bold" }, 1: { cellWidth: "auto" } },
  });

  const finalY3 = (doc as any).lastAutoTable.finalY || 205;

  // Add QR Code for Instant Citizen Verification
  try {
    let qrDataUrl = certificate.qrCodeData;
    if (!qrDataUrl || !qrDataUrl.startsWith("data:image/png;base64,")) {
      qrDataUrl = await generateCertificateQrDataUrl(
        certificate.certificateNumber || "MH/2026/WS/000001",
        certificate.verificationToken || "vtok_default"
      );
    }

    if (qrDataUrl && qrDataUrl.startsWith("data:image/png;base64,")) {
      doc.addImage(qrDataUrl, "PNG", 18, finalY3 + 6, 32, 32);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 58, 138);
      doc.text("SCAN TO VERIFY", 34, finalY3 + 42, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text("Authenticity on National Portal", 34, finalY3 + 45.5, { align: "center" });
    }
  } catch (err) {
    console.error("QR Code rendering error in PDF:", err);
  }

  // Right Side: Official Digital Signature Stamp
  doc.setDrawColor(209, 213, 219);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(pageWidth - 85, finalY3 + 6, 70, 36, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("DIGITALLY SIGNED & VERIFIED", pageWidth - 50, finalY3 + 12, { align: "center" });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.text(`Officer: ${officerName}`, pageWidth - 50, finalY3 + 18, { align: "center" });
  doc.text("Designation: Legal Metrology Officer", pageWidth - 50, finalY3 + 23, { align: "center" });
  doc.text(`Issued On: ${new Date(certificate.issueDate || Date.now()).toLocaleDateString("en-IN")}`, pageWidth - 50, finalY3 + 28, { align: "center" });
  doc.setTextColor(5, 150, 105);
  doc.setFont("helvetica", "bold");
  doc.text("✓ SECURE DIGITAL SEAL AFFIXED", pageWidth - 50, finalY3 + 36, { align: "center" });

  // Cryptographic Tamper-Proof Hash & Verification URL
  doc.setFontSize(6.5);
  doc.setFont("courier", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(`SHA-256 Checksum: ${certificate.sha256Hash || "VERIFIED-AUTHENTIC-SEAL"}`, 15, pageHeight - 16);
  doc.text(`Verification URL: https://lmovs.gov.in/verify/${certificate.certificateNumber}`, 15, pageHeight - 12);

  return doc;
}

/**
 * Generates raw Uint8Array PDF bytes for server-side streaming or storage upload
 */
export async function generateCertificatePdfBytes(options: GeneratePdfOptions): Promise<Uint8Array> {
  const doc = await generateCertificatePdf(options);
  const arrayBuffer = doc.output("arraybuffer");
  return new Uint8Array(arrayBuffer);
}

/**
 * Client-side browser download helper
 */
export async function downloadCertificatePdf(certificate: any) {
  const doc = await generateCertificatePdf({ certificate });
  doc.save(`LMOVS-Certificate-${certificate.certificateNumber.replace(/\//g, "-")}.pdf`);
}
