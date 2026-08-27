"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Application } from "@/types";
import { useMockStore } from "@/lib/mockStore";
import { STANDARD_FEE_RATES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { FileCheck, CreditCard, ShieldCheck, CheckCircle2 } from "lucide-react";

const applicationSchema = z.object({
  instrumentId: z.string().min(1, "Please select an instrument"),
  applicationType: z.enum(["new_verification", "re_verification"] as const),
  priority: z.enum(["normal", "urgent"] as const),
  preferredDate: z.string().min(1, "Preferred inspection date is required"),
  notes: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface ApplicationSubmissionFormProps {
  defaultInstrumentId?: string;
  initialInstrumentId?: string;
  initialApplicationType?: "new_verification" | "re_verification";
  onSuccess?: (app: Application) => void;
  onCancel?: () => void;
}

export const ApplicationSubmissionForm: React.FC<ApplicationSubmissionFormProps> = ({
  defaultInstrumentId,
  initialInstrumentId,
  initialApplicationType,
  onSuccess,
  onCancel,
}) => {
  const instruments = useMockStore((s) => s.instruments);
  const createApplication = useMockStore((s) => s.createApplication);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      instrumentId: initialInstrumentId || defaultInstrumentId || (instruments[0]?.id ?? ""),
      applicationType: initialApplicationType || "re_verification",
      priority: "normal",
      preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      notes: "",
    },
  });

  const selectedInstId = watch("instrumentId");
  const selectedInstrument = instruments.find((i) => i.id === selectedInstId) || instruments[0];
  const feeAmount = STANDARD_FEE_RATES[selectedInstrument?.instrumentType || "weighing_scale"] || 750;

  const [isSuccess, setIsSuccess] = useState(false);
  const [createdApp, setCreatedApp] = useState<Application | null>(null);

  const onSubmit = async (values: ApplicationFormValues) => {
    const app = createApplication(values);
    setCreatedApp(app);
    setIsSuccess(true);
  };

  if (isSuccess && createdApp) {
    return (
      <Card className="p-8 text-center bg-white border-emerald-200 shadow-md">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          Verification Application Submitted!
        </h3>
        <p className="text-sm font-mono text-[#1E3A8A] font-bold mb-2">
          Tracking ID: {createdApp.applicationNumber}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto text-xs text-blue-900 text-left space-y-1.5 mb-6">
          <div className="flex justify-between">
            <span className="text-blue-700">Instrument:</span>
            <span className="font-bold">{selectedInstrument?.make} {selectedInstrument?.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Serial No.:</span>
            <span className="font-mono font-bold">{selectedInstrument?.serialNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Statutory Fee Paid:</span>
            <span className="font-bold text-emerald-700">{formatCurrency(feeAmount)} (Instant BharatKosh / UPI Mock)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Payment Reference:</span>
            <span className="font-mono font-bold text-gray-800">{createdApp.paymentReference || "PAY-MH-UPI-09182"}</span>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={() => setIsSuccess(false)}>
            Submit Another Application
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (onSuccess && createdApp) onSuccess(createdApp);
              if (onCancel) onCancel();
            }}
          >
            View Applications Queue
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-md border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-300" />
          <CardTitle className="text-white text-lg">Apply for Legal Metrology Verification</CardTitle>
        </div>
        <CardDescription className="text-blue-100 text-xs">
          Schedule stamping & physical testing with Legal Metrology Officer (LMO) or Govt. Approved Test Centre (GATC).
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label required>Select Instrument for Verification</Label>
              <Select {...register("instrumentId")} error={errors.instrumentId?.message}>
                {instruments.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.make} {inst.model} (S/N: {inst.serialNumber}) — {inst.locationOfUse}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label required>Verification Request Type</Label>
              <Select {...register("applicationType")}>
                <option value="re_verification">Annual Re-Verification (Renewal of Stamp)</option>
                <option value="new_verification">Initial Verification (Newly Installed Machine)</option>
              </Select>
            </div>

            <div>
              <Label required>Priority Level</Label>
              <Select {...register("priority")}>
                <option value="normal">Normal (Scheduled within 7 days)</option>
                <option value="urgent">Urgent (Expiring within 3 days)</option>
              </Select>
            </div>

            <div>
              <Label required>Preferred Inspection Date</Label>
              <Input type="date" error={errors.preferredDate?.message} {...register("preferredDate")} />
            </div>

            <div>
              <Label>Statutory Government Fee</Label>
              <div className="p-2.5 bg-gray-100 border border-gray-300 rounded-md font-mono font-bold text-gray-900 text-sm flex items-center justify-between">
                <span>{formatCurrency(feeAmount)}</span>
                <span className="text-[10px] text-gray-500 font-sans font-normal">Schedule VI Statutory Rate</span>
              </div>
            </div>
          </div>

          <div>
            <Label>Additional Inspection Notes (Optional)</Label>
            <Input
              placeholder="e.g. Best inspection hours: 10 AM - 2 PM, enter via Service Gate 2"
              {...register("notes")}
            />
          </div>

          {/* Payment Simulation Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block font-bold">BharatKosh / Treasury Gateway Simulation Active</strong>
                <span className="text-emerald-700">Fee of {formatCurrency(feeAmount)} will be processed instantly via Mock UPI / Net Banking.</span>
              </div>
            </div>
            <span className="font-bold text-emerald-700 font-mono text-sm">{formatCurrency(feeAmount)}</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            {onCancel && (
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" isLoading={isSubmitting} leftIcon={<ShieldCheck className="w-4 h-4" />}>
              Pay {formatCurrency(feeAmount)} & Submit Application
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
