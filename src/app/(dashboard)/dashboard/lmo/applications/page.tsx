"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { useMockStore } from "@/lib/mockStore";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  Search,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import Link from "next/link";

export default function LmoApplicationsPage() {
  const applications = useMockStore((s) => s.applications);
  const instruments = useMockStore((s) => s.instruments);
  const scheduleApplication = useMockStore((s) => s.scheduleApplication);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [acceptingTask, setAcceptingTask] = useState<any | null>(null);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 01:00 PM");
  const [isAccepting, setIsAccepting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [decliningTask, setDecliningTask] = useState<any | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const tasks = applications.map((a) => ({
    ...a,
    instrument: instruments.find((i) => i.id === a.instrumentId) || a.instrument,
  }));

  const handleAcceptTask = () => {
    if (!acceptingTask) return;
    setIsAccepting(true);
    scheduleApplication(acceptingTask.id, visitDate, timeSlot);
    setActionSuccess("Inspection visit scheduled!");
    setIsAccepting(false);
    setTimeout(() => {
      setAcceptingTask(null);
      setActionSuccess(null);
    }, 600);
  };

  const handleDeclineTask = () => {
    setDecliningTask(null);
    setDeclineReason("");
  };

  const filtered = tasks.filter((task) => {
    const matchesSearch =
      task.applicationNumber.toLowerCase().includes(search.toLowerCase()) ||
      task.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      task.instrument?.make?.toLowerCase().includes(search.toLowerCase()) ||
      task.instrument?.serialNumber?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = tasks.filter((t) => t.status === "assigned" || t.status === "submitted").length;
  const scheduledCount = tasks.filter((t) => t.status === "scheduled").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#1E3A8A]" />
            <span>Verifier Inspection Tasks Inbox</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Accept allocated verification applications, schedule on-site visits, and conduct statutory field testing.
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

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-white p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase">Pending Acceptance</span>
              <p className="text-2xl font-black text-amber-700 mt-0.5">{pendingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
        </Card>
        <Card className="bg-white p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-800 uppercase">Scheduled Visits</span>
              <p className="text-2xl font-black text-purple-700 mt-0.5">{scheduledCount}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
        <Card className="bg-white p-4 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase">Completed Inspections</span>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">{completedCount}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
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
              <option value="all">All Allocated Tasks</option>
              <option value="assigned">Pending Acceptance</option>
              <option value="scheduled">Scheduled Visits</option>
              <option value="completed">Completed & Verified</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tasks Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-gray-800">No Pending Tasks</p>
              <p className="text-xs text-gray-500 mt-1">
                You have no active verification tasks in this filter view.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Tracking ID</th>
                    <th className="p-3.5">Establishment & Address</th>
                    <th className="p-3.5">Instrument</th>
                    <th className="p-3.5">Scheduled Visit</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#1E3A8A]">
                        {task.applicationNumber}
                        {task.priority === "urgent" && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold text-[9px]">
                            URGENT
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <strong className="text-gray-900 block">{task.businessName}</strong>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {task.district || "Mumbai Suburban"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-gray-800 block">
                          {task.instrument?.make} {task.instrument?.model}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          SN: {task.instrument?.serialNumber} ({task.instrument?.capacity})
                        </span>
                      </td>
                      <td className="p-3.5">
                        {task.scheduledDate ? (
                          <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {formatDate(task.scheduledDate)}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium italic">Not scheduled</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge status={task.status as any} />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(task.status === "assigned" || task.status === "submitted") && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setAcceptingTask(task)}
                                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              >
                                Accept & Schedule
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDecliningTask(task)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Decline
                              </Button>
                            </>
                          )}

                          {task.status === "scheduled" && (
                            <Link href={`/dashboard/lmo/verify?applicationId=${task.id}`}>
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                              >
                                Conduct Test
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accept & Schedule Modal */}
      {acceptingTask && (
        <Modal
          isOpen={true}
          onClose={() => setAcceptingTask(null)}
          title="Accept & Schedule Inspection Visit"
          description={`Schedule statutory on-site inspection for ${acceptingTask.applicationNumber} (${acceptingTask.businessName}).`}
          maxWidth="md"
        >
          <div className="space-y-4">
            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{actionSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Planned Visit Date
              </label>
              <Input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Estimated Time Slot
              </label>
              <Select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                <option value="10:00 AM - 01:00 PM">Morning (10:00 AM - 01:00 PM)</option>
                <option value="02:00 PM - 05:00 PM">Afternoon (02:00 PM - 05:00 PM)</option>
                <option value="All Day Inspection">Full Day Multi-Instrument Inspection</option>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setAcceptingTask(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isAccepting}
                onClick={handleAcceptTask}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm & Dispatch Alert
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Decline Modal */}
      {decliningTask && (
        <Modal
          isOpen={true}
          onClose={() => setDecliningTask(null)}
          title="Decline Verification Assignment"
          description={`Decline ${decliningTask.applicationNumber}. This application will be returned to the State Administrator queue for reallocation.`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Reason for Rejection / Return <span className="text-red-500">*</span>
              </label>
              <Select value={declineReason} onChange={(e) => setDeclineReason(e.target.value)}>
                <option value="">-- Select Reason --</option>
                <option value="Outside assigned jurisdiction">Outside assigned jurisdiction</option>
                <option value="On official leave / training">On official leave / training</option>
                <option value="Specialized testing equipment unavailable">Specialized testing equipment unavailable</option>
                <option value="Conflict of interest">Conflict of interest</option>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setDecliningTask(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeclineTask}
                className="bg-red-600 hover:bg-red-700"
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Confirm Decline & Requeue
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
