"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { AlertCircle, PlusCircle, ShieldAlert, CheckCircle2, MapPin, Edit3 } from "lucide-react";
import { INDIAN_STATES } from "@/lib/constants";
import { useMockStore } from "@/lib/mockStore";

export default function ComplaintsPage() {
  const grievances = useMockStore((s) => s.grievances);
  const addGrievance = useMockStore((s) => s.addGrievance);
  const updateGrievance = useMockStore((s) => s.updateGrievance);

  const [isLodgeOpen, setIsLodgeOpen] = useState(false);

  // Lodge Grievance Form State
  const [targetBusiness, setTargetBusiness] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [district, setDistrict] = useState("Mumbai Suburban");
  const [selectedState, setSelectedState] = useState(INDIAN_STATES[1].name);
  const [category, setCategory] = useState("tampered_scale");
  const [description, setDescription] = useState("");
  const [complainantName, setComplainantName] = useState("Registered Trader");
  const [complainantPhone, setComplainantPhone] = useState("+91 98200 12345");

  // Investigation / Resolution Modal State
  const [selectedGrievance, setSelectedGrievance] = useState<any | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState("under_investigation");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const handleLodgeGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    addGrievance({
      complainantName,
      complainantPhone,
      targetBusinessName: targetBusiness,
      targetAddress,
      district,
      stateName: selectedState,
      category,
      description,
    });
    setIsLodgeOpen(false);
    setTargetBusiness("");
    setTargetAddress("");
    setDescription("");
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievance) return;
    updateGrievance(selectedGrievance.id, resolutionStatus, resolutionNotes);
    setSelectedGrievance(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-[#DC2626]" />
            <span>Legal Metrology Grievance & Enforcement Redressal</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Public & Trader grievance cell for tampered weights, missing holograms, and statutory non-compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsLodgeOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Lodge New Grievance
          </Button>
        </div>
      </div>

      {grievances.length === 0 ? (
        <Card className="bg-white p-12 text-center text-gray-500">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-800">No active grievances in this jurisdiction</p>
          <p className="text-xs text-gray-400 mt-1">All consumer complaints have been redressed and verified.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {grievances.map((c) => (
            <Card key={c.id} className="bg-white hover:border-red-300 transition-all">
              <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {c.complaintNumber}
                  </span>
                  <span className="font-bold text-sm text-gray-900 capitalize">
                    {c.category.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={c.status as any} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGrievance(c);
                      setResolutionStatus(c.status || "under_investigation");
                      setResolutionNotes(c.resolutionNotes || "");
                    }}
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Investigate
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <span>
                    Reported Establishment: <strong className="text-gray-900">{c.targetBusinessName}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {c.targetAddress} ({c.district}, {c.stateName})
                  </span>
                  <span>•</span>
                  <span>Complainant: {c.complainantName} ({c.complainantPhone})</span>
                </div>

                <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200 mt-2 leading-relaxed italic">
                  "{c.description}"
                </p>

                {c.resolutionNotes && (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded text-emerald-900 mt-2">
                    <strong className="block text-[10px] font-bold text-emerald-800 uppercase">
                      Action Taken / Resolution Summary:
                    </strong>
                    <p className="text-xs">{c.resolutionNotes}</p>
                  </div>
                )}

                <div className="pt-2 text-[11px] text-gray-400 flex items-center justify-between border-t border-gray-100 mt-2">
                  <span>Filed on {formatDate(c.createdAt)}</span>
                  <span className="text-[#1E3A8A] font-semibold">
                    {c.status === "resolved" ? "Investigation Completed" : "Designated LMO Enforcement Squad"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lodge New Grievance Modal */}
      {isLodgeOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsLodgeOpen(false)}
          title="Lodge Legal Metrology Complaint"
          description="Report fraudulent weights, unverified commercial scales, or broken stamp seals."
          maxWidth="lg"
        >
          <form onSubmit={handleLodgeGrievance} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>Complainant Name</Label>
                <Input
                  required
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                />
              </div>
              <div>
                <Label required>Contact Phone</Label>
                <Input
                  required
                  value={complainantPhone}
                  onChange={(e) => setComplainantPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label required>Violation Category</Label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="tampered_scale">Tampered / Inaccurate Weighing Scale</option>
                <option value="missing_stamp">Missing Verification Hologram or Seal Stamp</option>
                <option value="overcharging">Short-weight Pre-packaged Commodity</option>
                <option value="officer_misconduct">Inspection Officer Grievance</option>
                <option value="other">Other Metrological Non-Compliance</option>
              </Select>
            </div>

            <div>
              <Label required>Accused Shop / Commercial Establishment Name</Label>
              <Input
                required
                placeholder="e.g. Metro Supermarket or Highway Petrol Pump"
                value={targetBusiness}
                onChange={(e) => setTargetBusiness(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>State Jurisdiction</Label>
                <Select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
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
            </div>

            <div>
              <Label required>Premises Address & Location</Label>
              <Input
                required
                placeholder="Shop No, Street, Landmark"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
              />
            </div>

            <div>
              <Label required>Detailed Description of Violation</Label>
              <Textarea
                required
                placeholder="Please describe exact observation, date/time, and instrument discrepancy."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={() => setIsLodgeOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                leftIcon={<ShieldAlert className="w-4 h-4" />}
              >
                Submit Complaint to Enforcement Cell
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* LMO Investigation & Redressal Modal */}
      {selectedGrievance && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedGrievance(null)}
          title="Inspect & Resolve Grievance"
          description={`Record physical inspection findings for complaint ${selectedGrievance.complaintNumber}.`}
          maxWidth="lg"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="text-gray-500 block text-[10px]">Accused Merchant</span>
              <strong className="text-gray-900 block text-sm">{selectedGrievance.targetBusinessName}</strong>
              <p className="text-gray-600 mt-1">{selectedGrievance.targetAddress} ({selectedGrievance.district})</p>
              <p className="text-gray-700 italic mt-2 bg-white p-2 rounded border border-gray-200">
                "{selectedGrievance.description}"
              </p>
            </div>

            <div>
              <Label required>Investigation Status</Label>
              <Select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value)}
              >
                <option value="under_investigation">UNDER INVESTIGATION (Inspection In Progress)</option>
                <option value="resolved">RESOLVED (Action Taken / Equipment Sealed / Verified)</option>
                <option value="rejected">REJECTED (Unsubstantiated / Invalid Complaint)</option>
              </Select>
            </div>

            <div>
              <Label required>Officer Inspection Notes & Statutory Order</Label>
              <Textarea
                required
                rows={4}
                placeholder="Detail the findings of the on-site inspection, whether weights were tested with standard Working Standards, challans issued under Sec 15, or penalty levied."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={() => setSelectedGrievance(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Save Statutory Action
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
