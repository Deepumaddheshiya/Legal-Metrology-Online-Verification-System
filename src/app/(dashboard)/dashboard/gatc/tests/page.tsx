"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useMockStore } from "@/lib/mockStore";
import {
  ShieldCheck,
  FlaskConical,
  FileCheck2,
  Award,
  CheckCircle2,
  Search,
  Scale,
  Building2,
} from "lucide-react";
import Link from "next/link";

export default function GatcTestsPage() {
  const { currentUser } = useAuthStore();
  const applications = useMockStore((s) => s.applications);
  const instruments = useMockStore((s) => s.instruments);
  const certificates = useMockStore((s) => s.certificates);

  const [lastTest, setLastTest] = useState<string | null>("28 Aug 2026, 09:30 AM");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const runCalibrationCheck = () => {
    setLastTest(new Date().toLocaleString());
  };

  const enrichedApps = applications.map((a) => {
    const inst = instruments.find((i) => i.id === a.instrumentId) || a.instrument;
    const cert = certificates.find((c) => c.applicationId === a.id);
    return {
      ...a,
      instrument: inst,
      certificate: cert,
    };
  });

  const filtered = enrichedApps.filter((a) => {
    const term = search.toLowerCase();
    const matchesSearch =
      a.applicationNumber.toLowerCase().includes(term) ||
      a.businessName?.toLowerCase().includes(term) ||
      a.instrument?.make?.toLowerCase().includes(term) ||
      a.instrument?.model?.toLowerCase().includes(term) ||
      a.instrument?.serialNumber?.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeQueueCount = applications.filter((a) =>
    ["assigned", "scheduled", "in_progress", "submitted"].includes(a.status)
  ).length;

  const inCalibrationCount = applications.filter((a) =>
    ["in_progress", "scheduled"].includes(a.status)
  ).length;

  const stampedCount = applications.filter((a) => a.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-[#1E3A8A]" />
            <span>Testing &amp; Calibration Laboratory Workspace</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Government Approved Test Centre (GATC) workspace for specialized metrological verification, calibration, and statutory digital stamping.
          </p>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Verifications"
          value={activeQueueCount}
          description="Inbound laboratory calibration queue"
          icon={FileCheck2}
          variant="primary"
        />
        <StatCard
          title="In Testing / Calibration"
          value={inCalibrationCount}
          description="Under active Schedule VI test"
          icon={FlaskConical}
          variant="warning"
        />
        <StatCard
          title="Certificates Stamped"
          value={stampedCount}
          description="Authorized GATC Form 7 certificates issued"
          icon={Award}
          variant="success"
        />
      </div>

      {/* Calibration Standard Check Card */}
      <Card className="bg-white border-blue-200 shadow-sm">
        <CardHeader className="p-4 border-b border-gray-100 bg-blue-50/50">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1E3A8A]">
            <ShieldCheck className="w-4 h-4 text-[#1E3A8A]" />
            <span>NABL Reference Standard Readiness Check</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            Before executing legal stamping or verification testing, confirm the laboratory&apos;s working standard weights and reference instruments are verified and within Maximum Permissible Error (MPE) tolerances under the <em>Legal Metrology (General) Rules, 2011</em>.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button variant="primary" size="sm" onClick={runCalibrationCheck} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Run Reference Standard Check
            </Button>
            {lastTest && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Standards Verified &amp; Compliant: {lastTest}
              </span>
            )}
          </div>
          <div className="text-[11px] text-gray-500 flex items-center gap-2 pt-1">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <span>
              Accredited Laboratory: <strong>{currentUser?.fullName || "National Metrology Calibration Centre"}</strong> (NABL Accredited GATC Lab)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter Bar */}
      <Card className="bg-white p-4 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by Tracking ID, Make, Model, Serial Number, or Business Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div className="sm:col-span-4">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Verification Statuses</option>
              <option value="submitted">Submitted (Awaiting Test)</option>
              <option value="assigned">Assigned to Lab</option>
              <option value="scheduled">Scheduled for Calibration</option>
              <option value="in_progress">In Calibration Testing</option>
              <option value="completed">Completed &amp; Certified</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Assigned Verifications Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#1E3A8A]" />
              <span>Assigned Verifications &amp; Calibration Pipeline</span>
            </CardTitle>
            <p className="text-xs text-gray-500">
              Instruments routed to this test centre for Schedule VI verification and digital stamping.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            {filtered.length} {filtered.length === 1 ? "record" : "records"} found
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Scale className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-700">No verifications in this view</p>
              <p className="text-xs text-gray-400 mt-1">
                {search || statusFilter !== "all"
                  ? "Try adjusting your search query or status filter."
                  : "New verification tasks assigned by the State Controller will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Tracking Number</th>
                    <th className="p-3.5">Commercial Establishment</th>
                    <th className="p-3.5">Instrument Specifications</th>
                    <th className="p-3.5">Verification Type &amp; Fee</th>
                    <th className="p-3.5">Allocation Date</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#1E3A8A]">
                            {a.applicationNumber}
                          </span>
                          {a.priority === "urgent" && (
                            <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold text-[9px]">
                              URGENT
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 block font-mono">
                          ID: #{a.id.slice(0, 8)}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <strong className="text-gray-900 block">{a.businessName}</strong>
                        <span className="text-[10px] text-gray-500">
                          {a.district || "Mumbai Suburban"}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-gray-800 block">
                          {a.instrument?.make} {a.instrument?.model}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          SN: {a.instrument?.serialNumber} ({a.instrument?.capacity})
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="block font-medium capitalize">
                          {a.applicationType.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          {formatCurrency(a.feeAmount)} (Paid)
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="text-gray-700 font-medium block">
                          {formatDate(a.submittedAt || a.createdAt)}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <Badge status={a.status as any} />
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {a.status !== "completed" ? (
                            <Link href={`/dashboard/lmo/verify?applicationId=${a.id}`}>
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<FlaskConical className="w-3.5 h-3.5" />}
                              >
                                Conduct Test
                              </Button>
                            </Link>
                          ) : (
                            a.certificate && (
                              <Link href={`/verify/${a.certificate.certificateNumber}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  leftIcon={<Award className="w-3.5 h-3.5 text-emerald-600" />}
                                >
                                  View Certificate
                                </Button>
                              </Link>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
