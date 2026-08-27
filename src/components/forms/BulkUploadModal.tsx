"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";
import { useMockStore } from "@/lib/mockStore";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (count: number) => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const bulkAddInstruments = useMockStore((s) => s.bulkAddInstruments);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    insertedCount: number;
    skippedCount: number;
    totalSubmitted: number;
    rowErrors?: Array<{ row: number; serialNumber?: string; error: string }>;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const sampleCsvContent = `make,model,serialNumber,instrumentType,category,capacity,leastCount,locationOfUse,installationDate
Avery India Ltd,E1010 Price Computing Scale,AV-2024-${Date.now().toString().slice(-4)}1,weighing_scale,Commercial Counter Scale (Class III),30 kg,5 g,Counter #1,2024-01-15
Essae-Teraoka,DS-252 Electronic Scale,ES-2024-${Date.now().toString().slice(-4)}2,weighing_scale,Commercial Counter Scale (Class III),15 kg,2 g,Counter #2,2024-02-10
Eagle Weighing,EG-500 Platform Scale,EG-2024-${Date.now().toString().slice(-4)}3,weighing_scale,Platform Weighing Scale,300 kg,50 g,Warehouse Bay A,2024-03-01
Gilbarco Veeder-Root,Horizon Plus Flow Meter,GV-2024-${Date.now().toString().slice(-4)}4,measuring_instrument,Fuel Dispenser / Flow Meter,80 L/min,10 mL,Nozzle Island 1,2024-01-20
National Metrology,Class M1 Cast Iron Weights,NW-2024-${Date.now().toString().slice(-4)}5,weight,Standard Weights,10 kg,1 g,Weight Set Storage,2024-01-05`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "lmovs_bulk_instruments_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerError(null);
    setImportResult(null);
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
        },
      });
    }
  };

  const handleSimulateDefaultData = () => {
    setServerError(null);
    setImportResult(null);
    Papa.parse(sampleCsvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedData(results.data);
      },
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setIsProcessing(true);
    setServerError(null);
    setImportResult(null);

    try {
      const added = bulkAddInstruments(parsedData);
      setImportResult({
        insertedCount: added.length,
        skippedCount: 0,
        totalSubmitted: parsedData.length,
      });

      if (onImportSuccess) {
        onImportSuccess(added.length);
      }
    } catch (err: any) {
      setServerError("Failed to import instruments.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setParsedData([]);
    setImportResult(null);
    setServerError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Instrument CSV Import"
      description="Upload a CSV file with multiple weighing or measuring instruments for batch registration."
      maxWidth="xl"
    >
      {importResult && importResult.insertedCount > 0 ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {importResult.insertedCount} Instruments Registered Successfully!
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Validated against Legal Metrology Act specifications and added to your active repository.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" onClick={handleReset}>
              Import Another Batch
            </Button>
            <Button variant="primary" onClick={onClose}>
              View Repository
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-[#1E3A8A] font-medium">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Standard Format: CSV with headers (make, model, serialNumber, capacity...)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
            <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">
              Select or Drop your CSV file here
            </p>
            <p className="text-xs text-gray-500 mb-3">Supports .csv files up to 10MB</p>
            <div className="flex justify-center gap-2">
              <label className="cursor-pointer">
                <span className="inline-flex items-center justify-center font-medium rounded-md text-xs px-3 h-8 bg-[#1E3A8A] text-white hover:bg-[#1E40AF]">
                  Browse Files
                </span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSimulateDefaultData}
              >
                Load Demo Sample Batch
              </Button>
            </div>
          </div>

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700">
                  Preview ({parsedData.length} rows detected)
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  Ready to Validate & Import
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0 border-b border-gray-200">
                    <tr>
                      <th className="p-2">Make</th>
                      <th className="p-2">Model</th>
                      <th className="p-2">Serial No.</th>
                      <th className="p-2">Capacity</th>
                      <th className="p-2">Least Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parsedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2 font-medium">{row.make}</td>
                        <td className="p-2">{row.model}</td>
                        <td className="p-2 font-mono text-gray-600">{row.serialNumber}</td>
                        <td className="p-2">{row.capacity}</td>
                        <td className="p-2">{row.leastCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={parsedData.length === 0}
              isLoading={isProcessing}
              onClick={handleImport}
            >
              Import {parsedData.length > 0 ? `(${parsedData.length})` : ""} Instruments
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
