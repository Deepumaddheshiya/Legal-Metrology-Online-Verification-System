"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert, CheckCircle2, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { INDIAN_STATES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useMockStore } from "@/lib/mockStore";

export default function PublicComplaintsPage() {
  const [activeTab, setActiveTab] = useState<"lodge" | "track">("lodge");

  const grievances = useMockStore((s) => s.grievances);
  const addGrievance = useMockStore((s) => s.addGrievance);

  // Lodge Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [selectedState, setSelectedState] = useState(INDIAN_STATES[1].name);
  const [category, setCategory] = useState("tampered_scale");
  const [details, setDetails] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");

  // Track State
  const [trackNumber, setTrackNumber] = useState("");
  const [trackedGrievance, setTrackedGrievance] = useState<any>(null);
  const [trackError, setTrackError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const g = addGrievance({
      complainantName: name,
      complainantPhone: phone,
      complainantEmail: email || undefined,
      targetBusinessName: businessName,
      targetAddress: address,
      district: district || "District Jurisdiction",
      stateName: selectedState,
      category,
      description: details,
    });

    setTicketId(g.complaintNumber);
    setSubmitSuccess(true);
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackNumber.trim()) return;

    setTrackError("");
    const term = trackNumber.trim().toLowerCase();
    const found = grievances.find(
      (g) => g.complaintNumber.toLowerCase() === term || g.id.toLowerCase() === term
    );

    if (!found) {
      setTrackError("No grievance found matching this tracking ID. Please check the number.");
      setTrackedGrievance(null);
    } else {
      setTrackedGrievance(found);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Portal Home
            </Button>
          </Link>

          <div className="flex bg-gray-200 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab("lodge")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === "lodge" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Lodge Complaint
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === "track" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Track Existing Complaint
            </button>
          </div>
        </div>

        {activeTab === "track" ? (
          <Card className="bg-white shadow-xl border-gray-200">
            <CardHeader className="bg-[#1E3A8A] text-white rounded-t-lg p-6">
              <div className="flex items-center gap-2 mb-1">
                <Search className="w-5 h-5 text-blue-200" />
                <CardTitle className="text-white text-lg">
                  Track Grievance Investigation Status
                </CardTitle>
              </div>
              <p className="text-blue-100 text-xs">
                Enter your alphanumeric grievance tracking number (e.g. GRV/MH/2026/84920) to view status updates and inspection findings.
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <form onSubmit={handleTrack} className="flex gap-2">
                <Input
                  required
                  placeholder="e.g. GRV/MH/2026/84920"
                  value={trackNumber}
                  onChange={(e) => setTrackNumber(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Search className="w-4 h-4" />}
                >
                  Track
                </Button>
              </form>

              {trackError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
                  {trackError}
                </div>
              )}

              {trackedGrievance && (
                <div className="p-5 rounded-lg border border-gray-200 bg-gray-50/70 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Complaint Tracking ID</span>
                      <strong className="font-mono text-[#1E3A8A] text-sm">{trackedGrievance.complaintNumber}</strong>
                    </div>
                    <Badge status={trackedGrievance.status as any} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Violation Category</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {trackedGrievance.category.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Reported Establishment</span>
                      <span className="font-semibold text-gray-900">{trackedGrievance.targetBusinessName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Jurisdiction</span>
                      <span className="text-gray-700">{trackedGrievance.district}, {trackedGrievance.stateName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Filed On</span>
                      <span className="text-gray-700">{formatDate(trackedGrievance.createdAt)}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 block">Complaint Statement</span>
                    <p className="text-gray-700 bg-white p-2.5 rounded border border-gray-200 mt-1 leading-relaxed italic">
                      "{trackedGrievance.description}"
                    </p>
                  </div>

                  {trackedGrievance.resolutionNotes && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-900">
                      <strong className="block text-[11px] mb-1 font-bold text-emerald-800">
                        Officer Investigation Findings & Action Taken:
                      </strong>
                      <p className="text-xs leading-relaxed">{trackedGrievance.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : submitSuccess ? (
          <Card className="bg-white p-8 text-center border-emerald-200 shadow-xl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Grievance Registered Successfully
            </h2>
            <p className="text-sm font-mono font-bold text-[#1E3A8A] mb-3">
              Tracking Number: {ticketId}
            </p>
            <p className="text-xs text-gray-600 max-w-md mx-auto mb-6">
              Your grievance has been securely logged into the State Legal Metrology Enforcement database. An authorized Legal Metrology Officer will conduct an unannounced verification audit.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  setSubmitSuccess(false);
                  setName("");
                  setPhone("");
                  setEmail("");
                  setBusinessName("");
                  setAddress("");
                  setDistrict("");
                  setDetails("");
                }}
              >
                File Another Grievance
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="bg-white shadow-xl border-gray-200">
            <CardHeader className="bg-red-800 text-white rounded-t-lg p-6">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-6 h-6 text-amber-300" />
                <CardTitle className="text-white text-xl">
                  Public Consumer Grievance Portal
                </CardTitle>
              </div>
              <p className="text-red-100 text-xs">
                Under Section 15 of Legal Metrology Act, 2009: Report inaccurate weights, tampered digital scales, or missing inspection seals.
              </p>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label required>Your Full Name</Label>
                    <Input
                      required
                      placeholder="e.g. Kapil Gosavi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label required>Mobile Number for Updates</Label>
                    <Input
                      required
                      placeholder="+91 878 880 0483"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label required>Type of Metrological Violation</Label>
                  <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="tampered_scale">Inaccurate / Tampered Weighing Scale</option>
                    <option value="missing_stamp">Missing Verification Seal / Hologram Stamp</option>
                    <option value="overcharging">Short-weight Pre-packaged Goods</option>
                    <option value="officer_misconduct">Inspection Officer Misconduct</option>
                    <option value="other">Other Metrological Non-Compliance</option>
                  </Select>
                </div>

                <div>
                  <Label required>Accused Commercial Shop / Establishment Name</Label>
                  <Input
                    required
                    placeholder="e.g. Metro Mart Grocery or Highway Fuel Station"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label required>State Jurisdiction</Label>
                    <Select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label required>District</Label>
                    <Input
                      required
                      placeholder="e.g. Mumbai Suburban"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label required>Premises Address</Label>
                    <Input
                      required
                      placeholder="Market Area, Street, Landmark"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label required>Detailed Description of Violation</Label>
                  <Textarea
                    required
                    rows={3}
                    placeholder="Provide details: time of purchase, weight shown on display vs actual weight, refusal by shopkeeper to show certificate, etc."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </div>

                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="danger"
                    className="w-full h-11"
                    leftIcon={<ShieldAlert className="w-4 h-4" />}
                  >
                    Submit Formal Grievance to Legal Metrology Department
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
