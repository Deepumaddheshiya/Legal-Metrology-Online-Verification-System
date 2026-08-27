"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { DigitalCertificate } from "@/components/certificates/DigitalCertificate";
import { formatDate } from "@/lib/utils";
import { downloadCertificatePdf } from "@/lib/pdf-generator";
import { useMockStore } from "@/lib/mockStore";
import {
  Award,
  Search,
  Eye,
  Download,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { Certificate } from "@/types";

export default function CertificatesPage() {
  const { currentUser } = useAuthStore();
  const certificates = useMockStore((s) => s.certificates);
  const revokeCertificate = useMockStore((s) => s.revokeCertificate);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // Revoke state
  const [revokingCert, setRevokingCert] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);

  const filtered = certificates.filter((cert) => {
    const term = search.toLowerCase();
    const matchesSearch =
      cert.certificateNumber.toLowerCase().includes(term) ||
      cert.businessName.toLowerCase().includes(term) ||
      cert.serialNumber.toLowerCase().includes(term) ||
      cert.instrumentMake.toLowerCase().includes(term) ||
      cert.sealNumber.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRevoke = () => {
    if (!revokingCert || !revokeReason.trim()) return;
    setIsRevoking(true);
    revokeCertificate(revokingCert.id, revokeReason);
    setIsRevoking(false);
    setRevokingCert(null);
    setRevokeReason("");
  };

  const handleDownloadPdf = (cert: Certificate) => {
    downloadCertificatePdf(cert);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-[#1E3A8A]" />
            <span>Official Digital Verification Certificates</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Form 7 statutory verification certificates with tamper-proof SHA-256 and QR code authentication under Legal Metrology Rules, 2011.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="bg-white p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by Certificate No, Business, Serial No, or Seal Stamp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs font-mono"
            />
          </div>
          <div className="sm:col-span-4">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full"
            >
              <option value="all">All Certificate Statuses</option>
              <option value="active">Active & Valid</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Certificates Table */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No verification certificates found.</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Completed inspections with passing test observations will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Certificate Number</th>
                    <th className="p-3.5">Establishment / Owner</th>
                    <th className="p-3.5">Instrument & S/N</th>
                    <th className="p-3.5">Issuing Authority</th>
                    <th className="p-3.5">Seal Stamp No.</th>
                    <th className="p-3.5">Validity Period</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#1E3A8A]">
                        {cert.certificateNumber}
                      </td>
                      <td className="p-3.5">
                        <strong className="text-gray-900 block">{cert.businessName}</strong>
                        <span className="text-[10px] text-gray-500">{cert.gstin || "Verified"}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-gray-800 block">
                          {cert.instrumentMake} {cert.instrumentModel}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          S/N: {cert.serialNumber}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <strong className="text-gray-900 block">{cert.issuedByName}</strong>
                        <span className="text-[10px] text-gray-500">{cert.issuedByDesignation}</span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-gray-700">
                        {cert.sealNumber}
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold block text-gray-900">
                          {formatDate(cert.validFrom)} to {formatDate(cert.validUntil)}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge status={cert.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCert(cert)}
                            title="View Official Certificate"
                            leftIcon={<Eye className="w-3.5 h-3.5 text-gray-600" />}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPdf(cert)}
                            title="Download Official A4 PDF"
                            leftIcon={<Download className="w-3.5 h-3.5 text-blue-700" />}
                          >
                            PDF
                          </Button>
                          {["state_admin", "super_admin", "lmo", "gatc"].includes(currentUser?.role || "") && cert.status !== "revoked" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRevokingCert(cert);
                                setRevokeReason("");
                              }}
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                              title="Revoke Certificate"
                              leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-red-600" />}
                            >
                              Revoke
                            </Button>
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

      {/* Interactive Modal: Digital Certificate View */}
      {selectedCert && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCert(null)}
          title={`Official Statutory Certificate — ${selectedCert.certificateNumber}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <DigitalCertificate certificate={selectedCert} />
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDownloadPdf(selectedCert)}
                leftIcon={<Download className="w-4 h-4 text-white" />}
              >
                Download Official A4 PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedCert(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Revocation Modal */}
      {revokingCert && (
        <Modal
          isOpen={true}
          onClose={() => {
            setRevokingCert(null);
            setRevokeReason("");
          }}
          title={`Statutory Revocation: ${revokingCert.certificateNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
              <strong className="block font-bold">Legal Warning:</strong>
              <p>
                Revoking this certificate immediately invalidates the equipment's verification status, logs a statutory violation event in the National Metrological Audit Registry, cancels all renewal reminders, and notifies the establishment owner.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Mandatory Revocation Reason & Statutory Finding <span className="text-red-500">*</span>
              </label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Tampered lead seal observed during market enforcement inspection, load cell drift exceeded statutory limits..."
                rows={3}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
              <span className="text-[10px] text-gray-400">
                Minimum 10 characters required. This reason is legally visible on the public registry.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRevokingCert(null);
                  setRevokeReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isRevoking}
                disabled={revokeReason.trim().length < 10}
                onClick={handleRevoke}
                className="bg-red-600 hover:bg-red-700 text-white"
                leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
              >
                Confirm Statutory Revocation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
