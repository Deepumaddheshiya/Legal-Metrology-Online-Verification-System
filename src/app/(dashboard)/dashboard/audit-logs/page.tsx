"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatDateTime } from "@/lib/utils";
import { useMockStore } from "@/lib/mockStore";
import { History, Search, Eye, CheckCircle2, FileCode } from "lucide-react";

export default function AuditLogsPage() {
  const auditLogs = useMockStore((s) => s.auditLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const filtered = auditLogs.filter((log) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (log.action || "").toLowerCase().includes(term) ||
      (log.userName || "").toLowerCase().includes(term) ||
      (log.userRole || "").toLowerCase().includes(term) ||
      (log.entityType || "").toLowerCase().includes(term) ||
      (log.ipAddress || "").includes(term);

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#1E3A8A]" />
            <span>Security & Regulatory Audit Trail</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tamper-evident chronological record of all administrative actions, certificate stamping, and allocations.
          </p>
        </div>
      </div>

      <Card className="bg-white p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by User, Action Name, Entity, or IP address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div className="sm:col-span-4">
            <Select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">All Regulatory Actions</option>
              <option value="GENERATE_CERTIFICATE">GENERATE_CERTIFICATE</option>
              <option value="REVOKE_CERTIFICATE">REVOKE_CERTIFICATE</option>
              <option value="RECORD_VERIFICATION">RECORD_VERIFICATION</option>
              <option value="SCHEDULE_VISIT">SCHEDULE_VISIT</option>
              <option value="ALLOCATE_TASK">ALLOCATE_TASK</option>
              <option value="SUBMIT_APPLICATION">SUBMIT_APPLICATION</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="bg-white">
        <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900">
              Immutable System Events
            </CardTitle>
            <p className="text-xs text-gray-500">
              Showing {filtered.length} of {auditLogs.length} total verified transactions
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold bg-blue-50 text-[#1E3A8A] px-2 py-0.5 rounded border border-blue-200">
            Audit Standard: LMOVS-033
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">No audit events match your search criteria</p>
              <p className="text-xs text-gray-400 mt-0.5">Try clearing filters to view recent transactions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Actor / User</th>
                    <th className="p-3.5">Target Entity</th>
                    <th className="p-3.5 font-mono">IP Address</th>
                    <th className="p-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5 text-gray-500 font-mono">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-xs text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <strong className="text-gray-900 block">{log.userName}</strong>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-gray-800">{log.entityType}</span>
                        {log.entityId && (
                          <span className="text-[10px] text-gray-400 block font-mono">
                            {log.entityId.slice(0, 8)}...
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-gray-500 text-[11px]">
                        {log.ipAddress}
                      </td>
                      <td className="p-3.5 text-right">
                        <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Log JSON Diff Inspector Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Security Audit Transaction Inspector"
        description="Tamper-evident record detail and JSON delta payload."
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            {/* Header Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div>
                <span className="text-gray-500 block text-[10px]">Action</span>
                <span className="font-mono font-bold text-[#1E3A8A]">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Actor</span>
                <span className="font-semibold text-gray-900">{selectedLog.userName} ({selectedLog.userRole})</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Timestamp</span>
                <span className="font-mono text-gray-700">{formatDateTime(selectedLog.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">IP Address</span>
                <span className="font-mono text-gray-700">{selectedLog.ipAddress}</span>
              </div>
            </div>

            {/* Entity Target */}
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-[10px] block">Target Entity</span>
                  <span className="font-semibold text-gray-900">{selectedLog.entityType}</span>
                </div>
                {selectedLog.entityId && (
                  <span className="font-mono text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    UUID: {selectedLog.entityId}
                  </span>
                )}
              </div>
            </div>

            {/* JSON Payload Inspector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5 font-bold text-gray-700">
                  <FileCode className="w-3.5 h-3.5 text-amber-600" />
                  <span>Previous State (oldValues)</span>
                </div>
                <pre className="p-3 bg-gray-950 text-amber-300 font-mono text-[11px] rounded-lg overflow-x-auto max-h-52 leading-relaxed">
                  {selectedLog.oldValues
                    ? JSON.stringify(selectedLog.oldValues, null, 2)
                    : "// No prior state recorded"}
                </pre>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5 font-bold text-gray-700">
                  <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Committed State (newValues)</span>
                </div>
                <pre className="p-3 bg-gray-950 text-emerald-300 font-mono text-[11px] rounded-lg overflow-x-auto max-h-52 leading-relaxed">
                  {selectedLog.newValues
                    ? JSON.stringify(selectedLog.newValues, null, 2)
                    : "// No delta payload"}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
