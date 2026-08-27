"use client";

import React, { useState, useRef, useEffect } from "react";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { Bell, CheckCheck, Clock, AlertTriangle, FileCheck, ShieldAlert } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30s live poll

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "verification_due":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case "certificate_issued":
        return <FileCheck className="w-4 h-4 text-emerald-600" />;
      case "system_alert":
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {mounted && unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 bg-[#1E3A8A] text-white">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="font-semibold text-sm">System Alerts & Notifications</span>
            </div>
            {mounted && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-200 hover:text-white flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 transition-colors cursor-pointer hover:bg-gray-50 flex items-start gap-3 ${
                    !n.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white shadow-xs border border-gray-100 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-center">
            <Link
              href="/dashboard/applications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-[#1E3A8A] hover:underline"
            >
              View Verification Workflow Queue →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
