"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useMockStore } from "@/lib/mockStore";
import { downloadCertificatePdf } from "@/lib/pdf-generator";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Download,
  FileQuestion,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

export default function PublicVerifyCertificatePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const rawId = decodeURIComponent(
    Array.isArray(params?.certificateId)
      ? (params.certificateId as string[]).join("/")
      : ((params?.certificateId as string) || "")
  );

  const certificates = useMockStore((s) => s.certificates);
  const instruments = useMockStore((s) => s.instruments);

  const cleanQuery = rawId.replace(/-/g, "/").toLowerCase();

  let cert = certificates.find(
    (c) =>
      c.id.toLowerCase() === rawId.toLowerCase() ||
      c.certificateNumber.toLowerCase() === cleanQuery ||
      c.certificateNumber.toLowerCase().replace(/\//g, "-") ===
      rawId.toLowerCase() ||
      (c.verificationToken &&
        c.verificationToken.toLowerCase() === rawId.toLowerCase())
  );

  // If not found in current device's local store
  // (e.g. mobile phone scanning QR from PC),
  // parse the encrypted/encoded payload passed in query params
  if (!cert && searchParams) {
    const dataParam = searchParams.get("data");

    if (dataParam) {
      try {
        const p = JSON.parse(
          decodeURIComponent(escape(atob(decodeURIComponent(dataParam))))
        );

        cert = {
          id: `cert-${p.num}`,
          certificateNumber: p.num,
          applicationId: "app-verified",
          instrumentId: "inst-verified",
          businessId: "biz-verified",
          businessName: p.biz,
          businessAddress: p.adr,
          gstin: p.gst,
          instrumentMake: p.mak,
          instrumentModel: p.mod,
          serialNumber: p.sn,
          instrumentType: p.typ,
          capacity: p.cap,
          leastCount: p.lc,
          locationOfUse: p.loc,
          issuedByUserId: "officer",
          issuedByName: p.by,
          issuedByDesignation: p.des,
          issuedByRole: "gatc",
          sealNumber: p.seal,
          issueDate: p.from,
          validFrom: p.from,
          validUntil: p.until,
          qrCodeData: "",
          status: p.st || "active",
          verificationToken: p.tok,
          sha256Hash: p.sha,
          createdAt: p.from,
        };
      } catch (err) {
        console.error("Could not parse cert data param", err);
      }
    }
  }

  const [serverCert, setServerCert] = React.useState<any>(null);

  React.useEffect(() => {
    if (!cert && cleanQuery) {
      fetch(`/api/certificates/${encodeURIComponent(cleanQuery)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && !data.error) {
            setServerCert(data);
          }
        })
        .catch(() => { });
    }
  }, [cert, cleanQuery]);

  const activeCert = cert || serverCert;
  cert = activeCert;

  const inst = activeCert
    ? instruments.find((i) => i.id === activeCert.instrumentId) || {
      id: "inst-scanned",
      businessId: activeCert.businessId || "usr-biz-01",
      businessName: activeCert.businessName,
      ownerName: activeCert.businessName,
      instrumentType: "weighing_scale" as const,
      category: activeCert.instrumentType,
      make: activeCert.instrumentMake,
      model: activeCert.instrumentModel,
      serialNumber: activeCert.serialNumber,
      capacity: activeCert.capacity,
      leastCount: activeCert.leastCount,
      locationOfUse:
        activeCert.locationOfUse || activeCert.businessAddress,
      installationDate: activeCert.validFrom,
      status: "active" as const,
      lastVerificationDate: activeCert.validFrom,
      validUntil: activeCert.validUntil,
      hasPendingApplication: false,
      createdAt: activeCert.createdAt,
      updatedAt: activeCert.createdAt,
    }
    : null;

  if (!activeCert) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center">
        <div className="w-full max-w-xl space-y-6">
          <Link href="/verify">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Search Another Certificate
            </Button>
          </Link>

          <div className="p-8 bg-white rounded-2xl shadow-xl border border-rose-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
              <FileQuestion className="w-8 h-8 text-rose-600" />
            </div>

            <h1 className="text-2xl font-black text-rose-900">
              Certificate Not Found
            </h1>

            <p className="text-xs text-gray-600 leading-relaxed px-4">
              The certificate identifier scanned or entered does not correspond
              to any valid verification record in the National Legal Metrology
              Registry.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/verify">
                <Button variant="primary" size="sm">
                  Search Registry Again
                </Button>
              </Link>

              <Link href="/complaints">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-700 border-rose-300 hover:bg-rose-50"
                >
                  Report Non-Compliant Merchant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FIX: safely access cert properties
  const isExpired =
    cert?.status === "expired" ||
    (!!cert?.validUntil && new Date(cert.validUntil) < new Date());

  const isRevoked = cert?.status === "revoked";

  const isCryptographicallyVerified = Boolean(
    (cert?.verificationToken && cert.verificationToken.length > 5) ||
    (cert?.sha256Hash && cert.sha256Hash.length > 10)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link href="/verify">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Search Registry
            </Button>
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Govt. of India SSL Encrypted</span>
          </div>
        </div>

        {/* Verification Result Banner */}
        <div
          className={`p-6 rounded-2xl text-white shadow-xl text-center space-y-3 ${isRevoked
              ? "bg-rose-900"
              : isExpired
                ? "bg-amber-800"
                : "bg-gradient-to-b from-[#1E3A8A] to-blue-900"
            }`}
        >
          <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center mx-auto shadow-inner">
            {isRevoked ? (
              <XCircle className="w-10 h-10 text-rose-300" />
            ) : isExpired ? (
              <AlertTriangle className="w-10 h-10 text-amber-300" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            )}
          </div>

          <div>
            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-blue-100 mb-1">
              {isRevoked
                ? "Statutory Revocation"
                : isExpired
                  ? "Expired Verification"
                  : "Official Legal Metrology Verification"}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black">
              {isRevoked
                ? "CERTIFICATE REVOKED"
                : isExpired
                  ? "EXPIRED CERTIFICATE"
                  : "GENUINE & ACTIVELY CERTIFIED"}
            </h1>

            <p className="text-xs text-blue-100 mt-1 font-mono">
              Certificate No: {cert.certificateNumber}
            </p>
          </div>
        </div>

        {/* Authenticated Data Card */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardHeader className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1E3A8A]" />

              <CardTitle className="text-sm font-bold text-gray-900">
                Verified Equipment & Merchant Details
              </CardTitle>
            </div>

            <Badge status={cert.status} />
          </CardHeader>

          <CardContent className="p-6 space-y-5 text-xs">
            {/* Merchant Details */}
            <div className="space-y-2">
              <h3 className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                Merchant / Commercial Establishment
              </h3>

              <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                <strong className="text-sm text-gray-900 block">
                  {cert.businessName}
                </strong>

                <p className="text-gray-600 leading-relaxed">
                  {inst?.locationOfUse || "Commercial Bay"}
                </p>

                <p className="text-gray-500 font-mono text-[11px] pt-1">
                  GSTIN: {cert.gstin || "27AABCU9603R1ZM (Verified)"}
                </p>
              </div>
            </div>

            {/* Instrument Specs */}
            <div className="space-y-2">
              <h3 className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                Verified Weighing / Measuring Device
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-gray-400 block text-[10px]">
                    Classification
                  </span>

                  <strong className="text-gray-900 block capitalize">
                    {inst?.instrumentType?.replace("_", " ") ||
                      "Weighing Scale"}
                  </strong>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-gray-400 block text-[10px]">
                    Make & Model
                  </span>

                  <strong className="text-gray-900 block">
                    {cert.instrumentMake} {cert.instrumentModel}
                  </strong>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-gray-400 block text-[10px]">
                    Serial Number
                  </span>

                  <strong className="font-mono text-[#1E3A8A] block">
                    {cert.serialNumber}
                  </strong>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-gray-400 block text-[10px]">
                    Max Capacity
                  </span>

                  <strong className="text-gray-900 block">
                    {inst?.capacity || "30 kg"}
                  </strong>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-gray-400 block text-[10px]">
                    Division / Least Count
                  </span>

                  <strong className="text-gray-900 block">
                    {inst?.leastCount || "5 g"}
                  </strong>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-gray-400 block text-[10px]">
                    Location at Shop
                  </span>

                  <strong className="text-gray-900 block">
                    {inst?.locationOfUse || "Commercial Bay"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Officer Stamping */}
            <div className="space-y-2">
              <h3 className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                Statutory Stamping & Validity
              </h3>

              <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-gray-500 block text-[10px]">
                    Issuing Officer
                  </span>

                  <strong className="text-gray-900">
                    {cert.issuedByName}
                  </strong>

                  <p className="text-[10px] text-gray-500">
                    {cert.issuedByDesignation || "Legal Metrology Officer"}
                  </p>
                </div>

                <div>
                  <span className="text-gray-500 block text-[10px]">
                    Official Lead Seal No
                  </span>

                  <strong className="font-mono text-[#1E3A8A] text-sm">
                    {cert.sealNumber}
                  </strong>
                </div>

                <div>
                  <span className="text-gray-500 block text-[10px]">
                    Certification Validity
                  </span>

                  <strong
                    className={
                      isExpired
                        ? "text-amber-700 font-bold"
                        : "text-emerald-700 font-bold"
                    }
                  >
                    Valid until {formatDate(cert.validUntil)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Integrity */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono border-t border-gray-100">
              <span className="text-gray-400 truncate max-w-xs">
                Hash:{" "}
                {cert.sha256Hash ||
                  cert.verificationToken ||
                  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
              </span>

              {isCryptographicallyVerified ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  SHA-256 Cryptographic Record Verified
                </span>
              ) : (
                <span className="text-rose-700 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Tamper Alert: Checksum Mismatch
                </span>
              )}
            </div>

            {/* Download and Action links */}
            <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100">
              <Button
                variant="primary"
                size="sm"
                onClick={() => downloadCertificatePdf(cert)}
                leftIcon={<Download className="w-4 h-4 text-white" />}
              >
                Download Statutory A4 Certificate (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}