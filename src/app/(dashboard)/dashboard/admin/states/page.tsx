"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  Building2,
  PlusCircle,
  ShieldCheck,
  Phone,
  Mail,
  CheckCircle2,
  Search,
} from "lucide-react";
import { useMockStore } from "@/lib/mockStore";

export default function StateAdministrationsPage() {
  const users = useMockStore((s) => s.users);
  const addUser = useMockStore((s) => s.addUser);
  const toggleUserStatus = useMockStore((s) => s.toggleUserStatus);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const states = [
    { id: "s-mh", name: "Maharashtra", code: "MH" },
    { id: "s-dl", name: "Delhi", code: "DL" },
    { id: "s-ka", name: "Karnataka", code: "KA" },
    { id: "s-tn", name: "Tamil Nadu", code: "TN" },
    { id: "s-gu", name: "Gujarat", code: "GJ" },
    { id: "s-wb", name: "West Bengal", code: "WB" },
  ];

  // Form State
  const [selectedStateId, setSelectedStateId] = useState(states[0].id);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("State HQ");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const stateAdmins = users.filter((u) => u.role === "state_admin");

  const handleProvisionStateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const st = states.find((s) => s.id === selectedStateId) || states[0];

    addUser({
      fullName,
      email,
      phone,
      role: "state_admin",
      status: "active",
      district,
      stateName: st.name,
      stateCode: st.code,
      department: "Legal Metrology State Administration",
      designation: "State Controller / Admin",
    });

    setActionSuccess(
      `State Controller provisioned successfully for ${fullName} (${st.name}).`
    );
    setIsModalOpen(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleToggleStatus = (user: any) => {
    toggleUserStatus(user.id);
    setActionSuccess(`Status for ${user.fullName} updated.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const filteredStates = states.filter((s) => {
    const term = search.toLowerCase();
    const admin = stateAdmins.find((a) => a.stateCode === s.code || a.stateName === s.name);
    return (
      s.name.toLowerCase().includes(term) ||
      s.code.toLowerCase().includes(term) ||
      (admin && admin.fullName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#1E3A8A]" />
            <span>State Legal Metrology Administrations Directory</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            National overview of State Controllers, regional officer quotas, and jurisdiction provisioning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Provision State Controller
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search state name, code, controller..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* States Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStates.map((state) => {
          const controller = stateAdmins.find(
            (a) => a.stateCode === state.code || a.stateName === state.name
          );
          return (
            <Card key={state.id} className="bg-white hover:border-[#1E3A8A] transition-all shadow-sm">
              <CardHeader className="p-4 border-b border-gray-100 bg-blue-50/50 flex flex-row items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{state.name}</h3>
                  <span className="text-[10px] font-mono font-bold text-[#1E3A8A] bg-blue-100 px-2 py-0.5 rounded">
                    Code: {state.code}
                  </span>
                </div>
                {controller ? (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    controller.status === "active"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {controller.status}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                    Unassigned
                  </span>
                )}
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                {controller ? (
                  <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#1E3A8A]" />
                      <span>{controller.fullName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{controller.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>+91 {controller.phone}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-amber-800 text-[11px]">
                    No State Controller provisioned yet. Use the button above to assign an administrator.
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between">
                  {controller ? (
                    <Button
                      variant={controller.status === "active" ? "danger" : "primary"}
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleToggleStatus(controller)}
                    >
                      {controller.status === "active" ? "Deactivate Controller" : "Activate Controller"}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs font-bold"
                      onClick={() => {
                        setSelectedStateId(state.id);
                        setIsModalOpen(true);
                      }}
                    >
                      Assign State Controller
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Provision State Controller Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#1E3A8A] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Provision State Controller</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-blue-200 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProvisionStateAdmin} className="p-6 space-y-4 text-xs">
              <div>
                <Label required className="text-xs">State Jurisdiction</Label>
                <Select
                  value={selectedStateId}
                  onChange={(e) => setSelectedStateId(e.target.value)}
                  className="text-xs"
                >
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label required className="text-xs">Officer Full Name</Label>
                <Input
                  required
                  placeholder="e.g. Dr. Rajesh K. Patil"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <Label required className="text-xs">Official Government Email</Label>
                <Input
                  required
                  type="email"
                  placeholder="controller.state@lmovs.gov.in"
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
                <Label required className="text-xs">District HQ / Office Location</Label>
                <Input
                  required
                  placeholder="e.g. Mantralaya, Mumbai"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/3"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-2/3 h-10 font-bold shadow-md hover:bg-blue-800"
                >
                  Provision & Send Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
