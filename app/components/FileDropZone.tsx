"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileImage, X } from "lucide-react";

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
  label = "Upload an image",
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      e.target.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      {/* Subtle, clean upload area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label={`${label}. Click or drag and drop to upload`}
        className={`
          relative w-full rounded-lg border-2 border-dashed 
          transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
          }
        `}
        style={{ minHeight: '160px' }}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="sr-only"
          aria-hidden="true"
        />
        
        {/* Content - centered and subtle */}
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          {/* Icon - muted color */}
          <div className={`
            mb-3 p-3 rounded-full transition-colors
            ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}
          `}>
            <Upload 
              className={`w-6 h-6 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
              aria-hidden="true"
            />
          </div>
          
          {/* Text - clean and readable */}
          <p className="text-sm font-medium text-gray-700 mb-1">
            {isDragging ? 'Drop image here' : 'Click or drag image to upload'}
          </p>
          <p className="text-xs text-gray-500">
            Supports JPG, PNG, WebP • Max {maxSize}MB
          </p>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div 
          className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md"
          role="alert"
        >
          <X className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
