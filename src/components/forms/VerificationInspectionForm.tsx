"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label, Input, Textarea, Select } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignatureCanvas } from "@/components/ui/SignatureCanvas";
import { DigitalCertificate } from "@/components/certificates/DigitalCertificate";
import { generateSealNumber, formatDate } from "@/lib/utils";
import { useMockStore } from "@/lib/mockStore";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Award,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface VerificationInspectionFormProps {
  application: any;
  onCompleted?: (certificate?: any) => void;
}

const INITIAL_READINGS = [
  {
    parameter: "Visual Condition & Model Approval Plate",
    standardValue: "Must have DoCA approval stamp & intact security wire",
    observedValue: "Plate Intact, Legible & Verified",
    tolerance: "Strict Inspection",
    status: "pass" as const,
  },
  {
    parameter: "Zero-Load Setting & Sensitivity Test",
    standardValue: "0.000 kg",
    observedValue: "0.000 kg",
    tolerance: "± 0.5 e",
    status: "pass" as const,
  },
  {
    parameter: "Corner Load / Eccentricity Test (1/3 Max)",
    standardValue: "10.000 kg",
    observedValue: "10.002 kg",
    tolerance: "± 1.0 e",
    status: "pass" as const,
  },
  {
    parameter: "Maximum Capacity Load Test (Max)",
    standardValue: "30.000 kg",
    observedValue: "30.004 kg",
    tolerance: "± 2.0 e",
    status: "pass" as const,
  },
  {
    parameter: "Repeatability Test (3 Consecutive Loads)",
    standardValue: "15.000 kg",
    observedValue: "15.001 kg",
    tolerance: "± 1.0 e",
    status: "pass" as const,
  },
];

const inspectionSchema = z
  .object({
    readings: z.array(
      z.object({
        parameter: z.string(),
        standardValue: z.string(),
        observedValue: z.string().min(1, "Observed indication is required"),
        tolerance: z.string(),
        status: z.enum(["pass", "fail"]),
      })
    ),
    standardWeightsRef: z.string().min(1, "Reference weights & calibration cert is required"),
    result: z.enum(["pass", "fail", "conditional"]),
    sealNumber: z.string().optional(),
    defectsFound: z.string().optional(),
    correctiveAction: z.string().optional(),
    remarks: z.string().min(1, "Inspector observations / remarks are required"),
  })
  .superRefine((val, ctx) => {
    if (val.result === "pass" && !val.sealNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sealNumber"],
        message: "Official seal number is required for a PASS verification",
      });
    }
    if ((val.result === "fail" || val.result === "conditional") && !val.defectsFound?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["defectsFound"],
        message: "Defects found is required for a non-pass result",
      });
    }
  });

type InspectionValues = z.infer<typeof inspectionSchema>;

