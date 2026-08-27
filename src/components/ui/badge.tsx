import React from "react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  status,
  variant,
  children,
  ...props
}) => {
  let styleClasses = "bg-gray-100 text-gray-800 border-gray-200";

  if (status && STATUS_COLORS[status]) {
    const config = STATUS_COLORS[status];
    styleClasses = `${config.bg} ${config.text} ${config.border}`;
  } else if (variant === "success") {
    styleClasses = "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]";
  } else if (variant === "warning") {
    styleClasses = "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]";
  } else if (variant === "danger") {
    styleClasses = "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]";
  } else if (variant === "info") {
    styleClasses = "bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]";
  } else if (variant === "outline") {
    styleClasses = "bg-transparent text-gray-700 border-gray-300";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase",
        styleClasses,
        className
      )}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      {children || (status && STATUS_COLORS[status]?.label) || status}
    </span>
  );
};
