"use client";

import { useState } from "react";
import ToolLayout from "../components/ToolLayout";
import { generateUUIDs } from "../lib/devUtils";
import { Copy, Plus, Loader2 } from "lucide-react";
import toast from 'react-hot-toast';

function UUIDGeneratorClient() {
  const [uuidCount, setUuidCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [uuidError, setUuidError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateUUIDs = () => {
    if (uuidCount < 1 || uuidCount > 100) {
      setUuidError("Please enter a number between 1 and 100.");
      return;
    }
    setUuidError(null);
    setIsLoading(true);
    const generated = generateUUIDs(uuidCount);
    setUuids(generated);
    setIsLoading(false);
    toast.success(`${uuidCount} UUIDs generated!`);
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("UUID copied!");
  };

  const handleCopyAll = () => {
    if (uuids.length === 0) return;
    navigator.clipboard.writeText(uuids.join('\n'));
    toast.success("All UUIDs copied!");
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">UUID v4 Generator</h3>
        <p className="text-sm text-gray-600">
          Generate random UUIDs (Universally Unique Identifiers) in version 4 format. 
          Useful for database keys, session IDs, and unique identifiers.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Count:</label>
          <input
            type="number"
            value={uuidCount}
            onChange={(e) => setUuidCount(e.target.value === '' ? 1 : Number(e.target.value))}
            min="1"
            max="100"
            className="w-24 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleGenerateUUIDs}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Generate UUIDs
        </button>
        {uuids.length > 0 && (
          <button
            onClick={handleCopyAll}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy All
          </button>
        )}
      </div>
      
      {uuidError && (
        <p className="text-red-600 text-sm">{uuidError}</p>
      )}

      {uuids.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
          <h4 className="text-md font-medium text-gray-900">Generated UUIDs ({uuids.length})</h4>
          <div className="grid grid-cols-1 gap-2">
            {uuids.map((uuid, index) => (
              <div key={index} className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={uuid}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none font-mono text-sm"
                />
                <button
                  onClick={() => handleCopy(uuid)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6 mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Related Tools</h4>
        <div className="flex flex-wrap gap-2">
          <a href="/base64-tool" className="text-sm text-blue-600 hover:underline">Base64 Tool</a>
          <a href="/json-formatter" className="text-sm text-blue-600 hover:underline">JSON Formatter</a>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate UUID v4 identifiers instantly. Create single or bulk UUIDs for your applications. Free, fast, and client-side."
      category="Developer Tools"
    >
      <UUIDGeneratorClient />
    </ToolLayout>
  );
}
