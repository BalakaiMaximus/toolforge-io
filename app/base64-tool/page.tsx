"use client";

import { useState, useMemo } from "react";
import ToolLayout from "../components/ToolLayout";
import TextAreaTool from "../components/TextAreaTool";
import { encodeBase64, decodeBase64, generateUUIDs } from "../lib/devUtils";
import { Copy, Plus, Loader2, FileText } from "lucide-react";
import toast from 'react-hot-toast';

function Base64AndUUIDClient() {
  const [base64Input, setBase64Input] = useState("");
  const [decodedText, setDecodedText] = useState("");
  const [encodedBase64, setEncodedBase64] = useState("");
  const [uuidCount, setUuidCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [uuidError, setUuidError] = useState<string | null>(null);
  const [activeBase64Tab, setActiveBase64Tab] = useState<'encode' | 'decode'>('encode');
  const [isLoading, setIsLoading] = useState(false);

  const handleEncode = () => {
    try {
      setIsLoading(true);
      const encoded = encodeBase64(base64Input);
      setEncodedBase64(encoded);
      setDecodedText("");
      toast.success("Encoded successfully!");
    } catch (error: any) {
      setEncodedBase64("");
      toast.error(`Error encoding: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecode = () => {
    try {
      setIsLoading(true);
      const decoded = decodeBase64(base64Input);
      setDecodedText(decoded);
      setEncodedBase64("");
      toast.success("Decoded successfully!");
    } catch (error: any) {
      setDecodedText("");
      toast.error(`Error decoding: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateUUIDs = () => {
    if (uuidCount < 1 || uuidCount > 100) {
      setUuidError("Please enter a number between 1 and 100.");
      return;
    }
    setUuidError(null);
    const generated = generateUUIDs(uuidCount);
    setUuids(generated);
    toast.success(`${uuidCount} UUIDs generated!`);
  };

  const handleCopy = (text: string, message: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${message} copied!`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
          Base64 Encoder/Decoder
          <div className={`flex items-center gap-1 border-b-2 px-2 py-1 cursor-pointer transition ${activeBase64Tab === 'encode' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`} onClick={() => { setActiveBase64Tab('encode'); setBase64Input(encodedBase64 || ''); }}>
            Encode
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 cursor-pointer transition ${activeBase64Tab === 'decode' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`} onClick={() => { setActiveBase64Tab('decode'); setBase64Input(decodedText || ''); }}>
            Decode
          </div>
        </h3>
        <TextAreaTool 
          label="Text / Base64"
          value={base64Input}
          onChange={setBase64Input}
          placeholder="Paste text or Base64 string here..."
          rows={4}
        />
        <div className="flex items-center gap-4">
          <button
            onClick={handleEncode}
            disabled={isLoading || !base64Input || activeBase64Tab !== 'encode'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && activeBase64Tab === 'encode' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <FileText className="w-4 h-4 mr-1" />
            )}
            Encode to Base64
          </button>
          <button
            onClick={handleDecode}
            disabled={isLoading || !base64Input || activeBase64Tab !== 'decode'}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && activeBase64Tab === 'decode' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Decode Base64
          </button>
        </div>
        
        {(encodedBase64 || decodedText) && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
            <h4 className="text-md font-medium text-gray-900">
              {activeBase64Tab === "encode" ? "Encoded Base64" : "Decoded Text"}
            </h4>
            <div className="relative">
              <textarea
                value={activeBase64Tab === "encode" ? encodedBase64 : decodedText}
                readOnly
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none font-mono text-sm"
              />
              <button
                onClick={() => handleCopy(activeBase64Tab === "encode" ? encodedBase64 : decodedText, activeBase64Tab === "encode" ? "Base64" : "Decoded Text")}
                className="absolute top-1 right-1 px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <hr className="my-6 border-gray-200" />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          UUID Generator
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={uuidCount}
            onChange={(e) => setUuidCount(e.target.value === '' ? 1 : Number(e.target.value))}
            min="1"
            max="100"
            className="w-24 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleGenerateUUIDs}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-1" />
            )}
            Generate UUIDs
          </button>
        </div>
        
        {uuidError && (
          <p className="text-red-600 text-sm">{uuidError}</p>
        )}

        {uuids.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
            <h4 className="text-md font-medium text-gray-900">Generated UUIDs</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {uuids.map((uuid, index) => (
                <div key={index} className="relative">
                  <textarea
                    value={uuid}
                    readOnly
                    rows={1}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none font-mono text-sm"
                  />
                  <button
                    onClick={() => handleCopy(uuid, 'UUID')}
                    className="absolute top-1 right-1 px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6 mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Related Tools</h4>
        <div className="flex flex-wrap gap-2">
          <a href="/json-formatter" className="text-sm text-blue-600 hover:underline">JSON Formatter</a>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ToolLayout
      title="Base64 & UUID Tools"
      description="Encode/decode text with Base64, generate UUIDs. Essential tools for developers."
      category="Developer Tools"
    >
      <Base64AndUUIDClient />
    </ToolLayout>
  );
}
