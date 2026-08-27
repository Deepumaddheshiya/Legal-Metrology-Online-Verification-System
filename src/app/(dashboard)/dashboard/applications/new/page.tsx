"use client";

import React, { Suspense } from "react";
import { ApplicationSubmissionForm } from "@/components/forms/ApplicationSubmissionForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function NewApplicationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedInstrumentId = searchParams.get("instrumentId") || undefined;
  const preselectedType = (searchParams.get("type") as "new_verification" | "re_verification") || undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button
        variant="outline"
        size="sm"
        leftIcon={<ArrowLeft className="w-4 h-4" />}
        onClick={() => router.back()}
      >
        Back to Dashboard
      </Button>

      <ApplicationSubmissionForm
        initialInstrumentId={preselectedInstrumentId}
        initialApplicationType={preselectedType}
        onSuccess={() => router.push("/dashboard/applications")}
        onCancel={() => router.push("/dashboard/applications")}
      />
    </div>
  );
}

export default function NewApplicationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-gray-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#1E3A8A] mb-2" />
          <p className="text-xs">Loading application form...</p>
        </div>
      }
    >
      <NewApplicationContent />
    </Suspense>
  );
}

