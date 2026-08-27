"use client";

import React, { useState } from "react";
import { BulkUploadModal } from "@/components/forms/BulkUploadModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud } from "lucide-react";

export default function BulkInstrumentUploadPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-[#1E3A8A]" />
          Bulk Instrument Upload
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Import multiple instruments at once using a CSV file. Download the sample
          template from the upload dialog to get the correct columns.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CSV Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Use the bulk uploader to register weighing and measuring instruments in
            batches. Each row is validated and imported into your business inventory.
          </p>
          <Button variant="primary" onClick={() => setIsOpen(true)}>
            <UploadCloud className="w-4 h-4 mr-1" /> Start Bulk Upload
          </Button>
        </CardContent>
      </Card>

      <BulkUploadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onImportSuccess={() => setIsOpen(false)}
      />
    </div>
  );
}
