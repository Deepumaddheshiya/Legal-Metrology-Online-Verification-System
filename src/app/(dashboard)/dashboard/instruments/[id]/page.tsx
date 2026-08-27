"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate, getDaysUntilExpiry } from "@/lib/utils";
import { useMockStore } from "@/lib/mockStore";
import {
  Scale,
  ArrowLeft,
  Award,
  FileCheck2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  AlertTriangle,
  QrCode,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function InstrumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const instruments = useMockStore((s) => s.instruments);
  const certificates = useMockStore((s) => s.certificates);
  const applications = useMockStore((s) => s.applications);

  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  const inst = instruments.find((i) => i.id === id);

  if (!inst) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.push("/dashboard/instruments")}
        >
          Back to Instruments
        </Button>
        <Card className="p-8 text-center bg-white border-red-200">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-gray-900">Instrument Unavailable</h3>
          <p className="text-xs text-gray-500 mt-1">Could not retrieve the requested record.</p>
        </Card>
      </div>
    );
  }

  const cert = certificates.find((c) => c.instrumentId === inst.id && c.status === "active") ||
    certificates.find((c) => c.instrumentId === inst.id);
  const instApps = applications.filter((a) => a.instrumentId === inst.id);
  const latestApp = instApps[0];

  const { isDueSoon, isExpired, days } = cert
    ? getDaysUntilExpiry(cert.validUntil)
    : { isDueSoon: false, isExpired: false, days: 0 };

  const isUnderVerification =
    latestApp && ["submitted", "assigned", "scheduled", "in_progress"].includes(latestApp.status);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.push("/dashboard/instruments")}
        >
          Back to Repository
        </Button>

        <div className="flex items-center gap-3">
          {isUnderVerification ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-[#1E3A8A] border border-blue-200">
              Verification In Progress
            </span>
          ) : isExpired ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Expired ({Math.abs(days)}d ago)
            </span>
          ) : isDueSoon ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Renewal Due in {days} Days
            </span>
          ) : cert ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active & Verified
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-600 border border-gray-200">
              Unverified
            </span>
          )}

          <Link href={`/dashboard/applications/new?instrumentId=${inst.id}`}>
            <Button variant="primary" size="sm" leftIcon={<FileCheck2 className="w-4 h-4" />}>
              {cert ? "Apply for Re-Verification" : "Apply for Verification"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Technical Specifications & Photo */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-[#1E3A8A] text-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg font-bold">
                    {inst.make} {inst.model}
                  </CardTitle>
                  <p className="text-blue-100 text-xs mt-0.5">{inst.category}</p>
                </div>
                <span className="font-mono bg-blue-800 text-blue-100 text-xs px-3 py-1 rounded font-bold border border-blue-700">
                  SN: {inst.serialNumber}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Technical Specifications (Schedule VI)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-500 block text-[11px]">Classification</span>
                    <strong className="text-gray-900 capitalize">
                      {inst.instrumentType.replace("_", " ")}
                    </strong>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-500 block text-[11px]">Maximum Capacity</span>
                    <strong className="text-gray-900">{inst.capacity}</strong>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-500 block text-[11px]">Least Count / Division (e)</span>
                    <strong className="text-gray-900">{inst.leastCount}</strong>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-500 block text-[11px]">Installation Date</span>
                    <strong className="text-gray-900">
                      {inst.installationDate ? formatDate(inst.installationDate) : "N/A"}
                    </strong>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 sm:col-span-2">
                    <span className="text-gray-500 block text-[11px]">Location of Use</span>
                    <strong className="text-gray-900">{inst.locationOfUse}</strong>
                  </div>
                </div>
              </div>

              {/* Commercial Establishment Card */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#1E3A8A] font-bold">
                  <Building2 className="w-4 h-4" />
                  <span>Registered Establishment</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Business Name:</span>
                    <strong>{inst.businessName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Owner / Representative:</span>
                    <span className="font-semibold">{inst.ownerName}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 block text-[10px]">Premises Location:</span>
                    <span>{inst.locationOfUse}</span>
                  </div>
                </div>
              </div>

              {/* Photo & Image Gallery */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Instrument Image & Physical Stamping Plate
                </h4>
                <div
                  onClick={() => setIsPhotoZoomed(!isPhotoZoomed)}
                  className="relative h-56 sm:h-72 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer group"
                >
                  <img
                    src={
                      inst.photoUrl ||
                      "/instruments/counter-scale.jpg"
                    }
                    alt={inst.model}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <Eye className="w-4 h-4" /> Click to Zoom
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Certificate & Lifecycle History */}
        <div className="space-y-6">
          {/* Active Certificate Card */}
          <Card className="bg-white border-emerald-200 shadow-sm overflow-hidden">
            <CardHeader className="p-4 border-b border-gray-100 bg-emerald-50/70">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <CardTitle className="text-xs font-bold text-gray-900">
                    Active Verification Certificate
                  </CardTitle>
                  <p className="text-[10px] text-gray-500 font-mono">
                    {cert ? cert.certificateNumber : "No Active Certificate"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {cert ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Issued Officer:</span>
                    <strong className="text-gray-900">{cert.issuedByName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Seal / Stamp No.:</span>
                    <span className="font-mono font-bold text-[#1E3A8A]">{cert.sealNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Valid From:</span>
                    <span className="text-gray-900 font-medium">{formatDate(cert.validFrom)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Valid Until:</span>
                    <strong className={isExpired ? "text-red-600 font-bold" : "text-emerald-700 font-bold"}>
                      {formatDate(cert.validUntil)}
                    </strong>
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <Link href={`/verify/${cert.certificateNumber}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        leftIcon={<QrCode className="w-3.5 h-3.5 text-[#1E3A8A]" />}
                      >
                        Public QR Verification Page
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500 space-y-2">
                  <p className="text-xs">This instrument has not been stamped yet.</p>
                  <Link href={`/dashboard/applications/new?instrumentId=${inst.id}`}>
                    <Button variant="primary" size="sm" className="w-full">
                      Submit Initial Verification Request
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification & Lifecycle Timeline */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="p-4 border-b border-gray-100">
              <CardTitle className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#1E3A8A]" />
                <span>Verification & Stamping Lifecycle</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-gray-200">
                {/* 1. Registration Event */}
                <div className="relative flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold z-10 text-[10px]">
                    1
                  </div>
                  <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-mono block">
                      {formatDate(inst.createdAt)}
                    </span>
                    <strong className="text-gray-900 block mt-0.5">Instrument Registered</strong>
                    <p className="text-[11px] text-gray-500">Added to business repository.</p>
                  </div>
                </div>

                {/* 2. Application Events */}
                {instApps.map((app, idx) => (
                  <div key={app.id} className="relative flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold z-10 text-[10px]">
                      {idx + 2}
                    </div>
                    <div className="flex-1 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-amber-800 font-mono font-bold">
                          {app.applicationNumber}
                        </span>
                        <span className="text-[10px] capitalize px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                          {app.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-700 mt-1">
                        Fee: ₹{app.feeAmount} ({app.feePaid ? "Paid" : "Unpaid"})
                      </p>
                      {app.assignedToName && (
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Assigned Officer: <strong className="text-gray-800">{app.assignedToName}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* 3. Certificate Milestone */}
                {cert && (
                  <div className="relative flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold z-10 text-[10px]">
                      ✓
                    </div>
                    <div className="flex-1 bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-emerald-800 font-mono font-bold block">
                        {cert.certificateNumber}
                      </span>
                      <strong className="text-gray-900 block mt-0.5">Verification Certificate Issued</strong>
                      <p className="text-[11px] text-gray-600">Valid until {formatDate(cert.validUntil)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
