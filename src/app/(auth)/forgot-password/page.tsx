"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mockResetUrl, setMockResetUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "trader@business.com" },
  });

  const onSubmit = (values: ForgotValues) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setMockResetUrl(`/reset-password?token=mock_secure_token_${Date.now()}`);
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
            Account Recovery
          </h1>
          <p className="text-xs text-gray-500">
            Legal Metrology Online Verification System
          </p>
        </div>

        <Card className="bg-white shadow-xl border-gray-200">
          <CardHeader className="bg-[#1E3A8A] text-white rounded-t-lg p-5 text-center">
            <CardTitle className="text-white text-base">Reset Your Password</CardTitle>
            <p className="text-blue-200 text-xs mt-0.5">A secure 1-hour reset link will be sent to your registered email</p>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {isSubmitted ? (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Reset Link Dispatched</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  If an account exists with this email, a password reset link has been dispatched.
                </p>

                {mockResetUrl && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-left text-xs space-y-1">
                    <p className="font-semibold text-blue-900">Direct Prototype Link:</p>
                    <Link
                      href={mockResetUrl}
                      className="text-blue-600 hover:underline break-all font-mono"
                    >
                      Click here to reset password directly
                    </Link>
                  </div>
                )}

                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full text-xs font-semibold">
                      Return to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                  <Label required className="text-xs">Registered Email Address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="email"
                      error={errors.email?.message}
                      className="pl-9 text-xs"
                      placeholder="name@business.in or officer@lmovs.gov.in"
                      {...register("email")}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 font-bold shadow-md hover:bg-blue-800"
                  isLoading={isLoading}
                >
                  Send Reset Link
                </Button>

                <div className="text-center">
                  <Link href="/login" className="text-xs text-[#1E3A8A] hover:underline font-medium flex items-center justify-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
