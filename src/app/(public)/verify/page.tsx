"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Search, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PublicVerifySearchPage() {
  const [certInput, setCertInput] = useState("");
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (certInput.trim()) {
      router.push(`/verify/${encodeURIComponent(certInput.trim().replace(/\//g, "-"))}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-6">
        <Link href="/">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Portal Home
          </Button>
        </Link>

        <Card className="bg-white shadow-xl border-gray-200">
          <CardHeader className="bg-[#1E3A8A] text-white rounded-t-lg text-center p-6">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 border border-white/20">
              <QrCode className="w-6 h-6 text-amber-300" />
            </div>
            <CardTitle className="text-white text-xl">
              Public Legal Metrology Verification
            </CardTitle>
            <p className="text-blue-100 text-xs mt-1">
              Verify the authenticity and validity of any weighing scale or measuring instrument certificate in India.
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Enter Certificate Number
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="e.g. MH/2025/WS/48192 or DL/2025/MI/19082"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    className="pl-9 font-mono text-sm uppercase"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Search Central Registry
              </Button>
            </form>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-xs text-[#1E3A8A] space-y-1">
              <strong className="block font-bold">Quick Demo Examples:</strong>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCertInput("MH/2025/WS/48192");
                    router.push("/verify/MH/2025/WS/48192");
                  }}
                  className="bg-white px-2.5 py-1 rounded border border-blue-300 font-mono font-bold hover:bg-blue-100"
                >
                  MH/2025/WS/48192 (Active Avery Scale)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCertInput("MH/2024/WS/00918");
                    router.push("/verify/MH/2024/WS/00918");
                  }}
                  className="bg-white px-2.5 py-1 rounded border border-red-300 text-red-700 font-mono font-bold hover:bg-red-50"
                >
                  MH/2024/WS/00918 (Expired Platform Scale)
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
