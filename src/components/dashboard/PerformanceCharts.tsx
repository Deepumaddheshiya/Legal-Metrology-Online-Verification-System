"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMockStore } from "@/lib/mockStore";

export const ApplicationTrendsChart: React.FC = () => {
  const stats = useMockStore((s) => s.getDashboardStats());
  const data = stats.monthlyTrends || [
    { month: "Mar", applied: 120, verified: 115, rejected: 3 },
    { month: "Apr", applied: 145, verified: 140, rejected: 4 },
    { month: "May", applied: 160, verified: 155, rejected: 2 },
    { month: "Jun", applied: 190, verified: 184, rejected: 5 },
    { month: "Jul", applied: 220, verified: 212, rejected: 6 },
    { month: "Aug", applied: 260, verified: 248, rejected: 7 },
  ];

  return (
    <Card className="bg-white">
      <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold text-gray-900">
            Monthly Verification Applications & Throughput
          </CardTitle>
          <p className="text-xs text-gray-500">2026 Legal Metrology Verification Workflow</p>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              <Bar dataKey="applied" name="Applications Received" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="verified" name="Certificates Issued" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const VerificationOutcomeDonut: React.FC = () => {
  const stats = useMockStore((s) => s.getDashboardStats());
  const data = stats.outcomes || [
    { name: "Verified & Passed", value: 92, color: "#059669" },
    { name: "Requires Recalibration", value: 5, color: "#D97706" },
    { name: "Rejected / Tampered", value: 3, color: "#DC2626" },
  ];

  return (
    <Card className="bg-white">
      <CardHeader className="p-4 border-b border-gray-100">
        <CardTitle className="text-sm font-bold text-gray-900">
          Metrology Inspection Outcomes (%)
        </CardTitle>
        <p className="text-xs text-gray-500">Compliance and defect distribution</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`${val}%`, "Share"]}
                contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const DistrictWorkloadChart: React.FC = () => {
  const stats = useMockStore((s) => s.getDashboardStats());
  const data = stats.districtWorkload || [
    { district: "Mumbai Suburban", completed: 420, pending: 45 },
    { district: "Pune", completed: 380, pending: 38 },
    { district: "Thane", completed: 290, pending: 25 },
    { district: "Nagpur", completed: 210, pending: 18 },
    { district: "Nashik", completed: 180, pending: 12 },
  ];

  return (
    <Card className="bg-white">
      <CardHeader className="p-4 border-b border-gray-100">
        <CardTitle className="text-sm font-bold text-gray-900">
          District-wise Pendency & Verifications
        </CardTitle>
        <p className="text-xs text-gray-500">LMO allocation status across jurisdictions</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7280" }} />
              <YAxis type="category" dataKey="district" tick={{ fontSize: 11, fill: "#374151" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="completed" name="Completed" fill="#3B82F6" stackId="a" />
              <Bar dataKey="pending" name="Pending Visit" fill="#D97706" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
