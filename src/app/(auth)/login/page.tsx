"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { UserRole } from "@/types";
import { Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMockStore } from "@/lib/mockStore";

const DEMO_ACCOUNTS: Record<string, { email: string; pass: string; role: UserRole; name: string }> = {
  super_admin: {
    email: "admin@lmovs.gov.in",
    pass: "Admin@12345",
    role: "super_admin",
    name: "Dr. Mitesh Lohar, IAS (Super Admin DoCA Central)",
  },
  state_admin: {
    email: "stateadmin.mh@lmovs.gov.in",
    pass: "Password@123",
    role: "state_admin",
    name: "Ankita Prasad (State Controller Maharashtra)",
  },
  lmo: {
    email: "lmo.pune@lmovs.gov.in",
    pass: "Password@123",
    role: "lmo",
    name: "Inspector Nadeem Khan (LMO Pune)",
  },
  gatc: {
    email: "gatc.mumbai@lmovs.gov.in",
    pass: "Password@123",
    role: "gatc",
    name: "Mushir Quereshi (GATC Lab Director)",
  },
  business_owner: {
    email: "business@apexscales.in",
    pass: "Password@123",
    role: "business_owner",
    name: "Apex Weighing Industries (Business Owner)",
  },
};

const loginSchema = z.object({
  email: z.string().email("Enter a valid official email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { setUser, switchRole } = useAuthStore();
  const users = useMockStore((s) => s.users);

  const [selectedRole, setSelectedRole] = useState<string>("super_admin");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@lmovs.gov.in",
      password: "Admin@12345",
    },
  });

  const handleRoleSelect = (roleKey: string) => {
    setSelectedRole(roleKey);
    const demo = DEMO_ACCOUNTS[roleKey];
    if (demo) {
      setValue("email", demo.email);
      setValue("password", demo.pass);
    }
  };

  const onSubmit = (values: LoginValues) => {
    setIsLoading(true);

    // Look up user by email in mock store or match selected persona
    const found = users.find((u) => u.email.toLowerCase() === values.email.toLowerCase());
    if (found) {
      setUser(found);
    } else {
      switchRole((selectedRole as UserRole) || "business_owner");
    }

    setTimeout(() => {
      setIsLoading(false);
      router.push(redirectUrl);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Portal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-black text-lg mx-auto shadow-md">
            LM
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            LMOVS National Portal
          </h1>
          <p className="text-xs text-gray-500">
            Legal Metrology Online Verification & Digital Certification System
          </p>
        </div>

        <Card className="bg-white shadow-xl border-gray-200">
          <CardHeader className="bg-[#1E3A8A] text-white rounded-t-lg p-5 text-center">
            <CardTitle className="text-white text-base">Secure Stakeholder Sign-In</CardTitle>
            <p className="text-blue-200 text-xs mt-0.5">Government of India Identity & RBAC Gateway</p>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Quick-fill Role Selector for Testing */}
            <div>
              <Label className="text-xs font-semibold text-gray-700">Quick-Select Stakeholder Persona</Label>
              <Select
                value={selectedRole}
                onChange={(e) => handleRoleSelect(e.target.value)}
                className="text-xs bg-blue-50/50 border-blue-200"
              >
                <option value="super_admin">Central Super Admin (DoCA)</option>
                <option value="state_admin">State Controller (Maharashtra)</option>
                <option value="lmo">Legal Metrology Officer (Pune District)</option>
                <option value="gatc">Govt Approved Test Centre (GATC Lab)</option>
                <option value="business_owner">Business Owner (Apex Weighing)</option>
              </Select>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <Label required className="text-xs">Official Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    error={errors.email?.message}
                    className="pl-9 text-xs"
                    placeholder="officer@lmovs.gov.in"
                    {...register("email")}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label required className="text-xs mb-0">Account Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-[#1E3A8A] hover:underline font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
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

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 font-bold shadow-md hover:bg-blue-800"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Legal Metrology Portal
              </Button>
            </form>

            <div className="pt-2 flex flex-col gap-2 text-center text-xs text-gray-500 border-t border-gray-100">
              <div>
                New Trader or Business Owner?{" "}
                <Link href="/register" className="text-[#1E3A8A] font-bold hover:underline">
                  Register Business
                </Link>
              </div>
              <div>
                Need to verify mobile OTP?{" "}
                <Link href="/verify-otp" className="text-emerald-700 font-semibold hover:underline">
                  Phone OTP Verification
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
