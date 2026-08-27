"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

interface FileUploadProps {
  relatedEntityType: string;
  relatedEntityId: string;
  documentType?: string;
  label?: string;
  helperText?: string;
  onUploadComplete?: (document: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    documentType: string;
  }) => void;
}

export function FileUpload({
  relatedEntityType,
  relatedEntityId,
  documentType = "other",
  label = "Upload Statutory Document",
  helperText = "Accepted formats: PDF, JPEG, PNG, WEBP (Max 10 MB)",
  onUploadComplete,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = (file: File): boolean => {
    setUploadError(null);
    setUploadSuccess(null);

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(`File exceeds 10 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (handleFileValidation(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (handleFileValidation(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(`"${selectedFile.name}" uploaded and secured successfully.`);
      const mockDoc = {
        id: `doc-${Date.now()}`,
        fileName: selectedFile.name,
        fileUrl: URL.createObjectURL(selectedFile),
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        documentType,
      };
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (onUploadComplete) {
        onUploadComplete(mockDoc);
      }
    }, 400);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-xs font-bold text-gray-700">{label}</label>}

      {uploadSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#1E3A8A] bg-blue-50/50"
              : "border-gray-300 hover:border-[#1E3A8A] bg-gray-50/50 hover:bg-white"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <UploadCloud className="w-8 h-8 text-[#1E3A8A] mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-800">
            Click to upload or drag and drop files here
          </p>
          <p className="text-[11px] text-gray-500 mt-1">{helperText}</p>
        </div>
      ) : (
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedFile.type.includes("pdf") ? (
                <FileText className="w-6 h-6 text-red-600" />
              ) : (
                <ImageIcon className="w-6 h-6 text-blue-600" />
              )}
              <div>
                <p className="text-xs font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearSelection}
              disabled={isUploading}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleUpload}
              isLoading={isUploading}
              leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
            >
              Confirm & Upload
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
