"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { KeyRound, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

const verifyOtpSchema = z.object({
  phone: z.string().min(10, "Enter a valid 10-digit mobile number").max(10),
});

type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone") || "9820012345";

  const {
    register,
    watch,
    getValues,
  } = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phone: initialPhone },
  });

  const [otp, setOtp] = useState("123456");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mockOtp, setMockOtp] = useState<string | null>("123456");

  const [expirySeconds, setExpirySeconds] = useState(300);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpSent && expirySeconds > 0 && !isVerified) {
      interval = setInterval(() => {
        setExpirySeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, expirySeconds, isVerified]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const phone = getValues("phone");
    if (!phone || phone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    setTimeout(() => {
      setIsLoading(false);
      setIsOtpSent(true);
      setSuccessMessage("OTP dispatched via National SMS Gateway.");
      setMockOtp("123456");
      setOtp("123456");
      setExpirySeconds(300);
      setCooldownSeconds(60);
    }, 400);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP code");
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 400);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-black text-lg mx-auto shadow-md">
            LM
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Mobile Number Verification
          </h1>
          <p className="text-xs text-gray-500">
            Legal Metrology Online Verification System (LMOVS)
          </p>
        </div>

        <Card className="bg-white shadow-xl border-gray-200">
          <CardHeader className="bg-[#1E3A8A] text-white rounded-t-lg p-5 text-center">
            <CardTitle className="text-white text-base">Two-Factor Mobile Verification</CardTitle>
            <p className="text-blue-200 text-xs mt-0.5">Secure SMS OTP Authentication</p>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {isVerified ? (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Mobile Verified Successfully</h3>
                <p className="text-xs text-gray-600">
                  Phone number <span className="font-semibold">+91 {watch("phone")}</span> has been authenticated and verified in the central registry.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="primary" className="w-full font-bold">
                      Continue to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {mockOtp && (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 font-mono text-center">
                    Dev Mock OTP: <span className="font-bold text-sm text-blue-950 tracking-widest">{mockOtp}</span>
                  </div>
                )}

                {!isOtpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <Label required className="text-xs">Enter 10-Digit Mobile Number</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                          +91
                        </span>
                        <Input
                          required
                          type="tel"
                          maxLength={10}
                          className="pl-12 text-xs font-mono"
                          placeholder="9876543210"
                          {...register("phone")}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full h-11 font-bold shadow-md hover:bg-blue-800"
                      isLoading={isLoading}
                    >
                      Dispatch SMS OTP
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Mobile: +91 {watch("phone")}</span>
                      <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="text-[#1E3A8A] hover:underline font-medium"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <Label required className="text-xs mb-0">Enter 6-Digit OTP</Label>
                        <span className="text-[11px] font-mono font-medium text-amber-700">
                          Expires in: {formatTime(expirySeconds)}
                        </span>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          required
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          className="pl-9 text-center tracking-[0.5em] font-mono text-base font-bold"
                          placeholder="••••••"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full h-11 font-bold shadow-md hover:bg-blue-800"
                      isLoading={isVerifying}
                      disabled={otp.length !== 6 || expirySeconds === 0}
                    >
                      Verify & Confirm Mobile
                    </Button>

                    <div className="pt-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={cooldownSeconds > 0 || isLoading}
                        className="text-xs text-gray-600 hover:text-[#1E3A8A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        {cooldownSeconds > 0
                          ? `Resend OTP in ${cooldownSeconds}s`
                          : "Resend OTP via SMS"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="pt-2 text-center text-xs text-gray-500 border-t border-gray-100">
                  <Link href="/login" className="text-[#1E3A8A] font-medium hover:underline">
                    Back to Sign In
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
