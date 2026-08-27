"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useMockStore } from "@/lib/mockStore";
import {
  FileSpreadsheet,
  Search,
  PlusCircle,
  Award,
  CheckCircle2,
  Eye,
  XCircle,
  User,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function ApplicationsPage() {
  const { currentUser } = useAuthStore();
  const applications = useMockStore((s) => s.applications);
  const instruments = useMockStore((s) => s.instruments);
  const certificates = useMockStore((s) => s.certificates);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const enrichedApplications = applications.map((app) => {
    const inst = instruments.find((i) => i.id === app.instrumentId) || app.instrument;
    const cert = certificates.find((c) => c.applicationId === app.id);
    return {
      ...app,
      instrument: inst,
      certificate: cert,
    };
  });

  const filtered = enrichedApplications.filter((app) => {
    const matchesSearch =
      app.applicationNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      app.instrument?.make?.toLowerCase().includes(search.toLowerCase()) ||
      app.instrument?.model?.toLowerCase().includes(search.toLowerCase()) ||
      app.instrument?.serialNumber?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesType = typeFilter === "all" || app.applicationType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStepStatus = (
    stepIdx: number,
    appStatus: string
  ): "completed" | "current" | "pending" | "failed" => {
    if (appStatus === "rejected") {
      return stepIdx === 4 ? "failed" : "completed";
    }

    const statusMap: Record<string, number> = {
      submitted: 0,
      assigned: 1,
      scheduled: 2,
      in_progress: 3,
      completed: 4,
      rejected: 4,
    };

    const currentIdx = statusMap[appStatus] ?? 0;
    if (stepIdx < currentIdx) return "completed";
    if (stepIdx === currentIdx) return "current";
    return "pending";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#1E3A8A]" />
            <span>Verification Applications Management</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track verification workflows, allocation to Legal Metrology Officers, and real-time inspection milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.role === "business_owner" && (
            <Link href="/dashboard/applications/new">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                New Verification
              </Button>
            </Link>
          )}
          {(currentUser?.role === "state_admin" || currentUser?.role === "super_admin") && (
            <Link href="/dashboard/state-admin/applications">
              <Button variant="primary" size="sm" leftIcon={<User className="w-4 h-4" />}>
                Allocate Officers Portal
              </Button>
            </Link>
          )}
          {currentUser?.role === "lmo" && (
            <Link href="/dashboard/lmo/applications">
              <Button variant="primary" size="sm" leftIcon={<User className="w-4 h-4" />}>
                Verifier Tasks Inbox (Accept & Schedule)
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-white p-4 border border-gray-200">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Total Applications</span>
          <p className="text-2xl font-black text-gray-900 mt-0.5">{applications.length}</p>
        </Card>
        <Card className="bg-white p-4 border border-blue-200">
          <span className="text-[11px] font-bold text-blue-700 uppercase">In Progress / Active</span>
          <p className="text-2xl font-black text-[#1E3A8A] mt-0.5">
            {applications.filter((a) => ["submitted", "assigned", "scheduled", "in_progress"].includes(a.status)).length}
          </p>
        </Card>
        <Card className="bg-white p-4 border border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Certificates Issued</span>
          <p className="text-2xl font-black text-emerald-600 mt-0.5">
            {applications.filter((a) => a.status === "completed").length}
          </p>
        </Card>
        <Card className="bg-white p-4 border border-red-200">
          <span className="text-[11px] font-bold text-red-700 uppercase">Rejected / Non-Compliant</span>
          <p className="text-2xl font-black text-red-600 mt-0.5">
            {applications.filter((a) => a.status === "rejected").length}
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-white p-4 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by Tracking ID, Make, Model, Serial, or Business Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div className="sm:col-span-3">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Application Statuses</option>
              <option value="submitted">Submitted (Awaiting Assignment)</option>
              <option value="assigned">Assigned to Officer</option>
              <option value="scheduled">Scheduled for Visit</option>
              <option value="in_progress">In Progress (Field Testing)</option>
              <option value="completed">Completed & Certified</option>
              <option value="rejected">Rejected / Failed</option>
            </Select>
          </div>
          <div className="sm:col-span-3">
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Verification Types</option>
              <option value="re_verification">Annual Re-Verification</option>
              <option value="new_verification">Initial Verification (New)</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-700">No verification applications found</p>
              <p className="text-xs text-gray-500 mt-1">
                {search || statusFilter !== "all"
                  ? "Try clearing your filters or search keywords."
                  : "Submit a new verification application to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Tracking Number</th>
                    <th className="p-3.5">Establishment</th>
                    <th className="p-3.5">Instrument Specifications</th>
                    <th className="p-3.5">Type & Fee</th>
                    <th className="p-3.5">Assigned Officer</th>
                    <th className="p-3.5">Submission Date</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#1E3A8A]">
                            {app.applicationNumber}
                          </span>
                          {app.priority === "urgent" && (
                            <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold text-[9px]">
                              URGENT
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 block">
                          Ref: #{app.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <strong className="text-gray-900 block">{app.businessName}</strong>
                        <span className="text-[10px] text-gray-500">
                          {app.district || "Mumbai Suburban"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-gray-800 block">
                          {app.instrument?.make} {app.instrument?.model}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          SN: {app.instrument?.serialNumber} ({app.instrument?.capacity})
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="block font-medium capitalize">
                          {app.applicationType.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          {formatCurrency(app.feeAmount)} (Paid)
                        </span>
                      </td>
                      <td className="p-3.5">
                        {app.assignedToName ? (
                          <div>
                            <strong className="text-gray-900 block flex items-center gap-1">
                              <User className="w-3 h-3 text-[#1E3A8A]" />
                              {app.assignedToName}
                            </strong>
                            <span className="text-[10px] text-gray-500">
                              {app.assignedToType?.toUpperCase() || "LMO"} Officer
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-medium italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Awaiting Allocation
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="text-gray-700 block font-medium">
                          {formatDate(app.submittedAt || app.createdAt)}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge status={app.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedApp(app)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Track
                          </Button>

                          {app.certificate && (
                            <Link href={`/verify/${app.certificate.certificateNumber}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Award className="w-3.5 h-3.5 text-emerald-600" />}
                              >
                                Certificate
                              </Button>
                            </Link>
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

      {/* Application Progression Pipeline Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title={`Application Lifecycle Tracking: ${selectedApp.applicationNumber}`}
          description={`Comprehensive statutory verification pipeline for ${selectedApp.instrument?.make} ${selectedApp.instrument?.model} (SN: ${selectedApp.instrument?.serialNumber})`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* 5-Stage Stepper */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {[
                  { title: "Submitted", desc: "Fee Locked" },
                  { title: "Assigned", desc: "Officer Allocated" },
                  { title: "Scheduled", desc: "Visit Planned" },
                  { title: "Inspection", desc: "Field Testing" },
                  { title: selectedApp.status === "rejected" ? "Rejected" : "Certified", desc: selectedApp.status === "rejected" ? "Defect Notice" : "Official Seal" },
                ].map((step, idx) => {
                  const status = getStepStatus(idx, selectedApp.status);
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                          status === "completed"
                            ? "bg-emerald-600 text-white"
                            : status === "current"
                            ? "bg-[#1E3A8A] text-white ring-4 ring-blue-100"
                            : status === "failed"
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : status === "failed" ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className="font-bold text-[11px] text-gray-800 block">
                        {step.title}
                      </span>
                      <span className="text-[9px] text-gray-500 hidden sm:block">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100 space-y-1.5">
                <span className="font-bold text-[#1E3A8A] uppercase text-[10px] block">
                  Application Information
                </span>
                <p><strong>Tracking ID:</strong> {selectedApp.applicationNumber}</p>
                <p><strong>Application Type:</strong> {selectedApp.applicationType.replace("_", " ")}</p>
                <p><strong>Statutory Fee:</strong> {formatCurrency(selectedApp.feeAmount)} (Paid)</p>
                <p><strong>Submitted On:</strong> {formatDate(selectedApp.submittedAt || selectedApp.createdAt)}</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
                <span className="font-bold text-gray-700 uppercase text-[10px] block">
                  Instrument Details
                </span>
                <p><strong>Make & Model:</strong> {selectedApp.instrument?.make} {selectedApp.instrument?.model}</p>
                <p><strong>Serial Number:</strong> {selectedApp.instrument?.serialNumber}</p>
                <p><strong>Capacity & Least Count:</strong> {selectedApp.instrument?.capacity} ({selectedApp.instrument?.leastCount})</p>
                <p><strong>Location:</strong> {selectedApp.instrument?.locationOfUse}</p>
              </div>
            </div>

            {/* Officer & Inspection Status */}
            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-2">
              <span className="font-bold text-gray-800 uppercase text-[10px] block">
                Verification & Assignment Log
              </span>
              {selectedApp.assignedToName ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{selectedApp.assignedToName}</p>
                    <p className="text-gray-500 text-[11px]">{selectedApp.assignedToType?.toUpperCase() || "LMO"} Officer</p>
                  </div>
                  {selectedApp.scheduledDate && (
                    <span className="font-semibold text-purple-800 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                      📅 Scheduled: {selectedApp.scheduledDate} ({selectedApp.scheduledTimeSlot || "10 AM - 1 PM"})
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-amber-700 italic">
                  Application has been queued. State Legal Metrology Administration will assign an officer shortly.
                </p>
              )}

              {selectedApp.notes && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-500 font-semibold">Applicant Instructions:</span>
                  <p className="text-gray-700 mt-0.5">{selectedApp.notes}</p>
                </div>
              )}
            </div>

            {/* Certificate Link if Completed */}
            {selectedApp.certificate && (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs">Official Verification Certificate Issued</h4>
                  <p className="text-[11px] text-emerald-700">
                    Certificate No: {selectedApp.certificate.certificateNumber} (Valid until {formatDate(selectedApp.certificate.validUntil)})
                  </p>
                </div>
                <Link href={`/verify/${selectedApp.certificate.certificateNumber}`} target="_blank">
                  <Button variant="primary" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    View Certificate
                  </Button>
                </Link>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
              <Link href={`/dashboard/instruments/${selectedApp.instrument?.id}`}>
                <Button variant="outline" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                  View Instrument Details
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
