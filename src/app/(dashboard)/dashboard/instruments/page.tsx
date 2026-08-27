"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, getDaysUntilExpiry } from "@/lib/utils";
import { InstrumentRegistrationForm } from "@/components/forms/InstrumentRegistrationForm";
import { BulkUploadModal } from "@/components/forms/BulkUploadModal";
import { useMockStore } from "@/lib/mockStore";
import {
  Scale,
  PlusCircle,
  UploadCloud,
  Search,
  Award,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export default function InstrumentsPage() {
  const instruments = useMockStore((s) => s.instruments);
  const certificates = useMockStore((s) => s.certificates);
  const applications = useMockStore((s) => s.applications);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const enrichedInstruments = instruments.map((inst) => {
    const cert = certificates.find((c) => c.instrumentId === inst.id && c.status === "active") ||
      certificates.find((c) => c.instrumentId === inst.id);
    const latestApp = applications.find((a) => a.instrumentId === inst.id);

    return {
      ...inst,
      latestCertificate: cert || null,
      latestApplication: latestApp || null,
    };
  });

  const filtered = enrichedInstruments.filter((i) => {
    const matchesSearch =
      i.make.toLowerCase().includes(search.toLowerCase()) ||
      i.model.toLowerCase().includes(search.toLowerCase()) ||
      i.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.locationOfUse.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === "all" || i.instrumentType === filterType;

    let matchesStatus = true;
    if (filterStatus !== "all") {
      const hasCert = Boolean(i.latestCertificate);
      const daysInfo = hasCert ? getDaysUntilExpiry(i.latestCertificate!.validUntil) : null;

      if (filterStatus === "verified") {
        matchesStatus = Boolean(hasCert && !daysInfo?.isExpired && !daysInfo?.isDueSoon);
      } else if (filterStatus === "due_soon") {
        matchesStatus = Boolean(hasCert && daysInfo?.isDueSoon);
      } else if (filterStatus === "expired") {
        matchesStatus = Boolean(hasCert && daysInfo?.isExpired);
      } else if (filterStatus === "unverified") {
        matchesStatus = !hasCert;
      }
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#1E3A8A]" />
            <span>Weighing & Measuring Instruments Repository</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your registered instruments, technical specifications, calibration status, and verification renewals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBulkOpen(true)}
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Bulk CSV Upload
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Instrument
          </Button>
        </div>
      </div>

      {isAddOpen && (
        <InstrumentRegistrationForm
          onSuccess={() => setIsAddOpen(false)}
          onCancel={() => setIsAddOpen(false)}
        />
      )}

      <BulkUploadModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
      />

      {/* Filter and Search Bar */}
      <Card className="bg-white p-4 border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by Make, Model, Serial Number, or Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs"
            >
              <option value="all">All Classifications</option>
              <option value="weighing_scale">Weighing Scales</option>
              <option value="measuring_instrument">Measuring Instruments</option>
              <option value="weight">Standard Weights</option>
              <option value="measure">Capacity Measures</option>
            </Select>
          </div>
          <div className="sm:col-span-3">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified / Active</option>
              <option value="due_soon">Renewal Due Soon</option>
              <option value="expired">Expired Certificate</option>
              <option value="unverified">Unverified (No Cert)</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Instruments Grid / Table */}
      <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Make & Model</th>
                  <th className="p-3.5">Serial Number</th>
                  <th className="p-3.5">Classification</th>
                  <th className="p-3.5">Capacity / (e)</th>
                  <th className="p-3.5">Premise Location</th>
                  <th className="p-3.5">Verification Validity</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-gray-500">
                      <Scale className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="font-semibold text-gray-800 text-sm">No instruments found</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Register a new weighing or measuring instrument to start verification tracking.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((inst) => {
                    const cert = inst.latestCertificate;
                    const { isDueSoon, isExpired, days } = cert
                      ? getDaysUntilExpiry(cert.validUntil)
                      : { isDueSoon: false, isExpired: false, days: 0 };

                    const isUnderVerification =
                      inst.latestApplication &&
                      ["submitted", "assigned", "scheduled", "in_progress"].includes(
                        inst.latestApplication.status
                      );

                    return (
                      <tr key={inst.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-500 overflow-hidden">
                              {inst.photoUrl ? (
                                <img
                                  src={inst.photoUrl}
                                  alt={inst.make}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Scale className="w-4 h-4 text-[#1E3A8A]" />
                              )}
                            </div>
                            <div>
                              <strong className="text-gray-900 block text-xs">
                                {inst.make} {inst.model}
                              </strong>
                              <span className="text-[10px] text-gray-500">{inst.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#1E3A8A]">
                          {inst.serialNumber}
                        </td>
                        <td className="p-3.5 capitalize text-gray-700">
                          {inst.instrumentType.replace("_", " ")}
                        </td>
                        <td className="p-3.5 font-medium">
                          {inst.capacity} <span className="text-gray-400">({inst.leastCount})</span>
                        </td>
                        <td className="p-3.5 text-gray-600">{inst.locationOfUse}</td>
                        <td className="p-3.5">
                          {cert ? (
                            <>
                              <span className="font-semibold block text-gray-900">
                                {formatDate(cert.validUntil)}
                              </span>
                              {isExpired ? (
                                <span className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                                  <XCircle className="w-3 h-3" /> Expired ({Math.abs(days)}d ago)
                                </span>
                              ) : isDueSoon ? (
                                <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Due in {days} days
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Verified (Valid)
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">No certificate</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {isUnderVerification ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-[#1E3A8A] border border-blue-200">
                              In Progress
                            </span>
                          ) : isExpired ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-200">
                              Expired
                            </span>
                          ) : isDueSoon ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                              Due Soon
                            </span>
                          ) : cert ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 border border-gray-200">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/dashboard/instruments/${inst.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                              >
                                View
                              </Button>
                            </Link>
                            {!cert || isDueSoon || isExpired ? (
                              <Link href={`/dashboard/applications/new?instrumentId=${inst.id}`}>
                                <Button variant="primary" size="sm" className="font-bold">
                                  {isDueSoon || isExpired ? "Renew" : "Verify"}
                                </Button>
                              </Link>
                            ) : (
                              <Link href="/dashboard/certificates">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  leftIcon={<Award className="w-3.5 h-3.5 text-[#1E3A8A]" />}
                                >
                                  Cert
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
