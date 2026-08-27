"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import {
  Smartphone,
  Camera,
  MapPin,
  CheckCircle2,
  XCircle,
  Award,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  CloudUpload,
} from "lucide-react";
import Link from "next/link";
import { generateSealNumber } from "@/lib/utils";
import { useMockStore } from "@/lib/mockStore";

export default function LmoFieldModePage() {
  const applications = useMockStore((s) => s.applications);
  const instruments = useMockStore((s) => s.instruments);
  const conductVerification = useMockStore((s) => s.conductVerification);

  const enrichedApps = applications.map((a) => ({
    ...a,
    instrument: instruments.find((i) => i.id === a.instrumentId) || a.instrument,
  }));

  const [selectedAppId, setSelectedAppId] = useState<string>(
    enrichedApps[0]?.id || ""
  );

  // Online / Offline State
  const [isOnline, setIsOnline] = useState(true);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Field Data
  const [gpsLocation, setGpsLocation] = useState<string>("19.0760° N, 72.8777° E (Mumbai Zone 4)");
  const [photos, setPhotos] = useState<string[]>([
    "/instruments/counter-scale.jpg"
  ]);
  const [isPassed, setIsPassed] = useState(true);
  const [sealNo, setSealNo] = useState(generateSealNumber("MH"));
  const [defectsReason, setDefectsReason] = useState("");
  const [remarks, setRemarks] = useState("On-site physical inspection passed per Schedule VI.");

  // Checkpoints
  const [chkVisual, setChkVisual] = useState(true);
  const [chkZero, setChkZero] = useState(true);
  const [chkEccentricity, setChkEccentricity] = useState(true);
  const [chkMaxLoad, setChkMaxLoad] = useState(true);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetApp = enrichedApps.find((a) => a.id === selectedAppId) || enrichedApps[0];

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setPhotos((prev) => [...prev, url]);
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setOfflineCount(0);
      setIsSyncing(false);
      setSyncMessage("Successfully synchronized offline records to central database.");
    }, 600);
  };

  const handleCompleteFieldTest = () => {
    if (!targetApp) return;
    setIsSubmitting(true);

    const testReadings = [
      { parameter: "Visual Approval Plate", standardValue: "Intact", observedValue: "Verified", tolerance: "Strict", status: chkVisual ? "pass" : "fail" },
      { parameter: "Zero Setting", standardValue: "0.000 kg", observedValue: "0.000 kg", tolerance: "± 0.5 e", status: chkZero ? "pass" : "fail" },
      { parameter: "Eccentricity (1/3 Max)", standardValue: "10.000 kg", observedValue: "10.001 kg", tolerance: "± 1.0 e", status: chkEccentricity ? "pass" : "fail" },
      { parameter: "Max Capacity Load", standardValue: "30.000 kg", observedValue: "30.002 kg", tolerance: "± 2.0 e", status: chkMaxLoad ? "pass" : "fail" },
    ];

    if (isOnline) {
      conductVerification(targetApp.id, {
        result: isPassed ? "pass" : "fail",
        readings: testReadings,
        remarks,
        sealNumber: isPassed ? sealNo : undefined,
        defectsFound: !isPassed ? defectsReason || "Tolerance limits exceeded." : undefined,
      });
      setSubmissionFeedback("Verification recorded in Legal Metrology Central Registry!");
    } else {
      setOfflineCount((c) => c + 1);
      setSubmissionFeedback("Saved to local device cache. Will auto-sync once connectivity is restored.");
    }

    setIsSubmitting(false);
    setIsCompleted(true);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Hidden Camera Input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Field Mode Header */}
      <div className="flex items-center justify-between bg-[#1E3A8A] text-white p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-6 h-6 text-amber-300" />
          <div>
            <h1 className="font-bold text-sm leading-tight">Mobile Field Inspection Mode</h1>
            <p className="text-[10px] text-blue-200">Schedule VI On-Site Testing • Touch Optimized</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {offlineCount > 0 && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1 text-[10px] bg-amber-500 hover:bg-amber-600 text-white px-2 py-0.5 rounded font-bold transition-colors"
            >
              <CloudUpload className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{offlineCount} Pending Sync</span>
            </button>
          )}

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${
              isOnline ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-red-600 text-white hover:bg-red-700"
            }`}
            title="Click to toggle online/offline test simulation"
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? "Online" : "Offline"}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-[#1E3A8A] flex items-center justify-between">
          <span>{syncMessage}</span>
          <button onClick={() => setSyncMessage(null)} className="text-blue-500 font-bold">×</button>
        </div>
      )}

      {enrichedApps.length === 0 ? (
        <Card className="p-8 text-center bg-white border-amber-200">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-800">No Allocated Applications</h3>
          <p className="text-xs text-gray-500 mt-1">
            You currently have no verification inspections assigned to your account.
          </p>
        </Card>
      ) : isCompleted ? (
        <Card className="bg-white p-6 text-center border-emerald-200 shadow-md">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Field Inspection Recorded!
          </h3>
          <p className="text-xs text-gray-600 mb-2">
            Application: <strong className="text-[#1E3A8A] font-mono">{targetApp.applicationNumber}</strong> • Result: <strong className={isPassed ? "text-emerald-700" : "text-red-700"}>{isPassed ? "PASS (STAMPED)" : "FAILED"}</strong>
          </p>
          {submissionFeedback && (
            <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-md mb-4 inline-block font-semibold">
              {submissionFeedback}
            </p>
          )}

          <div className="flex justify-center gap-2 pt-2">
            <Link href="/dashboard/applications">
              <Button variant="primary" size="sm">
                Return to Tasks Inbox
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCompleted(false);
                setPhotos([]);
              }}
            >
              Inspect Another
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Target Application Selector */}
          <Card className="bg-white border border-gray-200 shadow-sm p-3">
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
              Select Instrument to Inspect On-Site:
            </label>
            <Select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="text-xs font-semibold"
            >
              {enrichedApps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.applicationNumber} — {app.businessName} ({app.instrument?.make})
                </option>
              ))}
            </Select>
          </Card>

          {/* Target Application Summary Card */}
          <Card className="bg-white border-2 border-[#1E3A8A] shadow-sm">
            <CardContent className="p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-[#1E3A8A] text-sm">
                  {targetApp.applicationNumber}
                </span>
                <Badge status={targetApp.status as any} />
              </div>
              <strong className="text-sm text-gray-900 block">{targetApp.businessName}</strong>
              <p className="text-[11px] text-gray-500">{targetApp.district || "Mumbai Suburban"}</p>

              <div className="grid grid-cols-2 gap-2 text-gray-700 pt-1 border-t border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px]">Instrument:</span>
                  <strong>{targetApp.instrument?.make} {targetApp.instrument?.model}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Capacity / Division:</span>
                  <strong className="font-mono">{targetApp.instrument?.capacity} (e={targetApp.instrument?.leastCount})</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Geolocation & Camera Evidence */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="p-3 bg-gray-50 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-gray-800">
                1. GPS Coordinates & Stamping Evidence Photo
              </CardTitle>
              <MapPin className="w-4 h-4 text-[#1E3A8A]" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-blue-50/60 rounded-lg text-xs">
                <span className="text-gray-600">Geo-Tagged Location:</span>
                <strong className="font-mono text-[#1E3A8A] text-[11px]">{gpsLocation}</strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Capture Lead Seal / Stamping Plate Photo
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[100px] rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors p-3"
                >
                  {photos.length > 0 ? (
                    <div className="space-y-2 w-full">
                      <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          {photos.length} Photo(s) Captured & GPS Tagged
                        </span>
                        <span className="text-[10px] text-blue-600 underline">Tap to add more</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto py-1">
                        {photos.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt="Inspection evidence"
                            className="h-16 w-16 object-cover rounded border border-gray-200 shadow-sm"
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <Camera className="w-6 h-6 mx-auto mb-1 text-[#1E3A8A]" />
                      <span className="text-xs font-bold text-gray-800 block">Tap to Open Device Camera</span>
                      <span className="text-[10px] text-gray-400">Auto-compressed & GPS stamped</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Touch Checklist */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="p-3 bg-gray-50 border-b border-gray-100">
              <CardTitle className="text-xs font-bold text-gray-800">
                2. On-Site Physical Metrology Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 text-xs">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer active:scale-[0.99] transition-transform">
                <input
                  type="checkbox"
                  checked={chkVisual}
                  onChange={(e) => setChkVisual(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <span className="font-semibold text-gray-800">1. Visual Model Approval & Security Wire Intact</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer active:scale-[0.99] transition-transform">
                <input
                  type="checkbox"
                  checked={chkZero}
                  onChange={(e) => setChkZero(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <span className="font-semibold text-gray-800">2. Zero Setting & Sensitivity Within ± 0.5 e</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer active:scale-[0.99] transition-transform">
                <input
                  type="checkbox"
                  checked={chkEccentricity}
                  onChange={(e) => setChkEccentricity(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <span className="font-semibold text-gray-800">3. Eccentricity / Corner Load Within ± 1.0 e</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer active:scale-[0.99] transition-transform">
                <input
                  type="checkbox"
                  checked={chkMaxLoad}
                  onChange={(e) => setChkMaxLoad(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <span className="font-semibold text-gray-800">4. Maximum Load & Repeatability Test Passed</span>
              </label>
            </CardContent>
          </Card>

          {/* Stamping Seal or Defect Inputs */}
          {isPassed ? (
            <Card className="bg-white border border-emerald-200 p-3">
              <Label required>Official Lead / Punch Seal Number</Label>
              <Input
                value={sealNo}
                onChange={(e) => setSealNo(e.target.value)}
                placeholder="MH/PUN/2026/0892"
                className="font-mono text-xs font-bold"
              />
            </Card>
          ) : (
            <Card className="bg-white border border-red-200 p-3">
              <Label required>Defects Reason (Non-Compliance)</Label>
              <Input
                value={defectsReason}
                onChange={(e) => setDefectsReason(e.target.value)}
                placeholder="e.g. Load cell calibration drift exceeded 2.0 e MPE"
                className="text-xs"
              />
            </Card>
          )}

          {/* Big Touch Determination Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPassed(false)}
              className={`p-4 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-1 transition-all active:scale-95 ${
                !isPassed
                  ? "bg-red-600 text-white border-red-700 shadow-md"
                  : "bg-white text-red-600 border-red-200 hover:bg-red-50"
              }`}
            >
              <XCircle className="w-6 h-6" />
              <span>MARK FAILED</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPassed(true)}
              className={`p-4 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-1 transition-all active:scale-95 ${
                isPassed
                  ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
                  : "bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>PASS & STAMP</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full h-14 text-base font-bold bg-[#1E3A8A] hover:bg-[#1E40AF] shadow-lg"
            onClick={handleCompleteFieldTest}
            leftIcon={<Award className="w-5 h-5 text-amber-300" />}
          >
            {isOnline ? "Save & Sync Verification" : "Queue Locally (Offline)"}
          </Button>
        </div>
      )}
    </div>
  );
}
