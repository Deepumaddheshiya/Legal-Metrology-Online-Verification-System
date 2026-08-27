"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  Users,
  PlusCircle,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Search,
  FileCheck2,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { StateScopeGate } from "@/components/auth/StateScopeGate";
import { useMockStore } from "@/lib/mockStore";

export default function OfficersDirectoryPage() {
  const users = useMockStore((s) => s.users);
  const addUser = useMockStore((s) => s.addUser);
  const toggleUserStatus = useMockStore((s) => s.toggleUserStatus);
  const applications = useMockStore((s) => s.applications);

  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Modal & Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [role, setRole] = useState<"lmo" | "gatc">("lmo");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("Pune");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const officers = users
    .filter((u) => u.role === "lmo" || u.role === "gatc")
    .map((o) => ({
      ...o,
      activeTaskCount: applications.filter(
        (a) => (a.assignedToUserId === o.id || (a as any).assignedToId === o.id) && ["assigned", "scheduled", "in_progress"].includes(a.status)
      ).length,
    }));

  const handleProvisionOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      fullName,
      email,
      phone,
      role,
      status: "active",
      district,
      stateName: "Maharashtra",
      stateCode: "MH",
      department: role === "lmo" ? "Legal Metrology Enforcement" : "NABL Testing Lab",
      designation: role === "lmo" ? "Legal Metrology Officer" : "Centre Director",
    });

    setActionSuccess(`Successfully provisioned ${role.toUpperCase()} account for ${fullName}.`);
    setIsAddOpen(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleToggleStatus = (officer: any) => {
    toggleUserStatus(officer.id);
    setActionSuccess(`Officer ${officer.fullName} status updated.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const filteredOfficers = officers.filter((o) => {
    const term = search.toLowerCase();
    const matchesSearch =
      o.fullName.toLowerCase().includes(term) ||
      o.email.toLowerCase().includes(term) ||
      o.phone.includes(term) ||
      (o.district || "").toLowerCase().includes(term);

    const matchesRole = roleFilter === "all" || o.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const { currentUser } = useAuthStore();

  return (
    <StateScopeGate resourceStateId={currentUser?.stateId}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-[#1E3A8A]" />
              <span>Field Officers & Accredited Test Centres</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Provision and manage District Legal Metrology Officers (LMOs) and Govt Approved Test Centres (GATCs).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddOpen(true)}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Provision New Officer / Centre
            </Button>
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
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roleFilter === "all"
                  ? "bg-[#1E3A8A] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Entities ({officers.length})
            </button>
            <button
              onClick={() => setRoleFilter("lmo")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roleFilter === "lmo"
                  ? "bg-[#1E3A8A] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              LMO Inspectors
            </button>
            <button
              onClick={() => setRoleFilter("gatc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roleFilter === "gatc"
                  ? "bg-[#1E3A8A] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              GATC Labs
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search officer name, district, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {/* Officers Grid */}
        {filteredOfficers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs bg-white rounded-xl border border-gray-200 space-y-2">
            <Users className="w-8 h-8 mx-auto text-gray-300" />
            <p className="font-semibold text-gray-700">No officers or test centres found.</p>
            <p className="text-gray-400">Click &quot;Provision New Officer / Centre&quot; to register new verifiers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOfficers.map((officer) => (
              <Card key={officer.id} className="bg-white hover:border-[#1E3A8A] transition-all shadow-sm">
                <CardHeader className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        officer.role === "lmo"
                          ? "bg-blue-100 text-[#1E3A8A] border border-blue-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}>
                        {officer.role === "lmo" ? "LMO" : "GATC"}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-900 leading-tight">
                          {officer.fullName}
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          {officer.role === "lmo" ? "Legal Metrology Officer" : "Govt Approved Test Centre"}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      officer.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {officer.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>District: <strong>{officer.district || "Pune"}</strong> ({officer.stateName || "Maharashtra"})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{officer.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>+91 {officer.phone}</span>
                  </div>

                  {officer.role === "lmo" && (
                    <div className="flex items-center justify-between p-2 bg-blue-50/60 rounded-lg border border-blue-200 text-[11px] text-[#1E3A8A]">
                      <span className="flex items-center gap-1 font-medium">
                        <FileCheck2 className="w-3.5 h-3.5" /> Active Tasks:
                      </span>
                      <strong className="font-mono font-bold">
                        {officer.activeTaskCount} Inspection{officer.activeTaskCount === 1 ? "" : "s"}
                      </strong>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100">
                    <Button
                      variant={officer.status === "active" ? "danger" : "primary"}
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleToggleStatus(officer)}
                    >
                      {officer.status === "active" ? "Deactivate Account" : "Activate Account"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Provision Officer / GATC Modal */}
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-[#1E3A8A] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-base">Provision Field Verifier / Lab</h3>
                </div>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="text-blue-200 hover:text-white font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleProvisionOfficer} className="p-6 space-y-4 text-xs">
                <div>
                  <Label required className="text-xs">Verifier Designation / Entity Type</Label>
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value as "lmo" | "gatc")}
                    className="text-xs"
                  >
                    <option value="lmo">Legal Metrology Officer (LMO Inspector)</option>
                    <option value="gatc">Government Approved Test Centre (GATC Lab)</option>
                  </Select>
                </div>

                <div>
                  <Label required className="text-xs">
                    {role === "lmo" ? "Officer Full Name" : "Testing Laboratory / Centre Name"}
                  </Label>
                  <Input
                    required
                    placeholder={role === "lmo" ? "e.g. Inspector S. K. Kulkarni" : "e.g. Precision Metrology Testing Centre"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div>
                  <Label required className="text-xs">Official Email Address</Label>
                  <Input
                    required
                    type="email"
                    placeholder={role === "lmo" ? "officer.district@lmovs.gov.in" : "lab@gatctest.org"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div>
                  <Label required className="text-xs">10-Digit Mobile Number (For Two-Factor OTP)</Label>
                  <Input
                    required
                    type="tel"
                    maxLength={10}
                    placeholder="9820000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="text-xs font-mono"
                  />
                </div>

                <div>
                  <Label required className="text-xs">Jurisdiction District</Label>
                  <Select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="text-xs"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Mumbai City">Mumbai City</option>
                    <option value="Mumbai Suburban">Mumbai Suburban</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Nashik">Nashik</option>
                    <option value="Thane">Thane</option>
                  </Select>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-1/3"
                    onClick={() => setIsAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-2/3 h-10 font-bold shadow-md hover:bg-blue-800"
                  >
                    Provision & Send Credentials
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </StateScopeGate>
  );
}
