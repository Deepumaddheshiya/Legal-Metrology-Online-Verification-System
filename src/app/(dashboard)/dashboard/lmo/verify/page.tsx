"use client";

import React, { useState, Suspense } from "react";
import { VerificationInspectionForm } from "@/components/forms/VerificationInspectionForm";
import { Select, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMockStore } from "@/lib/mockStore";
import Link from "next/link";

function VerificationConductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedAppId = searchParams.get("applicationId");

  const applications = useMockStore((s) => s.applications);
  const instruments = useMockStore((s) => s.instruments);

  const enrichedApps = applications.map((a) => ({
    ...a,
    instrument: instruments.find((i) => i.id === a.instrumentId) || a.instrument,
  }));

  const activeTasks = enrichedApps.filter(
    (a) => a.status === "assigned" || a.status === "scheduled" || a.status === "in_progress" || a.status === "submitted"
  );

  const [selectedAppId, setSelectedAppId] = useState<string>(
    preselectedAppId || (activeTasks[0]?.id ?? "")
  );

  const selectedApp =
    enrichedApps.find((a) => a.id === selectedAppId) || activeTasks[0] || enrichedApps[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#1E3A8A]" />
            <span>Conduct Legal Metrology Verification & Stamping</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Execute Schedule VI statutory test protocols, record accuracy readings, and persist physical test observations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/applications">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Tasks
            </Button>
          </Link>
        </div>
      </div>

      {enrichedApps.length === 0 ? (
        <Card className="p-8 text-center bg-white border-amber-200">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-800">No Applications Allocated</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            You currently have no verification applications assigned to your account.
          </p>
        </Card>
      ) : (
        <>
          <Card className="bg-white p-4 border border-gray-200 shadow-sm">
            <Label required>Select Verification Application to Inspect</Label>
            <Select
              value={selectedApp?.id || selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
            >
              {enrichedApps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.applicationNumber} — {app.businessName} ({app.instrument?.make} {app.instrument?.model}, SN: {app.instrument?.serialNumber}) [{app.status.toUpperCase()}]
                </option>
              ))}
            </Select>
          </Card>

          {selectedApp && (
            <VerificationInspectionForm
              application={selectedApp}
              onCompleted={() => {}}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function LmoConductVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-gray-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#1E3A8A] mb-2" />
          <p className="text-xs">Loading verification form...</p>
        </div>
      }
    >
      <VerificationConductContent />
    </Suspense>
  );
}
