"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Scale, Award, FileSpreadsheet, Building2, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useMockStore } from "@/lib/mockStore";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim();

  const globalSearch = useMockStore((s) => s.globalSearch);
  const results = globalSearch(query);
  const totalMatches =
    results.certificates.length +
    results.instruments.length +
    results.applications.length +
    results.businesses.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Search className="w-6 h-6 text-[#1E3A8A]" />
          <span>Universal Metrology Search</span>
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Showing <strong className="text-gray-900">{totalMatches}</strong> live matches for query:{" "}
          <strong className="text-[#1E3A8A] font-mono">"{query}"</strong>
        </p>
      </div>

      {totalMatches === 0 ? (
        <Card className="bg-white p-12 text-center text-gray-500">
          <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-800">No matching records found for "{query}"</p>
          <p className="text-xs text-gray-400 mt-1">Try searching by Certificate Number, Equipment Serial Number, GSTIN, or Business Name.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Certificates Matches */}
          {results.certificates.length > 0 && (
            <Card className="bg-white">
              <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <CardTitle className="text-sm font-bold text-gray-900">
                    Verification Certificates ({results.certificates.length})
                  </CardTitle>
                </div>
                <Link href="/dashboard/certificates">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Certificates Hub
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {results.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3 rounded-lg border border-gray-200 flex items-center justify-between hover:bg-gray-50 text-xs"
                  >
                    <div>
                      <strong className="text-gray-900 font-mono text-sm block">
                        {cert.certificateNumber}
                      </strong>
                      <span className="text-gray-500">
                        {cert.businessName} • {cert.instrumentMake} {cert.instrumentModel} (S/N: {cert.serialNumber}) • Valid: {cert.validUntil}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={cert.status} />
                      <Link href={`/verify/${encodeURIComponent(cert.certificateNumber)}`}>
                        <Button variant="outline" size="sm">
                          Verify
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Instruments Matches */}
          {results.instruments.length > 0 && (
            <Card className="bg-white">
              <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#1E3A8A]" />
                  <CardTitle className="text-sm font-bold text-gray-900">
                    Weighing & Measuring Instruments ({results.instruments.length})
                  </CardTitle>
                </div>
                <Link href="/dashboard/instruments">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Equipment Registry
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {results.instruments.map((inst) => (
                  <div
                    key={inst.id}
                    className="p-3 rounded-lg border border-gray-200 flex items-center justify-between hover:bg-gray-50 text-xs"
                  >
                    <div>
                      <strong className="text-gray-900 block">
                        {inst.make} {inst.model}
                      </strong>
                      <span className="text-gray-500 font-mono">
                        S/N: {inst.serialNumber} • Capacity: {inst.capacity} • {inst.businessName} ({inst.locationOfUse})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={inst.status} />
                      <Link href={`/dashboard/instruments/${inst.id}`}>
                        <Button variant="outline" size="sm">
                          View Specs
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Applications Matches */}
          {results.applications.length > 0 && (
            <Card className="bg-white">
              <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                  <CardTitle className="text-sm font-bold text-gray-900">
                    Verification Applications ({results.applications.length})
                  </CardTitle>
                </div>
                <Link href="/dashboard/applications">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Applications Portal
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {results.applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-lg border border-gray-200 flex items-center justify-between hover:bg-gray-50 text-xs"
                  >
                    <div>
                      <strong className="text-purple-900 font-mono text-sm block">
                        {app.applicationNumber}
                      </strong>
                      <span className="text-gray-500">
                        {app.businessName} • Submitted: {app.submittedAt}
                      </span>
                    </div>
                    <Badge status={app.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Businesses Matches */}
          {results.businesses.length > 0 && (
            <Card className="bg-white">
              <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <CardTitle className="text-sm font-bold text-gray-900">
                    Merchants & Registered Establishments ({results.businesses.length})
                  </CardTitle>
                </div>
                <Link href="/dashboard/master-data">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Establishments
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {results.businesses.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-lg border border-gray-200 flex items-center justify-between hover:bg-gray-50 text-xs"
                  >
                    <div>
                      <strong className="text-gray-900 font-bold block">{b.businessName}</strong>
                      <span className="text-gray-500 font-mono">
                        GSTIN: {b.gstin} • {b.district} ({b.stateName})
                      </span>
                    </div>
                    <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded capitalize font-semibold">
                      {b.role}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function GlobalSearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}
