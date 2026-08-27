"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { useMockStore } from "@/lib/mockStore";
import {
  UserCheck,
  Search,
  CheckCircle2,
  Users,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function StateAdminApplicationsPage() {
  const applications = useMockStore((s) => s.applications);
  const instruments = useMockStore((s) => s.instruments);
  const users = useMockStore((s) => s.users);
  const assignApplication = useMockStore((s) => s.assignApplication);

  const officers = users.filter((u) => u.role === "lmo" || u.role === "gatc");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("submitted");

  // Assignment Modal
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(officers[0]?.id || "");
  const [assignPriority, setAssignPriority] = useState<"normal" | "urgent">("normal");
  const [assignmentRemarks, setAssignmentRemarks] = useState("");
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  const enrichedApps = applications.map((a) => ({
    ...a,
    instrument: instruments.find((i) => i.id === a.instrumentId) || a.instrument,
  }));

  const handleOpenAssignModal = (app: any) => {
    setSelectedApp(app);
    setAssignPriority(app.priority || "normal");
    setAssignmentRemarks("");
    setAssignSuccess(null);
    if (officers.length > 0) {
      setSelectedOfficerId(app.assignedToId || officers[0].id);
    }
  };

  const handleConfirmAssignment = () => {
    if (!selectedApp || !selectedOfficerId) return;

    const officer = officers.find((o) => o.id === selectedOfficerId);
    assignApplication(
      selectedApp.id,
      selectedOfficerId,
      officer?.fullName || "Legal Metrology Officer",
      (officer?.role as "lmo" | "gatc") || "lmo"
    );
    setAssignSuccess("Officer allocated successfully!");

    setTimeout(() => {
      setSelectedApp(null);
      setAssignSuccess(null);
    }, 600);
  };

  const filtered = enrichedApps.filter((app) => {
    const term = search.toLowerCase();
    const matchesSearch =
      app.applicationNumber.toLowerCase().includes(term) ||
      app.businessName?.toLowerCase().includes(term) ||
      app.instrument?.make?.toLowerCase().includes(term) ||
      app.instrument?.serialNumber?.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unassignedCount = applications.filter((a) => a.status === "submitted").length;
  const activeAssignedCount = applications.filter((a) => ["assigned", "scheduled", "in_progress"].includes(a.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#1E3A8A]" />
            <span>State Verification Allocation Portal</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Allocate incoming verification requests to district Legal Metrology Officers (LMO) and Approved Test Centres (GATC).
          </p>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-white p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase">Unassigned Queue</span>
              <p className="text-2xl font-black text-amber-700 mt-0.5">{unassignedCount}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
        </Card>
        <Card className="bg-white p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-800 uppercase">Active Allocated Tasks</span>
              <p className="text-2xl font-black text-[#1E3A8A] mt-0.5">{activeAssignedCount}</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        <Card className="bg-white p-4 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase">Active Officers Available</span>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">{officers.length}</p>
            </div>
            <Users className="w-8 h-8 text-emerald-400" />
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-white p-4 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by Tracking ID, Establishment, Instrument, or Serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div className="sm:col-span-4">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="submitted">Unassigned (Awaiting Allocation)</option>
              <option value="assigned">Assigned to Officer</option>
              <option value="all">All Applications</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Applications Allocation Queue Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-gray-800">Queue is Clear!</p>
              <p className="text-xs text-gray-500 mt-1">
                {statusFilter === "submitted"
                  ? "All statutory verification applications have been allocated to field officers."
                  : "No applications found matching your criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Tracking ID</th>
                    <th className="p-3.5">Trader & Establishment</th>
                    <th className="p-3.5">Instrument</th>
                    <th className="p-3.5">Type & Fee</th>
                    <th className="p-3.5">Assigned Officer</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#1E3A8A]">
                        {app.applicationNumber}
                        {app.priority === "urgent" && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold text-[9px]">
                            URGENT
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <strong className="text-gray-900 block">{app.businessName}</strong>
                        <span className="text-[10px] text-gray-500">{app.district || "Mumbai Suburban"}</span>
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
                        <span className="block font-medium capitalize">{app.applicationType?.replace("_", " ")}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">{formatCurrency(app.feeAmount)} (Paid)</span>
                      </td>
                      <td className="p-3.5">
                        {app.assignedToName ? (
                          <strong className="text-gray-900 block">{app.assignedToName}</strong>
                        ) : (
                          <span className="text-amber-600 font-medium italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge status={app.status as any} />
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant={app.status === "submitted" ? "primary" : "outline"}
                          size="sm"
                          onClick={() => handleOpenAssignModal(app)}
                          leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                        >
                          {app.status === "submitted" ? "Assign Officer" : "Re-assign"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allocation Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title="Allocate Verification Application"
          description={`Assign ${selectedApp.applicationNumber} (${selectedApp.businessName}) to a field officer.`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {assignSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{assignSuccess}</span>
              </div>
            )}

            {/* Target Instrument & Establishment Card */}
            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">Establishment:</span>
                <strong className="text-gray-900">{selectedApp.businessName}</strong>
                <span className="text-gray-500 block text-[11px]">{selectedApp.district || "Mumbai"}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase">Instrument:</span>
                <strong className="text-gray-900">{selectedApp.instrument?.make} {selectedApp.instrument?.model}</strong>
                <span className="text-gray-500 block text-[11px] font-mono">SN: {selectedApp.instrument?.serialNumber}</span>
              </div>
            </div>

            {/* Officer Selection */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Select Legal Metrology Officer / Approved Test Centre
              </label>
              {officers.length === 0 ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  No active officers provisioned.
                </div>
              ) : (
                <Select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                >
                  {officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.fullName} ({officer.role.toUpperCase()}) — {officer.district || "Jurisdiction"} | 📞 +91 {officer.phone || "N/A"}
                    </option>
                  ))}
                </Select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Priority</label>
                <Select
                  value={assignPriority}
                  onChange={(e) => setAssignPriority(e.target.value as any)}
                >
                  <option value="normal">Normal (Standard 7 Days)</option>
                  <option value="urgent">Urgent (48-Hour TAT)</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Assignment Remarks</label>
                <Input
                  placeholder="e.g. Please coordinate with manager between 10am-1pm"
                  value={assignmentRemarks}
                  onChange={(e) => setAssignmentRemarks(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setSelectedApp(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmAssignment}
                disabled={officers.length === 0}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm Allocation & Dispatch Notification
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
