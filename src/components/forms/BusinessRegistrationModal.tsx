"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { INDIAN_STATES } from "@/lib/constants";
import { useMockStore } from "@/lib/mockStore";
import { ShieldCheck, CheckCircle2, Phone, KeyRound, Building2 } from "lucide-react";

interface BusinessRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessRegistrationModal: React.FC<BusinessRegistrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const registerBusiness = useMockStore((s) => s.registerBusiness);
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("7208030455");
  const [email, setEmail] = useState("deepu@a1supermarket.in");
  const [fullName, setFullName] = useState("Deepu Bhai Maddheshiya");
  const [businessName, setBusinessName] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [selectedState, setSelectedState] = useState(INDIAN_STATES[1].id);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 400);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 400);
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const st = INDIAN_STATES.find((s) => s.id === selectedState) || INDIAN_STATES[1];
    registerBusiness({
      fullName: fullName || "Deepu Bhai Maddheshiya",
      email: email || "deepu@a1supermarket.in",
      phone: phone || "7208030455",
      businessName: businessName || "Deepu Supermarket & Retail",
      address: address || "Shop 12, Main Market Road",
      city: city || "Mumbai",
      district: city || "Mumbai",
      stateId: st.id,
      stateName: st.name,
      stateCode: st.code,
      gstin: gstin || "27AABCA1234F1Z8",
    });

    setTimeout(() => {
      setIsLoading(false);
      setIsDone(true);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trader & Business Registration Portal"
      description="Register your commercial establishment for Legal Metrology compliance & digital stamping."
      maxWidth="lg"
    >
      {isDone ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Registration Application Submitted!</h3>
          <p className="text-xs text-gray-600 max-w-sm mx-auto mb-4">
            Your application for <strong className="text-gray-900">{businessName}</strong> has been received with status <span className="text-amber-700 font-bold">PENDING APPROVAL</span> by the State Controller of Legal Metrology.
          </p>
          <Button variant="primary" onClick={onClose}>
            Proceed to Dashboard
          </Button>
        </div>
      ) : (
        <div>
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3 text-xs font-semibold">
            <span className={step >= 1 ? "text-[#1E3A8A] font-bold" : "text-gray-400"}>
              1. Basic Information
            </span>
            <span>→</span>
            <span className={step >= 2 ? "text-[#1E3A8A] font-bold" : "text-gray-400"}>
              2. Mobile OTP (SMS Simulation)
            </span>
            <span>→</span>
            <span className={step >= 3 ? "text-[#1E3A8A] font-bold" : "text-gray-400"}>
              3. Business & GSTIN
            </span>
          </div>

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Label required>Applicant Full Name</Label>
                <Input
                  required
                  placeholder="e.g. Deepu Bhai Maddheshiya"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <Label required>Official Email Address</Label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. deepu@a1supermarket.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label required>Mobile Number for Verification</Label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 rounded-md border border-gray-300 bg-gray-100 text-gray-600 text-xs font-bold">
                    +91
                  </span>
                  <Input
                    required
                    type="tel"
                    placeholder="7208030455"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  A 6-digit one-time password will be sent via SMS gateway.
                </p>
              </div>

              <div className="pt-3 flex justify-end">
                <Button type="submit" variant="primary" isLoading={isLoading} rightIcon={<Phone className="w-4 h-4" />}>
                  Send Verification OTP
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
              <div className="w-12 h-12 bg-blue-100 text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Enter 6-Digit OTP</h4>
              <p className="text-xs text-gray-500">
                OTP sent to <strong className="text-gray-900">+91 {phone || "7208030455"}</strong> (Demo OTP: <strong className="text-[#1E3A8A]">123456</strong>)
              </p>

              <div className="flex justify-center gap-2 my-4">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-10 h-12 text-center text-lg font-bold border border-gray-300 rounded-md focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Change Number
                </Button>
                <Button type="submit" variant="primary" isLoading={isLoading}>
                  Verify & Continue
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div>
                <Label required>Commercial Establishment / Business Name</Label>
                <Input
                  required
                  placeholder="e.g. A1 Supermarket & Retail Chain Ltd."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label required>GSTIN / Tax ID</Label>
                  <Input
                    required
                    placeholder="27AABCA1234F1Z8"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                  />
                </div>
                <div>
                  <Label required>State Jurisdiction</Label>
                  <Select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label required>Full Business Address</Label>
                <Input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop / Unit Number, Commercial Complex, Street, Pincode"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Building2 className="w-4 h-4" />}>
                  Complete Registration
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
};
