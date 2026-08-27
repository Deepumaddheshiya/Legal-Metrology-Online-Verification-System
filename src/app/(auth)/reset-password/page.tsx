"use client";

import React, { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Lock, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[0-9]/, "Include a number")
      .regex(/[^A-Za-z0-9]/, "Include a special character"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "NewPassword@123", confirmPassword: "NewPassword@123" },
  });

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isStrong = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const onSubmit = (values: ResetValues) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-black text-lg mx-auto shadow-md">
            LM
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs text-gray-500">
            Legal Metrology Online Verification System
          </p>
        </div>

        <Card className="bg-white shadow-xl border-gray-200">
          <CardHeader className="bg-[#1E3A8A] text-white rounded-t-lg p-5 text-center">
            <CardTitle className="text-white text-base">Set New Credentials</CardTitle>
            <p className="text-blue-200 text-xs mt-0.5">National Security Password Standards</p>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {isSuccess ? (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Password Updated</h3>
                <p className="text-xs text-gray-600">
                  Your password has been successfully reset. You can now log into your account.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="primary" className="w-full font-bold">
                      Go to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                  <Label required className="text-xs">New Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      error={errors.password?.message}
                      className="pl-9 text-xs font-mono"
                      placeholder="••••••••••••"
                      {...register("password")}
                    />
                  </div>
                </div>

                <div>
                  <Label required className="text-xs">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      error={errors.confirmPassword?.message}
                      className="pl-9 text-xs font-mono"
                      placeholder="••••••••••••"
                      {...register("confirmPassword")}
                    />
                  </div>
                </div>

                {/* Password Requirements Checklist */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] space-y-1 text-gray-600">
                  <div className="font-semibold text-gray-800 mb-1">Password Requirements:</div>
                  <div className={`flex items-center gap-1.5 ${hasLength ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
                    <span>{hasLength ? "✓" : "○"}</span> At least 8 characters
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
                    <span>{hasUpper ? "✓" : "○"}</span> At least one uppercase letter (A-Z)
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
                    <span>{hasLower ? "✓" : "○"}</span> At least one lowercase letter (a-z)
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
                    <span>{hasNumber ? "✓" : "○"}</span> At least one number (0-9)
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
                    <span>{hasSpecial ? "✓" : "○"}</span> At least one special character (!@#$%^&*)
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 font-bold shadow-md hover:bg-blue-800"
                  isLoading={isLoading}
                  disabled={!isStrong || password !== confirmPassword}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  Reset Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
