"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  CheckCircle,
  XCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { StateScopeGate } from "@/components/auth/StateScopeGate";
import { useMockStore } from "@/lib/mockStore";

export default function BusinessApprovalsPage() {
  const users = useMockStore((s) => s.users);
  const approveTrader = useMockStore((s) => s.approveTrader);
  const rejectTrader = useMockStore((s) => s.rejectTrader);
  const { currentUser } = useAuthStore();

  const [statusFilter, setStatusFilter] = useState("pending_approval");
  const [search, setSearch] = useState("");
  const [selectedTrader, setSelectedTrader] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const traders = users.filter((u) => u.role === "business_owner");

  const handleApprove = (userId: string) => {
    approveTrader(userId);
    setActionSuccess("Trader registration approved successfully!");
    setSelectedTrader(null);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleReject = () => {
    if (!selectedTrader) return;
    rejectTrader(selectedTrader.id, rejectReason || "Incomplete or unverified establishment documents");
    setActionSuccess("Trader registration rejected.");
    setIsRejectModalOpen(false);
    setSelectedTrader(null);
    setRejectReason("");
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const filteredRegistrations = traders.filter((r) => {
    const term = search.toLowerCase();
    const bizName = r.businessName?.toLowerCase() || "";
    const name = r.fullName.toLowerCase();
    const gstin = r.gstin?.toLowerCase() || "";
    const dist = (r.district || "").toLowerCase();

    const matchesSearch =
      bizName.includes(term) ||
      name.includes(term) ||
      gstin.includes(term) ||
      dist.includes(term);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending_approval" && r.status === "pending_approval") ||
      (statusFilter === "active" && r.status === "active");

    return matchesSearch && matchesStatus;
  });

  return (
    <StateScopeGate resourceStateId={currentUser?.stateId}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <span>Trader & Commercial Business Approvals</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review GSTIN documentation, establishment premises, and approve trader accounts under Legal Metrology Act, 2009.
            </p>
          </div>
        </div>

        {/* Action Alerts */}
        {actionSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter("pending_approval")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "pending_approval"
                  ? "bg-[#1E3A8A] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Pending Review
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "active"
                  ? "bg-[#1E3A8A] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Approved Traders
            </button>
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-[#1E3A8A] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Records
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search business, owner, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {/* DataTable / Cards */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-900">
              Registration Applications ({filteredRegistrations.length})
            </CardTitle>
            <span className="text-xs text-gray-500 font-medium">State Scope Clearance Active</span>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {filteredRegistrations.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-xs space-y-2">
                <Building2 className="w-8 h-8 mx-auto text-gray-300" />
                <p className="font-semibold text-gray-700">No applications matching current filters.</p>
                <p className="text-gray-400">All commercial trader accounts in this category have been processed.</p>
              </div>
            ) : (
              filteredRegistrations.map((trader) => (
                <div
                  key={trader.id}
                  className="p-5 rounded-xl border border-gray-200 bg-white hover:border-[#1E3A8A] transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-sm text-gray-900">
                        {trader.businessName || "Commercial Business"}
                      </span>
                      {trader.gstin && (
                        <span className="font-mono text-xs text-[#1E3A8A] font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          GSTIN: {trader.gstin}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        trader.status === "active"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : trader.status === "pending_approval"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}>
                        {trader.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 font-medium">
                      Owner / Applicant: <strong className="text-gray-900">{trader.fullName}</strong>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        +91 {trader.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {trader.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {trader.district}, {trader.stateName || "Maharashtra"}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        Submitted {formatDate(trader.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTrader(trader)}
                      leftIcon={<Eye className="w-4 h-4" />}
                    >
                      Inspect Profile
                    </Button>

                    {trader.status === "pending_approval" && (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setSelectedTrader(trader);
                            setIsRejectModalOpen(true);
                          }}
                          leftIcon={<XCircle className="w-4 h-4" />}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                          onClick={() => handleApprove(trader.id)}
                          leftIcon={<CheckCircle className="w-4 h-4" />}
                        >
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Inspect Profile Dialog Modal */}
        {selectedTrader && !isRejectModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-[#1E3A8A] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-base">Commercial Trader Profile</h3>
                </div>
                <button
                  onClick={() => setSelectedTrader(null)}
                  className="text-blue-200 hover:text-white font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {/* Business Profile */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="font-bold text-gray-900 text-sm">
                      {selectedTrader.businessName}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-bold uppercase text-[10px]">
                      COMMERCIAL
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-600 pt-1">
                    <div>
                      <span className="text-gray-400 block text-[10px]">GSTIN Number:</span>
                      <span className="font-mono font-bold text-gray-900">{selectedTrader.gstin || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Trade License:</span>
                      <span className="font-mono font-bold text-gray-900">MH-TL-2026-089</span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="text-gray-400 block text-[10px]">Premises Address:</span>
                    <span className="text-gray-800">{selectedTrader.address || "Shop 1, Market Yard"}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 pt-1 text-[11px]">
                    <span>District: <strong>{selectedTrader.district}</strong></span>
                    <span>State: <strong>{selectedTrader.stateName || "Maharashtra"}</strong></span>
                  </div>
                </div>

                {/* Applicant Profile */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-gray-700">
                  <div className="font-bold text-gray-900 text-xs pb-1 border-b border-gray-200">
                    Authorized Signatory Contact
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Representative Name:</span>
                    <span className="font-semibold text-gray-900">{selectedTrader.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Official Email:</span>
                    <span className="font-semibold text-gray-900">{selectedTrader.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mobile Verification:</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified (+91 {selectedTrader.phone})
                    </span>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-2 flex gap-3">
                  <Button
                    variant="outline"
                    className="w-1/3"
                    onClick={() => setSelectedTrader(null)}
                  >
                    Close
                  </Button>

                  {selectedTrader.status === "pending_approval" && (
                    <>
                      <Button
                        variant="danger"
                        className="w-1/3"
                        onClick={() => setIsRejectModalOpen(true)}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        className="w-1/3 bg-emerald-600 hover:bg-emerald-700 font-bold"
                        onClick={() => handleApprove(selectedTrader.id)}
                      >
                        Approve Trader
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Reason Dialog Modal */}
        {isRejectModalOpen && selectedTrader && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-200 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>Reject Registration Application</span>
              </div>

              <p className="text-gray-600">
                Please specify the official reason for rejecting the registration of{" "}
                <strong>{selectedTrader.businessName}</strong>. This explanation will be dispatched to the applicant via SMS and Email.
              </p>

              <div>
                <Label required className="text-xs">Reason for Rejection</Label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. GSTIN could not be validated with state tax records or invalid premises documentation."
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="w-1/2"
                  onClick={() => setIsRejectModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="w-1/2 font-bold"
                  onClick={handleReject}
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StateScopeGate>
  );
}
