"use client";

import { Upload, X, FileImage } from "lucide-react";
import { useCallback, useState } from "react";

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
}

export default function FileDropZone({
  onFileSelect,
  accept = "image/*",
  maxSize = 10,
  label = "Drop your file here, or click to browse",
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSize}MB.`);
      return false;
    }
    
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
        ${isDragging 
          ? "border-blue-500 bg-blue-50" 
          : "border-gray-300 hover:border-gray-400 bg-gray-50"
        }
      `}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center gap-3">
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center transition-colors
          ${isDragging ? "bg-blue-100" : "bg-white"}
        `}>
          <FileImage className="w-8 h-8 text-gray-400" />
        </div>
        
        <div>
          <p className="text-gray-700 font-medium mb-1">{label}</p>
          <p className="text-sm text-gray-500">
            Maximum file size: {maxSize}MB
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
