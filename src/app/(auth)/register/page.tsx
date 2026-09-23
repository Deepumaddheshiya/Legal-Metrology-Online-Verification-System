"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  Building2,
  UserCheck,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { INDIAN_STATES } from "@/lib/constants";
import { useMockStore } from "@/lib/mockStore";

const registerSchema = z
  .object({
    fullName: z.string().min(1, "Applicant full name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[0-9]/, "Include a number")
      .regex(/[^A-Za-z0-9]/, "Include a special character"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    phone: z.string().min(10, "Enter a valid 10-digit mobile number").max(10),
    businessName: z.string().min(1, "Business / establishment name is required"),
    gstin: z
      .string()
      .regex(/^[0-9A-Z]{15}$/, "GSTIN must be 15 alphanumeric characters")
      .optional()
      .or(z.literal("")),
    tradeLicenseNumber: z.string().optional(),
    address: z.string().min(1, "Premises address is required"),
    city: z.string().min(1, "City is required"),
    pincode: z.string().min(6, "Pincode must be 6 digits").max(6),
    stateName: z.string().min(1, "Please select a state"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const addUser = useMockStore((s) => s.addUser);

  // Wizard Step: 1 = Account, 2 = Phone OTP, 3 = Business Details, 4 = Confirmation
  const [step, setStep] = useState(1);

  // Step 2: Mobile OTP
  const [otp, setOtp] = useState("123456");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [mockOtp, setMockOtp] = useState<string | null>("123456");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Step 3 dependent selects
  const [businessType, setBusinessType] = useState("MANUFACTURING");
  const [district, setDistrict] = useState("Mumbai Suburban");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [applicationReference, setApplicationReference] = useState("");

  const {
    register,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "Deepu Maddheshiya",
      email: "deepu@maddheshiyaindustries.in",
      password: "Password@123",
      confirmPassword: "Password@123",
      phone: "7208030455",
      businessName: "Maddheshiya Precision Weighing Works",
      gstin: "27AAACS1429B1ZB",
      tradeLicenseNumber: "TL-MH-2026-9812",
      address: "Plot 88, Wagle Estate, Road No 16",
      city: "Thane",
      pincode: "400604",
      stateName: INDIAN_STATES[1].name,
    },
  });

  // Step 1 Validation & Proceed
  const handleStep1Next = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const valid = await trigger(["fullName", "email", "password", "confirmPassword"]);
    if (!valid) return;
    setStep(2);
  };

  // Send OTP
  const handleSendOtp = () => {
    const phone = getValues("phone");
    if (!phone || phone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setIsOtpSent(true);
      setMockOtp("123456");
      setOtp("123456");
      setCooldownSeconds(60);
    }, 400);
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP code");
      return;
    }
    setStep(3);
  };

  // Step 3 Final Submit
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const v = getValues();
    const newRef = `REG-MH-${Date.now().toString().slice(-4)}`;
    addUser({
      fullName: v.fullName,
      email: v.email,
      phone: v.phone,
      role: "business_owner",
      status: "pending",
      stateName: v.stateName,
      stateCode: "MH",
      district: district || v.city,
      address: `${v.address}, ${v.city} - ${v.pincode}`,
      businessName: v.businessName,
      gstin: v.gstin || "27AAACS1429B1ZB",
      tradeLicense: v.tradeLicenseNumber || "TL-MH-2026-9812",
    });

    setApplicationReference(newRef);
    setIsSubmitting(false);
    setStep(4);
  };

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordStrong = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl space-y-6">
        <Link href="/login">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Sign In
          </Button>
        </Link>

        {/* Confirmation Screen */}
        {step === 4 ? (
          <Card className="bg-white p-8 text-center border-emerald-200 shadow-xl space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
                Status: Pending State Review
              </span>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Registration Submitted Successfully!
              </h2>
              <p className="text-xs text-gray-500">
                Application Reference: <span className="font-mono font-bold text-gray-800">{applicationReference}</span>
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs space-y-2 text-gray-700">
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-500">Applicant:</span>
                <span className="font-semibold text-gray-900">{getValues("fullName")} ({getValues("email")})</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-500">Establishment:</span>
                <span className="font-semibold text-gray-900">{getValues("businessName")}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-500">Jurisdiction:</span>
                <span className="font-semibold text-gray-900">{district}, {getValues("stateName")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Review Timeline:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 1–2 Business Days
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
              Your profile has been forwarded to the State Controller of Legal Metrology. You can switch to State Admin in the top nav to review and approve this application!
            </p>

            <div className="pt-2">
              <Button
                variant="primary"
                className="w-full font-bold shadow-md hover:bg-blue-800"
                onClick={() => router.push("/login")}
              >
                Proceed to Sign In Gateway
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="bg-white shadow-xl border-gray-200">
            <CardHeader className="bg-[#1E3A8A] text-white rounded-t-lg p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 border border-white/20">
                <Building2 className="w-6 h-6 text-amber-300" />
              </div>
              <CardTitle className="text-white text-xl">
                Commercial Trader & Business Registration
              </CardTitle>
              <p className="text-blue-100 text-xs mt-1">
                Legal Metrology Act, 2009 Digital Verification Portal
              </p>

              {/* Wizard Step Indicator */}
              <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-blue-800/60 text-xs">
                <div className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${step === 1 ? "bg-white text-[#1E3A8A]" : "bg-blue-900/60 text-blue-200"}`}>
                  <span>1</span> Account
                </div>
                <div className="w-4 h-0.5 bg-blue-400/40" />
                <div className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${step === 2 ? "bg-white text-[#1E3A8A]" : "bg-blue-900/60 text-blue-200"}`}>
                  <span>2</span> OTP Verification
                </div>
                <div className="w-4 h-0.5 bg-blue-400/40" />
                <div className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${step === 3 ? "bg-white text-[#1E3A8A]" : "bg-blue-900/60 text-blue-200"}`}>
                  <span>3</span> Establishment
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 1: USER ACCOUNT */}
              {step === 1 && (
                <form onSubmit={handleStep1Next} className="space-y-4" noValidate>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Step 1: Authorized Representative Details
                  </div>

                  <div>
                    <Label required className="text-xs">Applicant Full Name</Label>
                    <Input
                      placeholder="e.g. Deepu Maddheshiya"
                      error={errors.fullName?.message}
                      className="text-xs"
                      {...register("fullName")}
                    />
                  </div>

                  <div>
                    <Label required className="text-xs">Official Email Address</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="email"
                        placeholder="trader@business.com"
                        error={errors.email?.message}
                        className="pl-9 text-xs"
                        {...register("email")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label required className="text-xs">Password</Label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          type="password"
                          placeholder="••••••••••••"
                          error={errors.password?.message}
                          className="pl-9 text-xs font-mono"
                          {...register("password")}
                        />
                      </div>
                    </div>
                    <div>
                      <Label required className="text-xs">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          type="password"
                          placeholder="••••••••••••"
                          error={errors.confirmPassword?.message}
                          className="pl-9 text-xs font-mono"
                          {...register("confirmPassword")}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Checklist */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] space-y-1 text-gray-600">
                    <div className="font-semibold text-gray-800 mb-0.5">Password Security Standards:</div>
                    <div className={`flex items-center gap-1.5 ${hasLength ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
                      <span>{hasLength ? "✓" : "○"}</span> At least 8 characters
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUpper && hasLower ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
                      <span>{hasUpper && hasLower ? "✓" : "○"}</span> Mixed case (Uppercase & Lowercase)
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber && hasSpecial ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
                      <span>{hasNumber && hasSpecial ? "✓" : "○"}</span> Numbers and symbols (!@#$)
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-11 font-bold shadow-md hover:bg-blue-800"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    disabled={!isPasswordStrong || password !== confirmPassword}
                  >
                    Continue to Mobile Verification
                  </Button>
                </form>
              )}

              {/* STEP 2: DUAL OTP VERIFICATION */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Step 2: Mobile Number Authentication
                  </div>

                  {mockOtp && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                      <strong className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Dev Mode — Mock OTP auto-filled:
                      </strong>
                      <span className="font-mono font-bold block mt-1">{mockOtp}</span>
                    </div>
                  )}

                  <div>
                    <Label required className="text-xs">Registered Mobile Number</Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        className="pl-9 text-xs font-mono"
                        error={errors.phone?.message}
                        {...register("phone")}
                        disabled={isOtpSent}
                      />
                    </div>
                  </div>

                  {!isOtpSent ? (
                    <Button
                      type="button"
                      variant="primary"
                      className="w-full h-11 font-bold shadow-md hover:bg-blue-800"
                      isLoading={isSendingOtp}
                      onClick={handleSendOtp}
                    >
                      Send Verification OTP
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label required className="text-xs">Enter 6-Digit OTP</Label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <Input
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
                        type="button"
                        variant="primary"
                        className="w-full h-11 font-bold shadow-md hover:bg-blue-800"
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 6}
                      >
                        Verify & Continue
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={cooldownSeconds > 0 || isSendingOtp}
                          className="text-xs text-gray-600 hover:text-[#1E3A8A] disabled:opacity-50 flex items-center justify-center gap-1 mx-auto"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSendingOtp ? "animate-spin" : ""}`} />
                          {cooldownSeconds > 0
                            ? `Resend OTP in ${cooldownSeconds}s`
                            : "Resend OTP Code"}
                        </button>
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep(1)}
                  >
                    Back to Account Details
                  </Button>
                </div>
              )}

              {/* STEP 3: BUSINESS DETAILS */}
              {step === 3 && (
                <form onSubmit={handleFinalSubmit} className="space-y-4" noValidate>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Step 3: Commercial Establishment Profile
                  </div>

                  <div>
                    <Label required className="text-xs">Business / Trade Establishment Name</Label>
                    <Input
                      placeholder="e.g. Apex Weighing & Industrial Works"
                      error={errors.businessName?.message}
                      className="text-xs"
                      {...register("businessName")}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label required className="text-xs">Business Category</Label>
                      <Select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="text-xs"
                      >
                        <option value="MANUFACTURING">Manufacturing</option>
                        <option value="TRADING">Wholesale / Trading</option>
                        <option value="RETAIL">Retail Counter</option>
                        <option value="PETROL_PUMP">Fuel Station / Petrol Pump</option>
                        <option value="HEALTHCARE">Healthcare & Pharmacy</option>
                        <option value="WAREHOUSE">Logistics & Warehouse</option>
                        <option value="OTHER">Other Commercial Entity</option>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">GSTIN (15-Digit Format)</Label>
                      <Input
                        placeholder="27AABCU9603R1ZM"
                        maxLength={15}
                        error={errors.gstin?.message}
                        className="text-xs font-mono uppercase"
                        {...register("gstin")}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Trade License Number / Shop Act Registration</Label>
                    <Input
                      placeholder="TL-MH-2024-8891"
                      className="text-xs font-mono"
                      {...register("tradeLicenseNumber")}
                    />
                  </div>

                  <div>
                    <Label required className="text-xs">Premises / Establishment Address</Label>
                    <Input
                      placeholder="Plot 42, MIDC Industrial Area, Main Road"
                      error={errors.address?.message}
                      className="text-xs"
                      {...register("address")}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label required className="text-xs">State</Label>
                      <Select
                        {...register("stateName")}
                        className="text-xs"
                      >
                        {INDIAN_STATES.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Label required className="text-xs">District</Label>
                      <Input
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="text-xs"
                        placeholder="District"
                      />
                    </div>

                    <div>
                      <Label required className="text-xs">Pincode</Label>
                      <Input
                        placeholder="411001"
                        maxLength={6}
                        error={errors.pincode?.message}
                        className="text-xs font-mono"
                        {...register("pincode")}
                      />
                    </div>
                  </div>

                  <div>
                    <Label required className="text-xs">City</Label>
                    <Input
                      placeholder="Pune"
                      error={errors.city?.message}
                      className="text-xs"
                      {...register("city")}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1 h-11 font-bold shadow-md hover:bg-blue-800"
                      isLoading={isSubmitting}
                      rightIcon={<UserCheck className="w-4 h-4" />}
                    >
                      Submit Registration
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
