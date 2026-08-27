"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  Database,
  PlusCircle,
  Building2,
  MapPin,
  CheckCircle2,
  Search,
  Edit2,
  Globe,
  Layers,
} from "lucide-react";

interface StateMaster {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  districtCount: number;
  userCount: number;
}

interface DistrictMaster {
  id: string;
  name: string;
  stateId: string;
  stateName: string;
  stateCode: string;
  isActive: boolean;
  businessCount: number;
}

const INITIAL_STATES: StateMaster[] = [
  { id: "s-mh", name: "Maharashtra", code: "MH", isActive: true, districtCount: 36, userCount: 142 },
  { id: "s-dl", name: "Delhi", code: "DL", isActive: true, districtCount: 11, userCount: 88 },
  { id: "s-ka", name: "Karnataka", code: "KA", isActive: true, districtCount: 31, userCount: 95 },
  { id: "s-tn", name: "Tamil Nadu", code: "TN", isActive: true, districtCount: 38, userCount: 110 },
  { id: "s-gu", name: "Gujarat", code: "GJ", isActive: true, districtCount: 33, userCount: 79 },
  { id: "s-wb", name: "West Bengal", code: "WB", isActive: true, districtCount: 23, userCount: 64 },
];

const INITIAL_DISTRICTS: DistrictMaster[] = [
  { id: "d-1", name: "Mumbai City", stateId: "s-mh", stateName: "Maharashtra", stateCode: "MH", isActive: true, businessCount: 420 },
  { id: "d-2", name: "Mumbai Suburban", stateId: "s-mh", stateName: "Maharashtra", stateCode: "MH", isActive: true, businessCount: 580 },
  { id: "d-3", name: "Pune", stateId: "s-mh", stateName: "Maharashtra", stateCode: "MH", isActive: true, businessCount: 340 },
  { id: "d-4", name: "Nagpur", stateId: "s-mh", stateName: "Maharashtra", stateCode: "MH", isActive: true, businessCount: 190 },
  { id: "d-5", name: "Thane", stateId: "s-mh", stateName: "Maharashtra", stateCode: "MH", isActive: true, businessCount: 260 },
  { id: "d-6", name: "New Delhi", stateId: "s-dl", stateName: "Delhi", stateCode: "DL", isActive: true, businessCount: 310 },
  { id: "d-7", name: "Bengaluru Urban", stateId: "s-ka", stateName: "Karnataka", stateCode: "KA", isActive: true, businessCount: 450 },
  { id: "d-8", name: "Chennai", stateId: "s-tn", stateName: "Tamil Nadu", stateCode: "TN", isActive: true, businessCount: 390 },
];

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<"states" | "districts">("states");

  const [states, setStates] = useState<StateMaster[]>(INITIAL_STATES);
  const [stateSearch, setStateSearch] = useState("");
  const [isAddStateOpen, setIsAddStateOpen] = useState(false);
  const [editingState, setEditingState] = useState<StateMaster | null>(null);
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState("");

  const [districts, setDistricts] = useState<DistrictMaster[]>(INITIAL_DISTRICTS);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>("s-mh");
  const [districtSearch, setDistrictSearch] = useState("");
  const [isAddDistrictOpen, setIsAddDistrictOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<DistrictMaster | null>(null);
  const [districtName, setDistrictName] = useState("");
  const [districtStateId, setDistrictStateId] = useState("s-mh");

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleCreateState = (e: React.FormEvent) => {
    e.preventDefault();
    const newState: StateMaster = {
      id: `s-${stateCode.toLowerCase()}`,
      name: stateName,
      code: stateCode.toUpperCase(),
      isActive: true,
      districtCount: 0,
      userCount: 0,
    };
    setStates((prev) => [...prev, newState]);
    setActionSuccess(`State ${stateName} added successfully.`);
    setIsAddStateOpen(false);
    setStateName("");
    setStateCode("");
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleUpdateState = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingState) return;
    setStates((prev) =>
      prev.map((s) => (s.id === editingState.id ? { ...s, name: stateName, code: stateCode.toUpperCase() } : s))
    );
    setActionSuccess(`State ${stateName} updated successfully.`);
    setEditingState(null);
    setStateName("");
    setStateCode("");
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleToggleStateActive = (st: StateMaster) => {
    setStates((prev) =>
      prev.map((s) => (s.id === st.id ? { ...s, isActive: !s.isActive } : s))
    );
    setActionSuccess(`State ${st.name} status updated.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleCreateDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    const st = states.find((s) => s.id === districtStateId) || states[0];
    const newDist: DistrictMaster = {
      id: `d-${Date.now()}`,
      name: districtName,
      stateId: st.id,
      stateName: st.name,
      stateCode: st.code,
      isActive: true,
      businessCount: 0,
    };
    setDistricts((prev) => [...prev, newDist]);
    setActionSuccess(`District ${districtName} created successfully.`);
    setIsAddDistrictOpen(false);
    setDistrictName("");
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleUpdateDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDistrict) return;
    setDistricts((prev) =>
      prev.map((d) => (d.id === editingDistrict.id ? { ...d, name: districtName } : d))
    );
    setActionSuccess(`District ${districtName} updated successfully.`);
    setEditingDistrict(null);
    setDistrictName("");
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleToggleDistrictActive = (dist: DistrictMaster) => {
    setDistricts((prev) =>
      prev.map((d) => (d.id === dist.id ? { ...d, isActive: !d.isActive } : d))
    );
    setActionSuccess(`District ${dist.name} status updated.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const filteredStates = states.filter(
    (s) =>
      s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredDistricts = districts.filter(
    (d) =>
      (selectedStateFilter === "all" || d.stateId === selectedStateFilter) &&
      d.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-[#1E3A8A]" />
            <span>Master Data Management System</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure statutory administrative jurisdictions: Indian States, Union Territories, and Districts in National Repository.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "states" ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setStateName("");
                setStateCode("");
                setIsAddStateOpen(true);
              }}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Add New State
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setDistrictName("");
                setDistrictStateId(selectedStateFilter || states[0]?.id || "");
                setIsAddDistrictOpen(true);
              }}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Add New District
            </Button>
          )}
        </div>
      </div>

      {/* Action Alerts */}
      {actionSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("states")}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === "states"
              ? "border-[#1E3A8A] text-[#1E3A8A]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>States & Union Territories ({states.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("districts")}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === "districts"
              ? "border-[#1E3A8A] text-[#1E3A8A]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Districts Directory ({districts.length})</span>
        </button>
      </div>

      {/* TAB 1: STATES */}
      {activeTab === "states" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search state name or code..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">State / UT Name</th>
                      <th className="p-3.5">2-Letter Code</th>
                      <th className="p-3.5">Districts</th>
                      <th className="p-3.5">Registered Officers</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStates.map((st) => (
                      <tr key={st.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#1E3A8A]" />
                          <span>{st.name}</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#1E3A8A]">
                          <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {st.code}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-gray-700">
                          {st.districtCount} District{st.districtCount === 1 ? "" : "s"}
                        </td>
                        <td className="p-3.5 text-gray-700">
                          {st.userCount} User{st.userCount === 1 ? "" : "s"}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            st.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {st.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingState(st);
                              setStateName(st.name);
                              setStateCode(st.code);
                            }}
                            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant={st.isActive ? "danger" : "primary"}
                            size="sm"
                            onClick={() => handleToggleStateActive(st)}
                          >
                            {st.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: DISTRICTS */}
      {activeTab === "districts" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">Filter State:</span>
              <Select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="text-xs w-56"
              >
                <option value="all">All States</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </Select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search district name..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">District Name</th>
                      <th className="p-3.5">State Jurisdiction</th>
                      <th className="p-3.5">Registered Businesses</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDistricts.map((dist) => (
                      <tr key={dist.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{dist.name}</span>
                        </td>
                        <td className="p-3.5 font-medium text-gray-700">
                          {dist.stateName} ({dist.stateCode})
                        </td>
                        <td className="p-3.5 text-gray-700">
                          {dist.businessCount} Establishments
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            dist.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {dist.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingDistrict(dist);
                              setDistrictName(dist.name);
                            }}
                            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant={dist.isActive ? "danger" : "primary"}
                            size="sm"
                            onClick={() => handleToggleDistrictActive(dist)}
                          >
                            {dist.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add / Edit State Modal */}
      {(isAddStateOpen || editingState) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
              <Building2 className="w-5 h-5 text-[#1E3A8A]" />
              <span>{editingState ? "Modify State / UT Record" : "Add New State Jurisdiction"}</span>
            </div>

            <form onSubmit={editingState ? handleUpdateState : handleCreateState} className="space-y-4">
              <div>
                <Label required className="text-xs">State / Union Territory Name</Label>
                <Input
                  required
                  placeholder="e.g. Telangana"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <Label required className="text-xs">2-Letter Postal / ISO Code</Label>
                <Input
                  required
                  maxLength={2}
                  placeholder="e.g. TS"
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                  className="text-xs font-mono uppercase"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/3"
                  onClick={() => {
                    setIsAddStateOpen(false);
                    setEditingState(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-2/3 h-10 font-bold shadow-md hover:bg-blue-800"
                >
                  {editingState ? "Save Changes" : "Create State"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit District Modal */}
      {(isAddDistrictOpen || editingDistrict) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
              <MapPin className="w-5 h-5 text-[#1E3A8A]" />
              <span>{editingDistrict ? "Modify District Record" : "Add New District"}</span>
            </div>

            <form onSubmit={editingDistrict ? handleUpdateDistrict : handleCreateDistrict} className="space-y-4">
              {!editingDistrict && (
                <div>
                  <Label required className="text-xs">State Jurisdiction</Label>
                  <Select
                    value={districtStateId}
                    onChange={(e) => setDistrictStateId(e.target.value)}
                    className="text-xs"
                  >
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div>
                <Label required className="text-xs">District Name</Label>
                <Input
                  required
                  placeholder="e.g. Kolhapur"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/3"
                  onClick={() => {
                    setIsAddDistrictOpen(false);
                    setEditingDistrict(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-2/3 h-10 font-bold shadow-md hover:bg-blue-800"
                >
                  {editingDistrict ? "Save Changes" : "Create District"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
