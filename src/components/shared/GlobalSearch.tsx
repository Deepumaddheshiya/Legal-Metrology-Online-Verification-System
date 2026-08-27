"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Award, Scale, FileSpreadsheet, Building2, X, Loader2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMockStore } from "@/lib/mockStore";

export function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const searchAll = useMockStore((s) => s.searchAll);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    certificates: any[];
    instruments: any[];
    applications: any[];
    businesses: any[];
  } | null>(null);
  const [totalMatches, setTotalMatches] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults(null);
      setTotalMatches(0);
      return;
    }

    const res = searchAll(query.trim());
    const formattedCerts = res.certificates.map((c) => ({
      ...c,
      href: `/dashboard/certificates`,
      instrument: `${c.instrumentMake} ${c.instrumentModel}`,
    }));
    const formattedInsts = res.instruments.map((i) => ({
      ...i,
      href: `/dashboard/instruments/${i.id}`,
    }));
    const formattedApps = res.applications.map((a) => ({
      ...a,
      href: `/dashboard/applications`,
      instrument: a.instrument ? `${a.instrument.make} ${a.instrument.model}` : "Instrument",
    }));
    const formattedUsers = res.users.filter((u) => u.role === "business_owner").map((u) => ({
      ...u,
      href: `/dashboard/state-admin/approvals`,
    }));

    const total = formattedCerts.length + formattedInsts.length + formattedApps.length + formattedUsers.length;
    setResults({
      certificates: formattedCerts,
      instruments: formattedInsts,
      applications: formattedApps,
      businesses: formattedUsers,
    });
    setTotalMatches(total);
  }, [query, searchAll]);

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleViewAll = () => {
    onClose();
    router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-3 border-b border-gray-200 flex items-center gap-3 bg-gray-50/50">
          <Search className="w-5 h-5 text-[#1E3A8A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Certificates, Instruments, Applications, GSTIN, or Merchants..."
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {!query || query.length < 2 ? (
            <div className="py-12 text-center text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="font-semibold text-gray-700">Universal Legal Metrology Search</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Type at least 2 characters to search certificates, serial numbers, applications, or merchants.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400">
                <span className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200">MH/2026/WS</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200">SN-</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200">27AABCA</span>
              </div>
            </div>
          ) : results && totalMatches === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p className="font-semibold text-gray-700">No records found matching "{query}"</p>
              <p className="text-[11px] text-gray-400 mt-1">Check spelling or search by serial number or certificate token.</p>
            </div>
          ) : results ? (
            <>
              {/* Certificates Group */}
              {results.certificates.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" /> Certificates ({results.certificates.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        onClick={() => handleSelect(cert.href)}
                        className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-blue-50/60 hover:border-blue-200 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#1E3A8A]">{cert.certificateNumber}</span>
                            <Badge status={cert.status} />
                          </div>
                          <p className="text-gray-600 mt-0.5">
                            {cert.businessName} • {cert.instrument} (S/N: {cert.serialNumber})
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">Valid: {cert.validUntil}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instruments Group */}
              {results.instruments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#1E3A8A]" /> Instruments ({results.instruments.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.instruments.map((inst) => (
                      <div
                        key={inst.id}
                        onClick={() => handleSelect(inst.href)}
                        className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-blue-50/60 hover:border-blue-200 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-gray-900">{inst.make} {inst.model}</span>
                          <p className="text-gray-500 font-mono text-[11px]">
                            S/N: {inst.serialNumber} • Capacity: {inst.capacity} • {inst.businessName}
                          </p>
                        </div>
                        <Badge status={inst.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applications Group */}
              {results.applications.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                    <span className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" /> Applications ({results.applications.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.applications.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => handleSelect(app.href)}
                        className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-blue-50/60 hover:border-blue-200 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="font-mono font-bold text-purple-800">{app.applicationNumber}</span>
                          <p className="text-gray-600 mt-0.5">
                            {app.businessName} • {app.instrument}
                          </p>
                        </div>
                        <Badge status={app.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Businesses Group */}
              {results.businesses.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" /> Merchants & Establishments ({results.businesses.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.businesses.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleSelect(b.href)}
                        className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-blue-50/60 hover:border-blue-200 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="font-bold text-gray-900">{b.businessName || b.fullName}</span>
                          <p className="text-gray-500 font-mono text-[11px]">
                            GSTIN: {b.gstin} • {b.district}, {b.stateName}
                          </p>
                        </div>
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        {results && totalMatches > 0 && (
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
            <span>Found {totalMatches} matching items</span>
            <button
              onClick={handleViewAll}
              className="font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
            >
              View Full Search Page <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
