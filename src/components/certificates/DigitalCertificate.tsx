"use client";

import React, { useEffect, useState } from "react";
import { Certificate } from "@/types";
import { generateQRCodeDataUrl } from "@/lib/qr-code";
import { formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Download, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";


interface DigitalCertificateProps {
  certificate: Certificate;
  onPrint?: () => void;
  showActions?: boolean;
}

export const DigitalCertificate: React.FC<DigitalCertificateProps> = ({
  certificate,
  onPrint,
  showActions = true,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const publicVerifyUrl = `${window.location.origin}/verify/${encodeURIComponent(certificate.certificateNumber)}?token=${certificate.verificationToken}`;
    generateQRCodeDataUrl(publicVerifyUrl).then(setQrDataUrl);
  }, [certificate]);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const isExpired = certificate.status === "expired" || new Date(certificate.validUntil) < new Date();

  return (
    <div className="flex flex-col items-center">
      {/* Top Action Bar */}
      {showActions && (
        <div className="w-full max-w-3xl flex items-center justify-between mb-4 bg-white p-3 rounded-lg border border-gray-200 shadow-xs no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">Certificate Status:</span>
            <Badge status={certificate.status} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Print Official Certificate
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Download PDF
            </Button>
          </div>
        </div>
      )}

      {/* Official A4 Certificate Container */}
      <div className="certificate-page w-full max-w-3xl bg-white border-4 border-[#1E3A8A] rounded-xl p-8 shadow-xl text-gray-900 relative overflow-hidden">
        {/* Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <div className="text-center transform -rotate-45">
            <span className="text-9xl font-black">LEGAL METROLOGY</span>
            <br />
            <span className="text-7xl font-bold">GOVERNMENT OF INDIA</span>
          </div>
        </div>

        {/* Decorative Inner Border */}
        <div className="border border-[#1E3A8A]/40 p-6 rounded-lg relative z-10">
          {/* Header */}
          <div className="text-center pb-5 border-b-2 border-[#1E3A8A]">
            <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold tracking-widest uppercase rounded-full mb-3">
              Form 7 • [See Rule 24 of Legal Metrology (General) Rules, 2011]
            </div>

            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A] flex items-center justify-center font-bold text-xs text-[#1E3A8A] text-center">
                सत्यमेव<br />जयते
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#1E3A8A] tracking-tight">
                  GOVERNMENT OF INDIA
                </h1>
                <h2 className="text-sm sm:text-base font-bold text-gray-800">
                  DEPARTMENT OF CONSUMER AFFAIRS
                </h2>
                <p className="text-xs font-semibold text-gray-600">
                  State Legal Metrology Department • Verification Division
                </p>
              </div>
            </div>

            <div className="mt-3 bg-[#1E3A8A] text-white py-1 px-4 rounded font-bold text-sm tracking-wider uppercase inline-block">
              Certificate of Verification
            </div>
          </div>

          {/* Certificate Meta Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-b border-gray-200 text-xs">
            <div>
              <span className="text-gray-500 block">Certificate Number</span>
              <span className="font-bold text-sm text-[#1E3A8A]">
                {certificate.certificateNumber}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Issue Date</span>
              <span className="font-bold text-gray-900">{formatDate(certificate.issueDate)}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Validity Period</span>
              <span className={cn("font-bold", isExpired ? "text-red-600" : "text-emerald-700")}>
                {formatDate(certificate.validFrom)} to {formatDate(certificate.validUntil)}
              </span>
            </div>
          </div>

          {/* Business & Instrument Details Table */}
          <div className="py-4 space-y-4 text-xs">
            <div className="bg-gray-50 p-3.5 rounded-md border border-gray-200">
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 text-[#1E3A8A]">
                1. Owner & Establishment Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Business Name:</span>{" "}
                  <strong className="text-gray-900">{certificate.businessName}</strong>
                </div>
                <div>
                  <span className="text-gray-500">GSTIN / Reg No:</span>{" "}
                  <strong className="text-gray-900">{certificate.gstin || "Verified Trader"}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500">Premises Address:</span>{" "}
                  <span className="text-gray-800">{certificate.businessAddress}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-md border border-gray-200">
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 text-[#1E3A8A]">
                2. Instrument Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-gray-500 block">Category / Type:</span>
                  <strong className="text-gray-900">{certificate.instrumentType}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Make & Model:</span>
                  <strong className="text-gray-900">
                    {certificate.instrumentMake} ({certificate.instrumentModel})
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Serial Number:</span>
                  <strong className="text-gray-900 font-mono">{certificate.serialNumber}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Max Capacity:</span>
                  <strong className="text-gray-900">{certificate.capacity}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Least Count / Precision:</span>
                  <strong className="text-gray-900">{certificate.leastCount}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Installation Location:</span>
                  <span className="text-gray-800">{certificate.locationOfUse}</span>
                </div>
              </div>
            </div>

            {/* Legal Statement */}
            <p className="text-[11px] text-gray-600 leading-relaxed italic border-l-2 border-[#1E3A8A] pl-3 py-1">
              "This is to certify that the weighing and measuring instrument described above has
              been thoroughly tested and examined in accordance with the specifications laid down
              under the Legal Metrology Act, 2009 and the Legal Metrology (General) Rules, 2011, and
              found to conform with statutory standards."
            </p>
          </div>

          {/* Footer: QR Code, Digital Signature, Seal */}
          <div className="mt-4 pt-4 border-t-2 border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            {/* QR Code Verification */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              {qrDataUrl ? (
                <div className="p-1 bg-white border border-gray-300 rounded shadow-xs">
                  <img src={qrDataUrl} alt="Certificate Verification QR Code" className="w-24 h-24" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-100 animate-pulse rounded border border-gray-300" />
              )}
              <span className="text-[10px] text-gray-500 mt-1 font-mono">
                Scan QR to verify validity
              </span>
            </div>

            {/* Seal Number */}
            <div className="text-center sm:text-left text-xs">
              <span className="text-gray-500 block">Official Seal No.</span>
              <span className="font-bold text-[#1E3A8A] font-mono bg-blue-50 px-2 py-0.5 rounded inline-block border border-blue-200">
                {certificate.sealNumber}
              </span>
              <div className="mt-2 text-[10px] text-emerald-700 font-semibold flex items-center justify-center sm:justify-start gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Digitally Stamped & Signed</span>
              </div>
            </div>

            {/* Issuing Authority */}
            <div className="text-center sm:text-right text-xs">
              <div className="inline-block border-b border-gray-400 pb-1 mb-1 font-serif italic text-sm text-gray-800 font-bold">
                {certificate.issuedByName}
              </div>
              <p className="font-bold text-gray-900">{certificate.issuedByDesignation}</p>
              <p className="text-[10px] text-gray-500">
                {certificate.issuedByRole === "lmo"
                  ? "Legal Metrology Officer"
                  : "Authorized GATC Signatory"}
              </p>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash */}
          <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400 font-mono">
            <span>SHA-256 Hash: {certificate.sha256Hash}</span>
            <span>LMOVS SECURE DIGITAL DOC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
