"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { useMockStore } from "@/lib/mockStore";
import {
  CalendarCheck2,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  FileCheck,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function LmoSchedulePage() {
  const applications = useMockStore((s) => s.applications);
  const instruments = useMockStore((s) => s.instruments);
  const scheduleApplication = useMockStore((s) => s.scheduleApplication);

  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 12:00 PM");
  const [locationNotes, setLocationNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const enrichedApps = applications.map((a) => {
    const inst = instruments.find((i) => i.id === a.instrumentId) || a.instrument;
    return {
      ...a,
      instrument: inst,
    };
  });

  const scheduledApps = enrichedApps.filter((a) => a.status === "scheduled" && a.scheduledDate);
  const pendingApps = enrichedApps.filter((a) => a.status === "assigned" || (a.status === "submitted" && !a.scheduledDate));

  const handleOpenScheduleModal = (app: any) => {
    setSelectedApp(app);
    setScheduledDate(app.scheduledDate || new Date().toISOString().split("T")[0]);
    setTimeSlot(app.scheduledTimeSlot || "10:00 AM - 12:00 PM");
    setLocationNotes(app.notes || "");
    setSaveSuccess(null);
  };

  const handleSaveSchedule = () => {
    if (!selectedApp) return;
    setIsSaving(true);
    scheduleApplication(selectedApp.id, scheduledDate, timeSlot);
    setSaveSuccess("Inspection visit successfully scheduled!");
    setIsSaving(false);
    setTimeout(() => {
      setSelectedApp(null);
      setSaveSuccess(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-[#1E3A8A]" />
            <span>Verification Inspection Scheduling Calendar</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Schedule field visits for assigned applications and notify traders via automated SMS & Email alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/lmo/verify">
            <Button variant="primary" size="sm" leftIcon={<FileCheck className="w-4 h-4" />}>
              Open Field Verification Mode
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-white p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-800 uppercase">Confirmed Scheduled Visits</span>
              <p className="text-2xl font-black text-purple-700 mt-0.5">{scheduledApps.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
        <Card className="bg-white p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase">Action Required (Unscheduled)</span>
              <p className="text-2xl font-black text-amber-700 mt-0.5">{pendingApps.length}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
        </Card>
        <Card className="bg-white p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-800 uppercase">Total Active Allocated Tasks</span>
              <p className="text-2xl font-black text-[#1E3A8A] mt-0.5">{enrichedApps.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduled Visits List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-gray-900">
                Scheduled & Pending Field Visits
              </CardTitle>
              <span className="text-xs text-gray-500 font-normal">
                {enrichedApps.length} inspections assigned
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {enrichedApps.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm font-bold text-gray-800">No Assigned Visits</p>
                  <p className="text-xs text-gray-500 mt-1">
                    You have no active verification visits assigned to your account.
                  </p>
                </div>
              ) : (
                enrichedApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-lg border border-gray-200 bg-white hover:border-[#1E3A8A] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#1E3A8A]">
                          {app.applicationNumber}
                        </span>
                        {app.priority === "urgent" && (
                          <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold text-[9px]">
                            URGENT
                          </span>
                        )}
                        {app.scheduledDate ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            Scheduled: {formatDate(app.scheduledDate)} ({app.scheduledTimeSlot || "11 AM - 1 PM"})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Scheduling Required
                          </span>
                        )}
                      </div>
                      <strong className="text-xs text-gray-900 block">
                        {app.businessName}
                      </strong>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {app.district || "Mumbai Suburban"}
                        </span>
                        <span>•</span>
                        <span>{app.instrument?.make} {app.instrument?.model} (SN: {app.instrument?.serialNumber})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button
                        variant={app.scheduledDate ? "outline" : "primary"}
                        size="sm"
                        onClick={() => handleOpenScheduleModal(app)}
                      >
                        {app.scheduledDate ? "Reschedule" : "Schedule Visit"}
                      </Button>

                      <Link href={`/dashboard/lmo/verify?applicationId=${app.id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                        >
                          Inspect
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Calendar Summary */}
        <div className="space-y-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="p-4 border-b border-gray-100 bg-[#1E3A8A] text-white rounded-t-lg">
              <CardTitle className="text-xs font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-200" />
                <span>Upcoming Inspection Itinerary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-3">
              {scheduledApps.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-xs">No upcoming visits confirmed yet.</p>
                </div>
              ) : (
                scheduledApps.map((app) => (
                  <div key={app.id} className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#1E3A8A] uppercase">
                        {formatDate(app.scheduledDate)}
                      </span>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                        {app.scheduledTimeSlot || "Morning Slot"}
                      </span>
                    </div>
                    <strong className="text-gray-900 block text-xs">{app.businessName}</strong>
                    <p className="text-gray-600 text-[11px]">
                      {app.instrument?.make} {app.instrument?.model} • {app.instrument?.locationOfUse}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Visit Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title="Schedule Physical Inspection Visit"
          description={`Set date & time slot for inspecting ${selectedApp.businessName} (${selectedApp.applicationNumber}).`}
          maxWidth="md"
        >
          <div className="space-y-4">
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccess}</span>
              </div>
            )}

            <div>
              <Label required>Inspection Visit Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <Label required>Time Slot Window</Label>
              <Select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              >
                <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM (Morning Slot)</option>
                <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM (Midday Slot)</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon Slot)</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening Slot)</option>
              </Select>
            </div>

            <div>
              <Label>Special Instructions for Trader</Label>
              <Input
                placeholder="e.g. Ensure standard weights and platform access are clear."
                value={locationNotes}
                onChange={(e) => setLocationNotes(e.target.value)}
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-[#1E3A8A]">
              An automated confirmation SMS via CDAC Mobile Seva and Email will be instantly dispatched to {selectedApp.businessName}.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setSelectedApp(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isSaving}
                onClick={handleSaveSchedule}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm Schedule & Dispatch Alerts
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
