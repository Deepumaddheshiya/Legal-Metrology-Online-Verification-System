import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:border-[#3B82F6] focus-visible:ring-2 focus-visible:ring-[#DBEAFE] disabled:cursor-not-allowed disabled:bg-[#F3F4F6] disabled:text-[#6B7280] transition-colors",
            error && "border-[#DC2626] focus-visible:border-[#DC2626] focus-visible:ring-[#FEE2E2]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#DC2626] font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block text-xs font-semibold uppercase tracking-wider text-[#374151] mb-1.5",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-[#DC2626] ml-1 font-bold">*</span>}
    </label>
  )
);
Label.displayName = "Label";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <div className="w-full">
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#111827] focus-visible:outline-none focus-visible:border-[#3B82F6] focus-visible:ring-2 focus-visible:ring-[#DBEAFE] disabled:cursor-not-allowed disabled:bg-[#F3F4F6] transition-colors",
          error && "border-[#DC2626] focus-visible:border-[#DC2626] focus-visible:ring-[#FEE2E2]",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-[#DC2626] font-medium">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:border-[#3B82F6] focus-visible:ring-2 focus-visible:ring-[#DBEAFE] disabled:cursor-not-allowed disabled:bg-[#F3F4F6] transition-colors",
          error && "border-[#DC2626] focus-visible:border-[#DC2626] focus-visible:ring-[#FEE2E2]",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#DC2626] font-medium">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
