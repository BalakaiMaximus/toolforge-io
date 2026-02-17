"use client";

import { X, FileImage, Upload } from "lucide-react";
import { useCallback, useState, useRef } from "react";

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
  label = "Click to upload an image",
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSize}MB.`);
      return false;
    }
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return false;
    }
    
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    // Direct click on hidden input - most reliable across browsers
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
      e.target.value = ''; // Reset for reselect
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
    if (file) handleFile(file);
  }, []);

  return (
    <div className="space-y-3">
      {/* Hidden native input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        aria-label="Select image file"
      />
      
      {/* Clickable area - works as button */}
      <button
        type="button"
        onClick={handleButtonClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          min-h-[180px] flex flex-col items-center justify-center gap-4
          active:scale-[0.98] touch-manipulation
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isDragging 
            ? "border-blue-500 bg-blue-50 border-solid" 
            : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
          }
        `}
      >
        <div className={`
          w-14 h-14 rounded-full flex items-center justify-center transition-colors
          ${isDragging ? "bg-blue-100" : "bg-white shadow-sm"}
        `}>
          <Upload className="w-6 h-6 text-gray-500" />
        </div>
        
        <div>
          <p className="text-gray-700 font-medium text-base">{label}</p>
          <p className="text-sm text-gray-500 mt-1">
            Max size: {maxSize}MB
          </p>
        </div>
      </button>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">
          <X className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
