"use client";

import React from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { ROLE_LABELS } from "@/lib/constants";
import { UserRole } from "@/types";
import { Shield, Globe, UserCheck } from "lucide-react";

export const GovBanner: React.FC = () => {
  const { currentUser, isAuthenticated, isDemoMode, switchRole } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-[#111827] text-white text-xs py-1.5 px-4 border-b border-gray-800 no-print">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* National Flag & Official Portal notice */}
        <div className="flex items-center gap-2 font-medium tracking-wide">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1.5 bg-[#FF9933] inline-block rounded-xs"></span>
            <span className="w-2.5 h-1.5 bg-[#FFFFFF] inline-block rounded-xs"></span>
            <span className="w-2.5 h-1.5 bg-[#138808] inline-block rounded-xs"></span>
          </div>
          <span>GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION</span>
        </div>

        {/* Right controls: Demo Role Switcher (preview only) + Language Switcher */}
        <div className="flex items-center gap-3">
          {mounted && isDemoMode && !isAuthenticated ? (
            /* Demo-only role preview. Grants NO backend access — API routes enforce
               RBAC via the verified JWT cookie regardless of this client-side value. */
            <div
              className="flex items-center gap-1.5 bg-amber-500/20 rounded px-2 py-0.5 border border-amber-500/50"
              title="Demo preview only — no real authentication. The backend still enforces RBAC on every request."
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-amber-300 font-semibold">Demo Role:</span>
              <select
                value={currentUser?.role ?? "public"}
                onChange={(e) => switchRole(e.target.value as UserRole)}
                className="bg-transparent text-white font-semibold text-[11px] focus:outline-none cursor-pointer border-none py-0 pr-2"
              >
                <option value="super_admin" className="bg-gray-900 text-white">
                  Super Admin (DoCA Central)
                </option>
                <option value="state_admin" className="bg-gray-900 text-white">
                  State Admin (Maharashtra)
                </option>
                <option value="lmo" className="bg-gray-900 text-white">
                  Legal Metrology Officer (LMO)
                </option>
                <option value="gatc" className="bg-gray-900 text-white">
                  GATC Test Centre
                </option>
                <option value="business_owner" className="bg-gray-900 text-white">
                  Business Owner (A1 Retail)
                </option>
                <option value="public" className="bg-gray-900 text-white">
                  Citizen / Public Verification
                </option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-gray-800/90 rounded px-2 py-0.5 border border-gray-700">
              <UserCheck className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[11px] text-gray-300 font-semibold">
                {mounted && isAuthenticated ? "Signed in as:" : "Role:"}
              </span>
              <span className="text-white font-semibold text-[11px]">
                {mounted ? ROLE_LABELS[currentUser?.role as UserRole] ?? "Public" : "Public"}
              </span>
            </div>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-[11px] font-semibold text-gray-200 transition-colors border border-gray-700"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>{language === "en" ? "हिन्दी (HI)" : "English (EN)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
