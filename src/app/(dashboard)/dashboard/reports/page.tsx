"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { BarChart3, Download, Printer, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useMockStore } from "@/lib/mockStore";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("monthly_summary");
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-31");
  const [isExporting, setIsExporting] = useState(false);

  const applications = useMockStore((s) => s.applications);
  const certificates = useMockStore((s) => s.certificates);
  const users = useMockStore((s) => s.users);

  const officers = users.filter((u) => u.role === "lmo" || u.role === "gatc");

  const totalVerified = certificates.filter((c) => c.status === "active").length;
  const totalRejected = applications.filter((a) => a.status === "rejected").length;
  const totalRevenue = applications.reduce((sum, a) => sum + (a.feePaid ? a.feeAmount : 0), 0);

  const districtRows = [
    { id: "d1", district: "Mumbai City", verified: 34, rejected: 2, revenue: 68000, compliance: "94.4%" },
    { id: "d2", district: "Mumbai Suburban", verified: 52, rejected: 3, revenue: 104000, compliance: "94.5%" },
    { id: "d3", district: "Pune", verified: 28, rejected: 1, revenue: 56000, compliance: "96.5%" },
    { id: "d4", district: "Nagpur", verified: 19, rejected: 2, revenue: 38000, compliance: "90.4%" },
    { id: "d5", district: "Thane", verified: 22, rejected: 1, revenue: 44000, compliance: "95.6%" },
  ];

  const officerRows = officers.map((o, idx) => ({
    id: o.id,
    name: o.fullName,
    employeeId: `LMO-MH-${1000 + idx}`,
    district: o.district || "Pune",
    totalAssigned: 12 + idx * 4,
    verified: 10 + idx * 3,
    rejected: idx % 2 === 0 ? 1 : 0,
    pending: 2 + idx,
    completionRate: `${Math.round(((10 + idx * 3) / (12 + idx * 4)) * 100)}%`,
  }));

  const handleExportCsv = () => {
    setIsExporting(true);
    let csvContent = "data:text/csv;charset=utf-8,";
    if (reportType === "officer_productivity") {
      csvContent += "Officer Name,Employee ID,District,Assigned Tasks,Verified,Rejected,Pending,Completion Rate\n";
      officerRows.forEach((r) => {
        csvContent += `"${r.name}","${r.employeeId}","${r.district}",${r.totalAssigned},${r.verified},${r.rejected},${r.pending},"${r.completionRate}"\n`;
      });
    } else {
      csvContent += "District,Verified Units,Rejected Units,Revenue (INR),Compliance Rate\n";
      districtRows.forEach((r) => {
        csvContent += `"${r.district}",${r.verified},${r.rejected},${r.revenue},"${r.compliance}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lmovs_report_${reportType}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#1E3A8A]" />
            <span>Statutory Reports & Analytics Export</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Generate state-level and national verification compliance reports for regulatory audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Report
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isExporting}
            onClick={handleExportCsv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Filter Controls */}
      <Card className="bg-white p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Report Category</Label>
            <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="monthly_summary">Monthly Verification & Stamping Summary</option>
              <option value="district_compliance">District-wise Compliance & Pendency</option>
              <option value="revenue_fees">Statutory Fee & Revenue Collection</option>
              <option value="officer_productivity">LMO Inspection Productivity Audit</option>
            </Select>
          </div>
          <div>
            <Label>From Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>To Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Generated Report View */}
      <Card className="bg-white">
        <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900">
              Maharashtra Verification Summary ({startDate} to {endDate})
            </CardTitle>
            <p className="text-xs text-gray-500">Official Directorate of Legal Metrology Report</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Total Revenue: {formatCurrency(totalRevenue || 310000)}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {reportType === "officer_productivity" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Officer Name & ID</th>
                    <th className="p-3.5">District Jurisdiction</th>
                    <th className="p-3.5">Assigned Tasks</th>
                    <th className="p-3.5">Verified & Stamped</th>
                    <th className="p-3.5">Rejected</th>
                    <th className="p-3.5">Pending</th>
                    <th className="p-3.5 text-right">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {officerRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3.5 font-bold text-gray-900">
                        {row.name}
                        <span className="block text-[10px] text-gray-400 font-mono">{row.employeeId}</span>
                      </td>
                      <td className="p-3.5 text-gray-700">{row.district}</td>
                      <td className="p-3.5 font-semibold text-blue-800">{row.totalAssigned} Tasks</td>
                      <td className="p-3.5 font-semibold text-emerald-700">{row.verified} Units</td>
                      <td className="p-3.5 text-red-600 font-medium">{row.rejected}</td>
                      <td className="p-3.5 text-amber-600 font-medium">{row.pending}</td>
                      <td className="p-3.5 text-right font-bold text-gray-900">{row.completionRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">District Jurisdiction</th>
                    <th className="p-3.5">Verified & Stamped</th>
                    <th className="p-3.5">Rejected / Defective</th>
                    <th className="p-3.5">Fee Revenue</th>
                    <th className="p-3.5 text-right">Compliance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {districtRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3.5 font-bold text-gray-900">{row.district}</td>
                      <td className="p-3.5 font-semibold text-emerald-700">{row.verified} Units</td>
                      <td className="p-3.5 text-red-600 font-medium">{row.rejected} Units</td>
                      <td className="p-3.5 font-mono text-[#1E3A8A] font-bold">
                        {formatCurrency(row.revenue)}
                      </td>
                      <td className="p-3.5 text-right font-bold text-gray-900">{row.compliance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