export const VerificationInspectionForm: React.FC<VerificationInspectionFormProps> = ({
  application,
  onCompleted,
}) => {
  const conductVerification = useMockStore((s) => s.conductVerification);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InspectionValues>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      readings: INITIAL_READINGS,
      standardWeightsRef: "Standard Weights Set Class F1 (Cert: NABL/MH/2026/0491)",
      result: "pass",
      sealNumber: generateSealNumber("MH"),
      defectsFound: "",
      correctiveAction: "",
      remarks:
        "Instrument tested in accordance with General Rules, 2011 Schedule VI. Passed all statutory limits.",
    },
  });

  const { fields } = useFieldArray({ control, name: "readings" });
  const result = watch("result");

  const handleToggleStatus = (index: number) => {
    const current = watch(`readings.${index}.status`);
    setValue(`readings.${index}.status`, current === "pass" ? "fail" : "pass", {
      shouldValidate: true,
    });
  };

  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [issuedCertificate, setIssuedCertificate] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const onSaveObservations = async (values: InspectionValues) => {
    setFormError(null);
    setFormSuccess(null);

    const anyFail = values.readings.some((r) => r.status === "fail");
    const effectiveResult: "pass" | "fail" | "conditional" =
      anyFail && values.result !== "fail" ? "fail" : values.result;

    if (effectiveResult === "pass" || effectiveResult === "conditional") {
      setFormSuccess("Physical observations recorded. Please endorse with digital signature.");
      setCurrentStep(2);
    } else {
      conductVerification(application.id, {
        result: "fail",
        readings: values.readings,
        remarks: values.remarks,
        defectsFound: values.defectsFound || "Exceeded MPE tolerance limits during load test.",
        correctiveAction: values.correctiveAction || "Re-calibration and realignment required.",
      });
      setFormSuccess("Defect notice recorded & dispatched to business owner.");
      if (onCompleted) onCompleted();
    }
  };

  const handleFinalSubmit = async () => {
    if (!signatureDataUrl) {
      setFormError("Inspector digital signature is required before certificate generation.");
      return;
    }

    const res = conductVerification(application.id, {
      result: "pass",
      readings: watch("readings"),
      remarks: watch("remarks"),
      sealNumber: watch("sealNumber"),
      signature: signatureDataUrl,
    });

    if (res.success && res.certificate) {
      setIssuedCertificate(res.certificate);
      setCurrentStep(3);
      if (onCompleted) {
        onCompleted(res.certificate);
      }
    } else {
      setFormError("Failed to generate certificate.");
    }
  };

  if (currentStep === 3 && issuedCertificate) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div>
              <h3 className="text-base font-bold text-emerald-900">
                Digital Verification Certificate Issued Successfully!
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Official certificate <strong className="font-mono">{issuedCertificate.certificateNumber}</strong> with Seal{" "}
                <strong className="font-mono">{issuedCertificate.sealNumber}</strong> registered in Central National Database.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentStep(1);
                setIssuedCertificate(null);
                setSignatureDataUrl(null);
              }}
            >
              Conduct Another Inspection
            </Button>
          </div>
        </div>

        <DigitalCertificate certificate={issuedCertificate} />
      </div>
    );
  }

  return (
    <Card className="bg-white shadow-md border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-white text-lg">
              {currentStep === 1
                ? "Official Legal Metrology Inspection & Test Observations Form"
                : "Inspector Endorsement & Digital Signature"}
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-white/10 text-white border-white/30">
            Step {currentStep} of 2
          </Badge>
        </div>
        <CardDescription className="text-blue-100 text-xs">
          {currentStep === 1
            ? "Record statutory Schedule VI test observations as per General Rules, 2011"
            : "Endorse findings with your official digital signature to issue the certificate"}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {formSuccess && (
          <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-emerald-800">{formSuccess}</span>
          </div>
        )}

        {formError && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-red-800">{formError}</span>
          </div>
        )}

        {currentStep === 1 ? (
          <form onSubmit={handleSubmit(onSaveObservations)} className="space-y-6" noValidate>
            {/* Target Instrument Header */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block">Instrument:</span>
                <strong className="text-gray-900">{application.instrument?.make} {application.instrument?.model}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Serial Number:</span>
                <strong className="text-gray-900 font-mono">{application.instrument?.serialNumber}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Capacity / Division:</span>
                <strong className="text-gray-900">{application.instrument?.capacity} (e = {application.instrument?.leastCount})</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Location of Use:</span>
                <strong className="text-gray-900">{application.instrument?.locationOfUse || "Shop Floor"}</strong>
              </div>
            </div>

            {/* Standard Test Weights Info */}
            <div>
              <Label required>Standard Reference Weights & Calibration Certificate</Label>
              <Input
                error={errors.standardWeightsRef?.message}
                {...register("standardWeightsRef")}
                placeholder="e.g. Class F1 Stainless Steel Test Weights (NABL/MH/2026/0491)"
              />
            </div>

            {/* Schedule VI Physical Test Protocol Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label required>Schedule VI Statutory Test Observations & Error Verification</Label>
                <span className="text-[11px] text-gray-500 italic">
                  Toggle pass/fail status on individual checkpoints
                </span>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3">Test Parameter / Checkpoint</th>
                      <th className="p-3">Nominal / Standard Value</th>
                      <th className="p-3">Observed Indication</th>
                      <th className="p-3">Maximum Permissible Error (MPE)</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fields.map((field, idx) => (
                      <tr key={field.id} className={watch(`readings.${idx}.status`) === "fail" ? "bg-red-50/50" : ""}>
                        <td className="p-3 font-medium text-gray-900">{watch(`readings.${idx}.parameter`)}</td>
                        <td className="p-3 text-gray-600 font-mono">{watch(`readings.${idx}.standardValue`)}</td>
                        <td className="p-3">
                          <Input
                            className="h-8 text-xs py-1"
                            error={errors.readings?.[idx]?.observedValue?.message}
                            {...register(`readings.${idx}.observedValue` as const)}
                          />
                        </td>
                        <td className="p-3 text-gray-500 font-mono">{watch(`readings.${idx}.tolerance`)}</td>
                        <td className="p-3 text-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(idx)}
                            className={
                              watch(`readings.${idx}.status`) === "pass"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                                : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                            }
                          >
                            {watch(`readings.${idx}.status`) === "pass" ? "PASS" : "FAIL"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Test Outcome & Stamping Seal Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Verification Test Result</Label>
                <Select {...register("result")}>
                  <option value="pass">PASS (Statutory Verification Approved)</option>
                  <option value="fail">FAIL (Non-Compliant / Rejected)</option>
                  <option value="conditional">CONDITIONAL (Minor Rectification Needed)</option>
                </Select>
              </div>

              {result === "pass" ? (
                <div>
                  <Label required>Official Lead / Punch Seal Number</Label>
                  <Input
                    error={errors.sealNumber?.message}
                    {...register("sealNumber")}
                    placeholder="e.g. MH/PUN/2026/0892"
                  />
                </div>
              ) : (
                <div>
                  <Label required>Defects Found</Label>
                  <Input
                    error={errors.defectsFound?.message}
                    {...register("defectsFound")}
                    placeholder="e.g. Eccentric error +12g exceeded 1.0 e tolerance limit"
                  />
                </div>
              )}
            </div>

            {result === "fail" && (
              <div>
                <Label>Corrective Action Required from Business Owner</Label>
                <Input
                  {...register("correctiveAction")}
                  placeholder="e.g. Re-calibration and load cell realignment by authorized technician."
                />
              </div>
            )}

            <div>
              <Label required>Inspector Observations & Remarks</Label>
              <Textarea
                rows={2}
                error={errors.remarks?.message}
                {...register("remarks")}
                placeholder="Record any physical conditions, environmental factors, or statutory remarks."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                variant={result === "pass" ? "primary" : "outline"}
                disabled={isSubmitting}
                className={result === "fail" ? "text-red-600 border-red-300 hover:bg-red-50" : ""}
                leftIcon={result === "pass" ? <ArrowRight className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              >
                {result === "pass"
                  ? "Save Observations & Proceed to Sign"
                  : "Submit Non-Compliance Notice (Fail)"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Step 2: Digital Signature Endorsement */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs text-[#1E3A8A] space-y-1">
              <strong className="block font-bold">Endorsement Protocol under Legal Metrology Act, 2009:</strong>
              <p>
                By signing below, you certify that you have physically inspected {application.instrument?.make} (SN: {application.instrument?.serialNumber}) at {application.business?.businessName || application.businessName}, applied Lead/Punch Seal {watch("sealNumber")}, and that the instrument complies with Schedule VI statutory standards.
              </p>
            </div>

            <SignatureCanvas
              onSignatureChange={(sig) => setSignatureDataUrl(sig)}
              title="Legal Metrology Officer / Verifier Digital Signature"
              placeholder="Sign your official endorsement using mouse, stylus, or touch screen"
            />

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back to Test Readings
              </Button>

              <Button
                variant="primary"
                isLoading={isSubmitting}
                disabled={!signatureDataUrl}
                onClick={handleFinalSubmit}
                leftIcon={<Award className="w-4 h-4 text-amber-300" />}
              >
                Generate & Issue Official Certificate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
