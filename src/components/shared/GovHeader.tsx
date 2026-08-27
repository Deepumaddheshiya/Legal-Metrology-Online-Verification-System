"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { NotificationBell } from "./NotificationBell";
import { GlobalSearchModal } from "./GlobalSearch";
import { ROLE_LABELS } from "@/lib/constants";
import { Search, Shield, User, Menu, LogOut, CheckCircle2, ChevronDown, Command } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GovHeaderProps {
  onToggleSidebar?: () => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayUser = (mounted ? currentUser : null) ?? {
    fullName: "Loading…",
    email: "",
    role: "public" as const,
  };
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const router = useRouter();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-[#E5E7EB] px-4 lg:px-8 flex items-center justify-between shadow-xs no-print">
        {/* Left: Mobile Menu Toggle + Portal Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center font-black text-base shadow-sm">
              LM
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#1E3A8A] text-base leading-tight tracking-tight">
                  LMOVS
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 tracking-wider">
                  National Portal
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block leading-tight font-medium">
                Legal Metrology Online Verification & Certification
              </p>
            </div>
          </Link>
        </div>

        {/* Middle: Global Search Bar Trigger (Cmd+K / Ctrl+K) */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div
            onClick={() => setIsSearchOpen(true)}
            className="w-full h-9 pl-9 pr-3 text-xs rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-100/80 hover:border-gray-400 cursor-pointer flex items-center justify-between transition-all group relative"
          >
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <span className="text-gray-400 group-hover:text-gray-600 truncate select-none">
              Search Certificate No., Serial No., GSTIN, or App ID...
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-gray-500 bg-white border border-gray-200 rounded shadow-2xs">
              <span className="text-[9px]">Ctrl</span> K
            </kbd>
          </div>
        </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="h-6 w-px bg-gray-200" />

        {/* User Pill / Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 flex items-center justify-center text-[#1E3A8A] font-bold text-xs">
              {displayUser.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[130px]">
                {displayUser.fullName}
              </p>
              <p className="text-[10px] text-gray-500 font-medium leading-tight truncate max-w-[130px]">
                {ROLE_LABELS[displayUser.role]}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-gray-200 z-50 overflow-hidden py-1">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900">{displayUser.fullName}</p>
                <p className="text-[11px] text-gray-500">{displayUser.email}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Aadhaar & OTP Verified</span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>My Profile & Jurisdiction</span>
                </Link>
                <Link
                  href="/verify"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                >
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span>Public QR Verification Tool</span>
                </Link>
              </div>

              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={async () => {
                    setShowUserDropdown(false);
                    await logout();
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
