"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusinessRegistrationModal } from "@/components/forms/BusinessRegistrationModal";
import {
  Scale,
  ShieldCheck,
  Award,
  QrCode,
  Search,
  CheckCircle2,
  ArrowRight,
  Building2,
  FileCheck2,
  AlertTriangle,
  FileText,
  Users,
  Smartphone,
  PhoneCall,
  ExternalLink,
} from "lucide-react";

export default function LandingPage() {
  const [certInput, setCertInput] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (certInput.trim()) {
      router.push(`/verify/${encodeURIComponent(certInput.trim())}`);
    } else {
      // If no input, show an error instead of defaulting to a hardcoded cert
      alert("Please enter a certificate number to verify");
    }
  };

  const handleEnterDashboard = () => {
    // Never bypass authentication. Send the user through the real login flow.
    router.push(isAuthenticated ? "/dashboard" : "/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Ministry Top Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center font-black text-lg shadow-sm">
              LM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-[#1E3A8A] tracking-tight">
                  LMOVS
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#1E3A8A]">
                  National Portal
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium">
                Legal Metrology Online Verification & Digital Certification System
              </p>
              <p className="text-[10px] text-gray-500 font-semibold uppercase">
                Department of Consumer Affairs • Govt. of India
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/verify"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Public QR Verify</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRegisterModalOpen(true)}
            >
              Trader Registration
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleEnterDashboard()}
            >
              Portal Login →
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1E3A8A] via-[#1E40AF] to-[#1E3A8A] text-white py-14 px-4 sm:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-200 text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Mandatory Compliance under Legal Metrology Act, 2009</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Unified National System for <br />
              <span className="text-amber-300">Weights & Measures</span> Verification
            </h1>

            <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-2xl">
              A transparent, zero-paperwork digital ecosystem enabling traders to register instruments, schedule officer inspections, receive QR-enabled certificates, and automate mandatory annual re-verification.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="bg-amber-400 text-blue-950 hover:bg-amber-300 font-bold shadow-lg"
                onClick={() => setIsRegisterModalOpen(true)}
                leftIcon={<FileCheck2 className="w-5 h-5" />}
              >
                Register Your Business
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                onClick={() => handleEnterDashboard()}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Enter Trader Dashboard
              </Button>
            </div>
          </div>

          {/* Quick Certificate Search & QR Box */}
          <div className="lg:col-span-5">
            <div className="bg-white text-gray-900 rounded-xl p-6 shadow-2xl border border-blue-200">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                <QrCode className="w-5 h-5 text-[#1E3A8A]" />
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Instant Certificate Authenticity Check
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Citizens & Regulators: verify any weighing scale stamp
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Enter Certificate Number or QR Token
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="e.g. MH/2025/WS/48192"
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      className="pl-9 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  Verify Authenticity Status
                </Button>
              </form>

              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <span className="text-[11px] text-gray-500">Demo sample certificates to test:</span>
                <div className="flex flex-wrap justify-center gap-1.5 mt-1.5">
                  <button
                    onClick={() => {
                      setCertInput("MH/2025/WS/48192");
                      router.push("/verify/MH/2025/WS/48192");
                    }}
                    className="text-[10px] font-mono font-bold text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100"
                  >
                    MH/2025/WS/48192 (Active)
                  </button>
                  <button
                    onClick={() => {
                      setCertInput("MH/2024/WS/00918");
                      router.push("/verify/MH/2024/WS/00918");
                    }}
                    className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 hover:bg-red-100"
                  >
                    MH/2024/WS/00918 (Expired)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live National Compliance Stats */}
      <section className="bg-white border-b border-gray-200 py-6 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 border-r border-gray-100 last:border-0">
            <span className="block text-2xl sm:text-3xl font-black text-[#1E3A8A]">
              1,482,900+
            </span>
            <span className="text-xs text-gray-500 font-semibold uppercase">
              Instruments Verified
            </span>
          </div>
          <div className="p-3 border-r border-gray-100 last:border-0">
            <span className="block text-2xl sm:text-3xl font-black text-emerald-600">
              98.4%
            </span>
            <span className="text-xs text-gray-500 font-semibold uppercase">
              National Compliance Rate
            </span>
          </div>
          <div className="p-3 border-r border-gray-100 last:border-0">
            <span className="block text-2xl sm:text-3xl font-black text-[#1E3A8A]">
              36 States & UTs
            </span>
            <span className="text-xs text-gray-500 font-semibold uppercase">
              Integrated in Single Grid
            </span>
          </div>
          <div className="p-3">
            <span className="block text-2xl sm:text-3xl font-black text-amber-600">
              &lt; 48 Hours
            </span>
            <span className="text-xs text-gray-500 font-semibold uppercase">
              Average Inspection Turnaround
            </span>
          </div>
        </div>
      </section>

      {/* 4 Dedicated Stakeholder Portals */}
      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Role-Based Workspaces
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            Access Your Stakeholder Gateway
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
            Choose your persona below to test or operate the corresponding Legal Metrology workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Business Owner */}
          <div
            onClick={() => handleEnterDashboard()}
            className="group bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:shadow-lg hover:border-[#1E3A8A] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">
                Traders & Business Owners
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Register weighing scales, submit verification requests, download digital certificates, and receive SMS renewal alerts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-bold text-[#1E3A8A] group-hover:underline">
              <span>Open Trader Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Legal Metrology Officer */}
          <div
            onClick={() => handleEnterDashboard()}
            className="group bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:shadow-lg hover:border-emerald-600 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">
                Legal Metrology Officers (LMO)
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Conduct on-site inspections, record Schedule VI test readings, apply digital verification seals, and issue signed certificates.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-bold text-emerald-700 group-hover:underline">
              <span>Open Officer Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* State Admin */}
          <div
            onClick={() => handleEnterDashboard()}
            className="group bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:shadow-lg hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">
                State Controllers & Admins
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Approve new trader accounts, allocate incoming verification applications to zone officers, and monitor district backlogs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-bold text-indigo-700 group-hover:underline">
              <span>Open State Admin Portal</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Super Admin */}
          <div
            onClick={() => handleEnterDashboard()}
            className="group bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:shadow-lg hover:border-amber-600 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">
                DoCA Super Administration
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                National compliance analytics, cross-state performance benchmarks, master fee rule management, and security audit logs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-bold text-amber-700 group-hover:underline">
              <span>Open Super Admin Portal</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Citizen Verification & Complaint Section */}
      <section className="bg-blue-900 text-white py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200 bg-blue-800 px-3 py-1 rounded-full">
              Citizen & Consumer Protection
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-3 mb-2">
              Protecting Consumers from Short-weight & Tampering
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed mb-4">
              Under Indian law, every commercial scale in supermarkets, ration shops, petrol pumps, and jewelry stores must display an official Legal Metrology digital certificate.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Scan the QR code sticker on any weighing machine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verify validity date, capacity, and inspection officer seal</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Lodge immediate online grievance if scale is tampered or unverified</span>
              </div>
            </div>
          </div>

          <div className="bg-white text-gray-900 p-6 rounded-xl shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-gray-900 mb-1">
                Lodge Consumer Grievance
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Report faulty instruments, missing stamps, or overcharging to State Enforcement Officers.
              </p>
            </div>
            <Link href="/complaints">
              <Button variant="danger" className="w-full" leftIcon={<AlertTriangle className="w-4 h-4" />}>
                File Legal Metrology Complaint →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] text-gray-400 text-xs py-8 px-4 sm:px-8 mt-auto border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-white text-sm">
              Legal Metrology Online Verification System (LMOVS)
            </p>
            <p className="text-[11px] text-gray-400">
              Department of Consumer Affairs, Ministry of Consumer Affairs, Food & Public Distribution, Govt. of India
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/verify" className="hover:text-white">
              QR Verification
            </Link>
            <Link href="/complaints" className="hover:text-white">
              Grievance Cell
            </Link>
            <a
              href="https://consumeraffairs.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white flex items-center gap-1"
            >
              <span>DoCA Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Business Registration Modal */}
      <BusinessRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
}
