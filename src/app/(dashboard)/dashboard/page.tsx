"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { useMockStore } from "@/lib/mockStore";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  ApplicationTrendsChart,
  VerificationOutcomeDonut,
  DistrictWorkloadChart,
} from "@/components/dashboard/PerformanceCharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate, formatCurrency, getDaysUntilExpiry } from "@/lib/utils";
import {
  Scale,
  FileCheck2,
  Award,
  AlertTriangle,
  Users,
  CheckCircle2,
  CalendarCheck2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  PlusCircle,
  Smartphone,
  UploadCloud,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { InstrumentRegistrationForm } from "@/components/forms/InstrumentRegistrationForm";
import { ApplicationSubmissionForm } from "@/components/forms/ApplicationSubmissionForm";
import { BulkUploadModal } from "@/components/forms/BulkUploadModal";

export default function DashboardHomePage() {
  const { currentUser } = useAuthStore();
  const { t } = useLanguageStore();
  const statsData = useMockStore((s) => s.getDashboardStats(currentUser?.role, currentUser));
  const instruments = useMockStore((s) => s.instruments);
  const certificates = useMockStore((s) => s.certificates);
  const applications = useMockStore((s) => s.applications);

  const u = currentUser ?? {
    role: "public" as const,
    fullName: "",
    email: "",
    businessName: "",
    gstin: "",
    employeeId: "",
    district: "",
    stateName: "",
  };

  const [isAddInstrumentOpen, setIsAddInstrumentOpen] = useState(false);
  const [isApplyAppOpen, setIsApplyAppOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // Business Owner View
  if (u.role === "business_owner") {
    const myInstruments = instruments.map((inst) => {
      const cert = certificates.find((c) => c.instrumentId === inst.id && c.status === "active") ||
        certificates.find((c) => c.instrumentId === inst.id);
      const app = applications.find((a) => a.instrumentId === inst.id);
      const daysInfo = cert ? getDaysUntilExpiry(cert.validUntil) : null;

      return {
        ...inst,
        cert,
        app,
        daysRemaining: daysInfo?.days ?? 0,
        isExpired: daysInfo?.isExpired ?? false,
        isDueSoon: daysInfo?.isDueSoon ?? false,
      };
    });

    const expiringSoonCount = myInstruments.filter((i) => i.isDueSoon).length;
    const totalInstrumentsCount = myInstruments.length;
    const activeCertificatesCount = myInstruments.filter((i) => i.cert && !i.isExpired).length;
    const pendingApplicationsCount = applications.filter((a) => a.status !== "completed" && a.status !== "rejected").length;

    return (
      <div className="space-y-6">
        {/* Trader Welcome & Expiry Alert Banner */}
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-800 text-blue-200 text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>{statsData?.businessName || u.businessName || "Commercial Establishment"}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Legal Metrology Compliance Dashboard
            </h1>
            <p className="text-xs text-blue-100 mt-1">
              GSTIN: <span className="font-mono font-bold text-white">{statsData?.gstin || u.gstin || "Verified Trader"}</span> • Jurisdiction: <span className="font-bold text-white">{statsData?.stateName || "State Jurisdiction"}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => setIsBulkOpen(true)}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Bulk CSV Upload
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => setIsAddInstrumentOpen(true)}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Register Instrument
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-amber-400 text-blue-950 hover:bg-amber-300 font-bold shadow-md"
              onClick={() => setIsApplyAppOpen(true)}
              leftIcon={<FileCheck2 className="w-4 h-4" />}
            >
              Apply for Verification
            </Button>
          </div>
        </div>

        {/* Rule 24 Statutory Renewal Notice Banner */}
        {expiringSoonCount > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-amber-900">
                Statutory Stamping Expiry Alert (Rule 24, Legal Metrology Rules 2011)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                You have <strong>{expiringSoonCount}</strong> weighing/measuring instrument(s) due for statutory re-verification within 30 days. Operating non-stamped instruments attracts compounding penalties under Section 25.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsApplyAppOpen(true)}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white"
            >
              Apply Re-Verification
            </Button>
          </div>
        )}

        {/* Modal Forms */}
        {isAddInstrumentOpen && (
          <InstrumentRegistrationForm
            onSuccess={() => setIsAddInstrumentOpen(false)}
            onCancel={() => setIsAddInstrumentOpen(false)}
          />
        )}

        {isApplyAppOpen && (
          <ApplicationSubmissionForm
            onSuccess={() => setIsApplyAppOpen(false)}
            onCancel={() => setIsApplyAppOpen(false)}
          />
        )}

        <BulkUploadModal
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
        />

        {/* Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Instruments"
            value={totalInstrumentsCount}
            description="Registered in business profile"
            icon={Scale}
            variant="primary"
          />
          <StatCard
            title="Active Certificates"
            value={activeCertificatesCount}
            description="Digitally stamped & valid"
            icon={Award}
            variant="success"
          />
          <StatCard
            title="Expiring in 30 Days"
            value={expiringSoonCount}
            description="Urgent re-verification needed"
            icon={AlertTriangle}
            variant="warning"
          />
          <StatCard
            title="Applications in Progress"
            value={pendingApplicationsCount}
            description="Under review / Scheduled"
            icon={FileCheck2}
            variant="neutral"
          />
        </div>

        {/* My Registered Instruments Quick List */}
        <Card className="bg-white">
          <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-gray-900">
                My Weighing & Measuring Instruments
              </CardTitle>
              <p className="text-xs text-gray-500">
                Live compliance status and digital certification records
              </p>
            </div>
            <Link href="/dashboard/instruments">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Equipment Registry ({myInstruments.length})
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Instrument & Make</th>
                    <th className="p-3">Serial No.</th>
                    <th className="p-3">Certificate Number</th>
                    <th className="p-3">Certificate Validity</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myInstruments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        <Scale className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="font-semibold text-gray-700">No instruments registered yet.</p>
                        <p className="text-xs text-gray-400 mt-0.5">Click &quot;Register Instrument&quot; above to add your first scale or measure.</p>
                      </td>
                    </tr>
                  ) : (
                    myInstruments.map((inst) => {
                      const days = inst.daysRemaining;
                      const isExpired = inst.isExpired;
                      const isDueSoon = inst.isDueSoon;
                      const cert = inst.cert;
                      const app = inst.app;

                      return (
                        <tr key={inst.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-3">
                            <strong className="text-gray-900 block">{inst.make} {inst.model}</strong>
                            <span className="text-[10px] text-gray-500">{inst.category || "Commercial Standard"} ({inst.capacity})</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-gray-700">{inst.serialNumber}</td>
                          <td className="p-3">
                            {cert ? (
                              <span className="font-mono text-[#1E3A8A] font-semibold">{cert.certificateNumber}</span>
                            ) : (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                                Unverified
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {cert ? (
                              <>
                                <span className="font-semibold block text-gray-900">{formatDate(cert.validUntil)}</span>
                                {isExpired ? (
                                  <span className="text-[10px] text-red-600 font-bold">Expired</span>
                                ) : isDueSoon ? (
                                  <span className="text-[10px] text-amber-600 font-bold">Expires in {days} days</span>
                                ) : (
                                  <span className="text-[10px] text-emerald-600 font-semibold">Valid</span>
                                )}
                              </>
                            ) : app ? (
                              <div>
                                <span className="font-medium text-blue-700 block font-mono text-[11px]">{app.applicationNumber}</span>
                                <span className="text-[10px] text-gray-500 capitalize">{app.status.replace("_", " ")}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Initial Stamping Needed</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {cert ? (
                              <Badge status={isExpired ? "expired" : isDueSoon ? "in_progress" : "active"} />
                            ) : app ? (
                              <Badge status={app.status as any} />
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[10px]">
                                Unverified
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {cert ? (
                                isDueSoon || isExpired ? (
                                  <Link href={`/dashboard/applications/new?instrumentId=${inst.id}&type=re_verification`}>
                                    <Button variant="primary" size="sm">
                                      Renew
                                    </Button>
                                  </Link>
                                ) : (
                                  <Link href={`/verify/${cert.certificateNumber}`}>
                                    <Button variant="outline" size="sm" leftIcon={<Award className="w-3.5 h-3.5" />}>
                                      Cert
                                    </Button>
                                  </Link>
                                )
                              ) : (
                                !app && (
                                  <Link href={`/dashboard/applications/new?instrumentId=${inst.id}`}>
                                    <Button variant="primary" size="sm">
                                      Verify
                                    </Button>
                                  </Link>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Legal Metrology Officer (LMO) & GATC Workspace
  if (u.role === "lmo" || u.role === "gatc") {
    const assignedTasks = statsData?.assignedTasks ?? 0;
    const visitsScheduled = statsData?.visitsScheduled ?? 0;
    const certificatesStamped = statsData?.certificatesStamped ?? 0;
    const activeGrievances = statsData?.activeGrievances ?? 0;
    const assignedQueue = statsData?.assignedQueue || [];

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{statsData?.employeeId || u.employeeId || "LMO-MH-2018-094"} • {statsData?.district || u.district || "Jurisdiction Zone"}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {u.role === "gatc" ? "GATC Verification Agency Workspace" : "Legal Metrology Officer Workspace"}
            </h1>
            <p className="text-xs text-emerald-100 mt-1">
              Field Verification, Standard Mass Calibration & Digital Stamping Unit
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/lmo/field-mode">
              <Button
                variant="primary"
                size="sm"
                className="bg-amber-400 text-emerald-950 hover:bg-amber-300 font-bold shadow-md"
                leftIcon={<Smartphone className="w-4 h-4" />}
              >
                Mobile Field Mode
              </Button>
            </Link>
            <Link href="/dashboard/lmo/verify">
              <Button
                variant="primary"
                size="sm"
                className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Conduct Verification
              </Button>
            </Link>
          </div>
        </div>

        {/* LMO Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Tasks"
            value={assignedTasks}
            description="Pending physical inspection"
            icon={FileSpreadsheet}
            variant="warning"
          />
          <StatCard
            title="Visits Scheduled"
            value={visitsScheduled}
            description="Confirmed with traders this week"
            icon={CalendarCheck2}
            variant="primary"
          />
          <StatCard
            title="Certificates Stamped"
            value={certificatesStamped}
            description="Issued in FY 2026-27"
            icon={Award}
            variant="success"
          />
          <StatCard
            title="Public Grievances"
            value={activeGrievances}
            description="Under investigation"
            icon={AlertTriangle}
            variant="danger"
          />
        </div>

        {/* Assigned Verifications Table */}
        <Card className="bg-white">
          <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-gray-900">
                Assigned Verification Queue ({statsData?.district || "Active Jurisdiction"})
              </CardTitle>
              <p className="text-xs text-gray-500">
                Applications routed for on-site inspection and statutory testing
              </p>
            </div>
            <Link href="/dashboard/lmo/applications">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All Queue ({assignedQueue.length})
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Application ID</th>
                    <th className="p-3">Trader & Establishment</th>
                    <th className="p-3">Instrument & Make</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Visit Date</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignedQueue.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                        <p className="font-semibold text-gray-700">Verification task queue is clear!</p>
                        <p className="text-[11px] text-gray-400">Newly assigned applications from State Admin will appear here.</p>
                      </td>
                    </tr>
                  ) : (
                    assignedQueue.map((app: any) => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-[#1E3A8A]">
                          {app.applicationNumber}
                        </td>
                        <td className="p-3">
                          <strong className="text-gray-900 block">{app.businessName}</strong>
                          <span className="text-[10px] text-gray-500">{app.district}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-gray-800">
                            {app.instrumentMake} {app.instrumentModel}
                          </span>
                          <span className="text-[10px] text-gray-500 block font-mono">
                            S/N: {app.instrumentSerial}
                          </span>
                        </td>
                        <td className="p-3 capitalize">{app.applicationType.replace("_", " ")}</td>
                        <td className="p-3">
                          <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {app.visitDate}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge status={app.status} />
                        </td>
                        <td className="p-3 text-right">
                          <Link href={`/dashboard/lmo/verify?applicationId=${app.id}`}>
                            <Button variant="primary" size="sm" leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}>
                              Test & Verify
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State Admin / Super Admin View
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-indigo-900 rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-800 text-blue-200 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>
              {u.role === "super_admin"
                ? "National Legal Metrology Command Center (DoCA)"
                : "State Controller Portal • Maharashtra Legal Metrology"}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            {u.role === "super_admin"
              ? "National Compliance & Verification Hub"
              : "State Metrology Operations & Allocations"}
          </h1>
          <p className="text-xs text-blue-100 mt-1">
            Real-time monitoring of verification workflows, officer allocations, and certificate issuance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/reports">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
            >
              Export Reports
            </Button>
          </Link>
          <Link href="/dashboard/master-data">
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 font-bold"
              leftIcon={<Building2 className="w-4 h-4" />}
            >
              Manage Master Data
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Units"
          value={statsData?.totalInstruments ?? 0}
          description="Weighing scales, flow meters & weights"
          icon={Scale}
          trend={{ value: "+12.4% MoM", isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Active Valid Certs"
          value={statsData?.activeCertificates ?? 0}
          description={`${statsData?.passRate ?? 98}% Compliance pass rate`}
          icon={Award}
          trend={{ value: "+3.2%", isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Pending Allocation / Review"
          value={statsData?.pendingApplications ?? 0}
          description="Awaiting LMO / GATC routing"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Active Field Officers"
          value={statsData?.activeOfficers ?? 0}
          description="State LMOs & Approved Test Centres"
          icon={Users}
          variant="neutral"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ApplicationTrendsChart />
        </div>
        <div className="lg:col-span-1">
          <VerificationOutcomeDonut />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistrictWorkloadChart />

        {/* Security Audit Log Preview */}
        <Card className="bg-white">
          <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-gray-900">
                Real-Time Security & Action Trail
              </CardTitle>
              <p className="text-xs text-gray-500">Immutable audit log (LMOVS-033)</p>
            </div>
            <Link href="/dashboard/audit-logs">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Full Audit Trail
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {(statsData?.recentAuditLogs || []).map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 text-xs p-2 rounded-lg bg-gray-50">
                <div className="w-2 h-2 rounded-full bg-[#1E3A8A] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <strong className="text-gray-900">{log.userName}</strong>
                    <span className="text-[10px] text-gray-400 font-mono">{log.ipAddress}</span>
                  </div>
                  <p className="text-gray-600 mt-0.5 line-clamp-1">
                    {log.action} on {log.entityType}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
