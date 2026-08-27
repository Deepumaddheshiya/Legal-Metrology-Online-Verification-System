import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "primary" | "success" | "warning" | "danger" | "neutral";
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "neutral",
  className,
}) => {
  const variantStyles = {
    primary: "border-l-4 border-l-[#1E3A8A] text-[#1E3A8A]",
    success: "border-l-4 border-l-[#059669] text-[#059669]",
    warning: "border-l-4 border-l-[#D97706] text-[#D97706]",
    danger: "border-l-4 border-l-[#DC2626] text-[#DC2626]",
    neutral: "border-l-4 border-l-gray-400 text-gray-700",
  };

  const iconBgStyles = {
    primary: "bg-blue-50 text-[#1E3A8A]",
    success: "bg-emerald-50 text-[#059669]",
    warning: "bg-amber-50 text-[#D97706]",
    danger: "bg-red-50 text-[#DC2626]",
    neutral: "bg-gray-100 text-gray-700",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md transition-all",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {title}
        </span>
        <div className={cn("p-2.5 rounded-lg", iconBgStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-black text-gray-900 tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-bold gap-0.5",
              trend.isPositive ? "text-emerald-600" : "text-red-600"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs text-gray-500 font-medium">{description}</p>
      )}
    </div>
  );
};
