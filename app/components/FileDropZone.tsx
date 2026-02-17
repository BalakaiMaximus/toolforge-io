"use client";

import { X, FileImage } from "lucide-react";
import { useState } from "react";

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
}

export default function FileDropZone({
  onFileSelect,
  accept = "image/*",
  maxSize = 10,
  label = "Select an image",
}: FileDropZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum is ${maxSize}MB.`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    setError(null);
    onFileSelect(file);
    
    // Reset so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="w-full">
      {/* Simple label wrapping input - most reliable method */}
      <label 
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
          <FileImage className="w-10 h-10 text-gray-400 mb-3" />
          <p className="mb-2 text-sm text-gray-700 font-medium">{label}</p>
          <p className="text-xs text-gray-500">Click to browse gallery</p>
          <p className="text-xs text-gray-400 mt-1">Max {maxSize}MB</p>
        </div>
        <input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleChange}
          className="sr-only"
        />
      </label>
      
      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
