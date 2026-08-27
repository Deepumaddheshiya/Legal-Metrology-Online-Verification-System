"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { INSTRUMENT_TYPES, INSTRUMENT_CATEGORIES } from "@/lib/constants";
import { Instrument } from "@/types";
import { useMockStore } from "@/lib/mockStore";
import { Scale, Upload, CheckCircle2 } from "lucide-react";

const instrumentSchema = z.object({
  instrumentType: z.enum([
    "weighing_scale",
    "measuring_instrument",
    "weight",
    "measure",
  ] as const),
  category: z.string().min(1, "Category / Standard Class is required"),
  make: z.string().min(1, "Manufacturer / Make is required"),
  model: z.string().min(1, "Model name/number is required"),
  serialNumber: z.string().min(1, "Serial number is mandatory under Legal Metrology Act"),
  capacity: z.string().min(1, "Capacity is required (e.g. 30 kg or 80 L/min)"),
  leastCount: z.string().min(1, "Least count / Division (e) is required"),
  locationOfUse: z.string().min(1, "Location of use at premises is required"),
  installationDate: z.string().min(1, "Date of installation is required"),
});

type InstrumentFormValues = z.infer<typeof instrumentSchema>;

interface InstrumentRegistrationFormProps {
  onSuccess?: (instrument: Instrument) => void;
  onCancel?: () => void;
}

export const InstrumentRegistrationForm: React.FC<InstrumentRegistrationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const addInstrument = useMockStore((s) => s.addInstrument);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InstrumentFormValues>({
    resolver: zodResolver(instrumentSchema),
    defaultValues: {
      instrumentType: "weighing_scale",
      category: INSTRUMENT_CATEGORIES[0],
      make: "",
      model: "",
      serialNumber: "",
      capacity: "",
      leastCount: "",
      locationOfUse: "",
      installationDate: new Date().toISOString().split("T")[0],
    },
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [createdInst, setCreatedInst] = useState<Instrument | null>(null);

  const onSubmit = async (values: InstrumentFormValues) => {
    const inst = addInstrument(values);
    setCreatedInst(inst);
    setIsSuccess(true);
  };

  if (isSuccess && createdInst) {
    return (
      <Card className="p-8 text-center bg-white border-emerald-200 shadow-md">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Instrument Registered Successfully!</h3>
        <p className="text-sm font-mono text-[#1E3A8A] font-bold mb-2">
          Serial Number: {createdInst.serialNumber}
        </p>
        <p className="text-xs text-gray-600 mb-6 max-w-md mx-auto">
          {createdInst.make} {createdInst.model} has been added to your business equipment inventory and is ready for statutory verification.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={() => setIsSuccess(false)}>
            Register Another Instrument
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (onSuccess && createdInst) onSuccess(createdInst);
              if (onCancel) onCancel();
            }}
          >
            Return to Equipment List
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-md border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-300" />
          <CardTitle className="text-white text-lg">Register Weighing / Measuring Instrument</CardTitle>
        </div>
        <CardDescription className="text-blue-100 text-xs">
          Enter technical specifications as per Legal Metrology Rules, 2011 to enable verification requests.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label required>Instrument Classification</Label>
              <Select {...register("instrumentType")}>
                {INSTRUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label required>Category / Standard Class</Label>
              <Select {...register("category")}>
                {INSTRUMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label required>Manufacturer / Make</Label>
              <Input
                placeholder="e.g. Avery India Ltd, Essae, Mettler Toledo"
                error={errors.make?.message}
                {...register("make")}
              />
            </div>

            <div>
              <Label required>Model Name / Number</Label>
              <Input
                placeholder="e.g. E1010 Price Computing Scale"
                error={errors.model?.message}
                {...register("model")}
              />
            </div>

            <div>
              <Label required>Manufacturer Serial Number</Label>
              <Input
                placeholder="e.g. AV-2023-88741 (Stamped on plate)"
                error={errors.serialNumber?.message}
                {...register("serialNumber")}
              />
            </div>

            <div>
              <Label required>Maximum Capacity (Max)</Label>
              <Input
                placeholder="e.g. 30 kg, 300 kg, 80 L/min"
                error={errors.capacity?.message}
                {...register("capacity")}
              />
            </div>

            <div>
              <Label required>Least Count / Division (e = d)</Label>
              <Input
                placeholder="e.g. 5 g, 2 g, 10 mL, 10 kg"
                error={errors.leastCount?.message}
                {...register("leastCount")}
              />
            </div>

            <div>
              <Label required>Date of Installation / Acquisition</Label>
              <Input type="date" error={errors.installationDate?.message} {...register("installationDate")} />
            </div>
          </div>

          <div>
            <Label required>Location of Use at Premises</Label>
            <Input
              placeholder="e.g. Billing Counter #1, Warehouse Loading Bay, Dispensing Nozzle A"
              error={errors.locationOfUse?.message}
              {...register("locationOfUse")}
            />
          </div>

          <div>
            <Label>Instrument Photo & Nameplate Plate</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100/60 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="flex text-xs text-gray-600 justify-center">
                  <span className="font-medium text-[#1E3A8A] hover:underline cursor-pointer">
                    Upload photograph of instrument
                  </span>
                  <span className="pl-1">or drag and drop</span>
                </div>
                <p className="text-[10px] text-gray-500">
                  PNG, JPG up to 5MB (Clear view of manufacturer stamping plate)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            {onCancel && (
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Register Instrument
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
