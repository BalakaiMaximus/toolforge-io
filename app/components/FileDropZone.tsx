"use client";

import { useState, useRef } from "react";

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
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum is ${maxSize}MB.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setError(null);
    onFileSelect(file);
    e.target.value = "";
  };

  const onButtonClick = () => {
    console.log("Button clicked, triggering file input");
    inputRef.current?.click();
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onFileChange}
        style={{ display: "none" }}
      />

      {/* Simple button */}
      <button
        type="button"
        onClick={onButtonClick}
        style={{
          width: "100%",
          padding: "40px 20px",
          border: "2px dashed #d1d5db",
          borderRadius: "12px",
          backgroundColor: "#f9fafb",
          cursor: "pointer",
          fontSize: "16px",
          color: "#374151",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📁</div>
        <div style={{ fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px" }}>
          Click to browse (max {maxSize}MB)
        </div>
      </button>

      {error && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
