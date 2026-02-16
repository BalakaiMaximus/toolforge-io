"use client";

import { useState, useEffect } from "react";

interface TextAreaToolProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  readOnly?: boolean;
  rows?: number;
  maxLength?: number;
  showStats?: boolean;
}

export default function TextAreaTool({
  value,
  onChange,
  placeholder = "Enter your text here...",
  label,
  readOnly = false,
  rows = 8,
  maxLength,
  showStats = true,
}: TextAreaToolProps) {
  const [stats, setStats] = useState({
    chars: 0,
    words: 0,
    lines: 0,
  });

  useEffect(() => {
    const chars = value.length;
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    const lines = value ? value.split(/\r\n|\r|\n/).length : 0;
    setStats({ chars, words, lines });
  }, [value]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 rounded-lg border border-gray-300 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          resize-y transition-shadow
          ${readOnly ? "bg-gray-50" : "bg-white"}
        `}
      />
      
      {showStats && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{stats.chars.toLocaleString()} characters</span>
          <span>{stats.words.toLocaleString()} words</span>
          <span>{stats.lines.toLocaleString()} lines</span>
          {maxLength && (
            <span className={stats.chars > maxLength ? "text-red-500" : ""}>
              {stats.chars}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
