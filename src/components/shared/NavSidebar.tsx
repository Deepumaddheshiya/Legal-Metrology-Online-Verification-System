"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Scale,
  FileSpreadsheet,
  Award,
  Users,
  ShieldCheck,
  BarChart3,
  History,
  Database,
  CalendarCheck2,
  QrCode,
  AlertCircle,
  UploadCloud,
  FileCheck2,
  Smartphone,
  CheckCircle,
  HelpCircle,
  Building2,
} from "lucide-react";

interface NavSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const NavSidebar: React.FC<NavSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { currentUser } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const role = currentUser?.role ?? "public";

  const getNavLinks = () => {
    switch (role) {
      case "super_admin":
        return [
          { href: "/dashboard", label: "National Overview", icon: LayoutDashboard },
          { href: "/dashboard/admin/states", label: "State Administrations", icon: Building2 },
          { href: "/dashboard/applications", label: "All Applications", icon: FileSpreadsheet },
          { href: "/dashboard/certificates", label: "National Cert Registry", icon: Award },
          { href: "/dashboard/master-data", label: "Master Data & Fees", icon: Database },
          { href: "/dashboard/reports", label: "National Analytics", icon: BarChart3 },
          { href: "/dashboard/audit-logs", label: "Security Audit Trail", icon: History },
          { href: "/dashboard/complaints", label: "Public Grievances", icon: AlertCircle },
        ];
      case "state_admin":
        return [
          { href: "/dashboard", label: "State Dashboard", icon: LayoutDashboard },
          { href: "/dashboard/state-admin/officers", label: "LMO & GATC Directory", icon: Users },
          { href: "/dashboard/state-admin/approvals", label: "Business Approvals", icon: CheckCircle },
          { href: "/dashboard/state-admin/applications", label: "Application Allocation", icon: FileSpreadsheet },
          { href: "/dashboard/certificates", label: "Issued Certificates", icon: Award },
          { href: "/dashboard/reports", label: "State Reports & Export", icon: BarChart3 },
          { href: "/dashboard/audit-logs", label: "Audit Logs", icon: History },
          { href: "/dashboard/complaints", label: "Grievances", icon: AlertCircle },
        ];
      case "lmo":
        return [
          { href: "/dashboard", label: "Officer Workspace", icon: LayoutDashboard },
          { href: "/dashboard/lmo/applications", label: "Assigned Applications", icon: FileSpreadsheet },
          { href: "/dashboard/lmo/schedule", label: "Inspection Calendar", icon: CalendarCheck2 },
          { href: "/dashboard/lmo/verify", label: "Conduct Verification", icon: ShieldCheck },
          { href: "/dashboard/certificates", label: "Stamped Certificates", icon: Award },
          { href: "/dashboard/lmo/field-mode", label: "Mobile Field Mode", icon: Smartphone },
        ];
      case "gatc":
        return [
          { href: "/dashboard", label: "Test Centre Dashboard", icon: LayoutDashboard },
          { href: "/dashboard/gatc/tests", label: "Testing & Calibration", icon: ShieldCheck },
          { href: "/dashboard/certificates", label: "Issued Certificates", icon: Award },
          { href: "/dashboard/profile", label: "Centre Accreditation", icon: Building2 },
          { href: "/dashboard/complaints", label: "Grievances", icon: AlertCircle },
        ];
      case "business_owner":
      default:
        return [
          { href: "/dashboard", label: "Trader Dashboard", icon: LayoutDashboard },
          { href: "/dashboard/instruments", label: "My Instruments", icon: Scale },
          { href: "/dashboard/applications/new", label: "Apply Verification", icon: FileCheck2 },
          { href: "/dashboard/applications", label: "Application Status", icon: FileSpreadsheet },
          { href: "/dashboard/certificates", label: "Digital Certificates", icon: Award },
          { href: "/dashboard/instruments/bulk", label: "Bulk CSV Upload", icon: UploadCloud },
          { href: "/verify", label: "Verify QR Code", icon: QrCode },
          { href: "/dashboard/complaints", label: "Lodge Grievance", icon: AlertCircle },
        ];
    }
  };

  const navLinks = mounted ? getNavLinks() : [];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#1E3A8A] text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 no-print",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Ministry Brand Header */}
        <div className="p-5 border-b border-blue-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
            {/* National emblem representation */}
            <span className="font-black text-[#1E3A8A] text-xs leading-none text-center">
              सत्यमेव<br />जयते
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm leading-tight text-white tracking-wide truncate">
              LEGAL METROLOGY
            </h1>
            <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
              Dept. of Consumer Affairs
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-blue-300">
            Main Menu
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-white/15 text-white shadow-xs border-l-4 border-[#3B82F6] font-bold"
                    : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-[#93C5FD]" : "text-blue-300"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Quick Help & Public Verification Link */}
        <div className="p-4 border-t border-blue-800/80 bg-blue-950/40">
          <Link
            href="/verify"
            className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors justify-center"
          >
            <QrCode className="w-4 h-4" />
            <span>Public QR Scanner</span>
          </Link>
          <div className="mt-3 text-center">
            <p className="text-[10px] text-blue-300 font-medium">
              National Metrology Helpline
            </p>
            <p className="text-xs font-bold text-white tracking-wider">
              1800-11-4000 (Toll Free)
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
