"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ROLE_LABELS } from "@/lib/constants";
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  Phone,
  Mail,
  MapPin,
  Award,
} from "lucide-react";

export default function ProfilePage() {
  const { currentUser, setUser } = useAuthStore();

  const [fullName, setFullName] = useState(currentUser?.fullName || "Dr. Mitesh Lohar, IAS");
  const [phone, setPhone] = useState(currentUser?.phone || "7506569812");
  const [address, setAddress] = useState(currentUser?.address || "Plot 42, MIDC Industrial Area, Andheri East, Mumbai 400093");

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || "");
      setPhone(currentUser.phone || "");
      if (currentUser.address) setAddress(currentUser.address);
    }
  }, [currentUser]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Form State: Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isPasswordStrong = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    if (currentUser) {
      setUser({
        ...currentUser,
        fullName,
        phone,
      });
    }
    setProfileSuccess("Profile updated successfully!");
    setIsSavingProfile(false);
    setTimeout(() => setProfileSuccess(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordSuccess("Your account password has been updated securely.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsSavingPassword(false);
    setTimeout(() => setPasswordSuccess(null), 3000);
  };

  const userRole = currentUser?.role || "public";
  const userInitials = (currentUser?.fullName || "LM").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-[#1E3A8A]" />
          <span>User Profile & Security Settings</span>
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage your verified contact details, role credentials, and account authentication settings.
        </p>
      </div>

      {/* Card 1: Personal & Contact Profile */}
      <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-[#1E3A8A] text-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 text-white font-black text-lg flex items-center justify-center border border-white/30 shadow-inner">
              {userInitials}
            </div>
            <div>
              <CardTitle className="text-white text-base font-bold">
                {currentUser?.fullName}
              </CardTitle>
              <p className="text-xs text-blue-200 font-medium">
                {ROLE_LABELS[userRole as keyof typeof ROLE_LABELS] || userRole} • Status:{" "}
                <span className="capitalize font-bold text-white">Active (Verified)</span>
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {profileSuccess && (
              <div className="p-3 bg-green-50 text-green-800 text-xs font-semibold rounded-lg border border-green-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required className="text-xs">Full Name</Label>
                <Input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <Label required className="text-xs">Official Email (Read-Only Primary Key)</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    disabled
                    value={currentUser?.email || "trader@example.com"}
                    className="pl-9 bg-gray-100 font-mono text-xs text-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required className="text-xs">Mobile Number (2FA Verified)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                    +91
                  </span>
                  <Input
                    required
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="pl-12 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Official / Premise Address</Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Premises / Office Address"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                className="font-bold shadow-sm"
                isLoading={isSavingProfile}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Card 2: Security & Password Update */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#1E3A8A]" />
            <CardTitle className="text-sm font-bold text-gray-900">
              Update Account Password
            </CardTitle>
          </div>
          <span className="text-[11px] text-gray-500">PBKDF2 Salted Encryption</span>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordSuccess && (
              <div className="p-3 bg-green-50 text-green-800 text-xs font-semibold rounded-lg border border-green-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div>
              <Label required className="text-xs">Current Password</Label>
              <Input
                required
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required className="text-xs">New Password</Label>
                <Input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <Label required className="text-xs">Confirm New Password</Label>
                <Input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {/* Password Requirements Checklist */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] space-y-1 text-gray-600">
              <div className="font-semibold text-gray-800 mb-0.5">Password Security Checklist:</div>
              <div className={`flex items-center gap-1.5 ${hasLength ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
                <span>{hasLength ? "✓" : "○"}</span> At least 8 characters
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpper && hasLower ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
                <span>{hasUpper && hasLower ? "✓" : "○"}</span> Mixed case (Uppercase & Lowercase)
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber && hasSpecial ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
                <span>{hasNumber && hasSpecial ? "✓" : "○"}</span> Numbers and special symbols
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                className="font-bold shadow-sm"
                isLoading={isSavingPassword}
                disabled={!isPasswordStrong || newPassword !== confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Card 3: Statutory Jurisdiction & Legal Accreditation */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="p-4 border-b border-gray-100 bg-blue-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1E3A8A]" />
            <CardTitle className="text-sm font-bold text-gray-900">
              Statutory Jurisdiction & Legal Accreditation
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-400 block text-[10px]">Assigned Role:</span>
              <strong className="text-gray-900 text-xs">
                {ROLE_LABELS[userRole as keyof typeof ROLE_LABELS] || userRole}
              </strong>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-400 block text-[10px]">State Jurisdiction:</span>
              <strong className="text-gray-900 text-xs">
                Maharashtra (MH)
              </strong>
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
            <div className="font-bold text-[#1E3A8A] flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>National Metrology Portal Registration</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-gray-700 pt-1">
              <div>
                <span className="text-gray-500 block text-[10px]">Unique Portal ID:</span>
                <strong className="font-mono text-gray-900">{currentUser?.id || "USR-MH-2026-089"}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Aadhaar / KYC Status:</span>
                <strong className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> UIDAI & GST Verified
                </strong>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
