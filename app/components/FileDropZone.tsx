"use client";

import { useRef } from "react";

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
  label = "Choose an image",
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    console.log("FileDropZone clicked");
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("File input changed:", file?.name);
    
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File too large. Maximum is ${maxSize}MB.`);
        return;
      }
      onFileSelect(file);
    }
    e.target.value = "";
  };

  return (
    <div 
      onClick={handleClick}
      style={{
        border: '3px solid #3b82f6',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#eff6ff',
        cursor: 'pointer',
        minHeight: '150px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
        Tap here to browse
      </div>
      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
        Max {maxSize}MB
      </div>
    </div>
  );
}
