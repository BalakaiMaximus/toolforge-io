"use client";

import { useState } from "react";
import ToolLayout from "../components/ToolLayout";
import TextAreaTool from "../components/TextAreaTool";
import { formatJSON, minifyJSON, validateJSON } from "../lib/devUtils";
import { Copy, FileText, XCircle, Check, Loader2 } from "lucide-react";
import toast from 'react-hot-toast';

function JSONFormatterClient() {
  const [jsonInput, setJsonInput] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [minifiedJson, setMinifiedJson] = useState("");
  const [validation, setValidation] = useState<{ valid: boolean; error?: string } | null>(null);
  const [activeTab, setActiveTab] = useState("format"); // "format", "minify", "validate"
  const [isLoading, setIsLoading] = useState(false);

  const handleFormat = () => {
    try {
      setIsLoading(true);
      const result = formatJSON(jsonInput);
      setFormattedJson(result);
      setValidation(validateJSON(result));
      toast.success("JSON formatted successfully!");
    } catch (error: any) {
      setFormattedJson("");
      setValidation({ valid: false, error: error.message });
      toast.error(`Error formatting JSON: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMinify = () => {
    try {
      setIsLoading(true);
      const result = minifyJSON(jsonInput);
      setMinifiedJson(result);
      setValidation(validateJSON(result));
      toast.success("JSON minified successfully!");
    } catch (error: any) {
      setMinifiedJson("");
      setValidation({ valid: false, error: error.message });
      toast.error(`Error minifying JSON: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = () => {
    setIsLoading(true);
    const result = validateJSON(jsonInput);
    setValidation(result);
    if (result.valid) {
      toast.success("JSON is valid!");
    } else {
      toast.error(`Invalid JSON: ${result.error}`);
    }
    setIsLoading(false);
  };

  const handleClear = () => {
    setJsonInput("");
    setFormattedJson("");
    setMinifiedJson("");
    setValidation(null);
  };

  const handleCopy = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${type} to clipboard!`);
  };

  return (
    <div className="space-y-6">
      <TextAreaTool 
        label="Your JSON Data"
        value={jsonInput}
        onChange={setJsonInput}
        placeholder="Paste your JSON here..."
        rows={12}
      />

      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("format")} 
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${activeTab === "format" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Format JSON
        </button>
        <button
          onClick={() => setActiveTab("minify")} 
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${activeTab === "minify" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Minify JSON
        </button>
        <button
          onClick={handleValidate} 
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${activeTab === "validate" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Validate JSON
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={handleFormat}
            disabled={isLoading || !jsonInput || activeTab !== "format"}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            {isLoading && activeTab === "format" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4"/>
            )}
            Format
          </button>
          <button
            onClick={handleMinify}
            disabled={isLoading || !jsonInput || activeTab !== "minify"}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            {isLoading && activeTab === "minify" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4"/>
            )}
            Minify
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition-colors"
          >
            <XCircle className="w-4 h-4 mr-1"/> Clear All
          </button>
          <button
            onClick={() => handleCopy(activeTab === "format" ? formattedJson : activeTab === "minify" ? minifiedJson : jsonInput, activeTab)}
            disabled={(!formattedJson && activeTab === "format") || (!minifiedJson && activeTab === "minify") || !jsonInput}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Copy className="w-4 h-4 mr-1"/> Copy Result
          </button>
        </div>
      </div>

      {(formattedJson || minifiedJson || validation) && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          
          {activeTab === "format" && formattedJson && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Formatted JSON</label>
              <pre className="bg-gray-900 text-white text-xs rounded-lg p-4 overflow-auto h-64 border border-gray-700 font-mono whitespace-pre-wrap">
                {formattedJson}
              </pre>
            </div>
          )}
          
          {activeTab === "minify" && minifiedJson && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minified JSON</label>
              <pre className="bg-gray-900 text-white text-xs rounded-lg p-4 overflow-auto h-64 border border-gray-700 whitespace-nowrap">
                {minifiedJson}
              </pre>
            </div>
          )}
          
          {validation && (
            <div className={`p-4 rounded-lg ${validation.valid ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <div className="flex items-center gap-2">
                {validation.valid ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">
                  {validation.valid ? 'JSON is Valid' : `JSON Validation Error: ${validation.error}`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-200 pt-6 mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Related Tools</h4>
        <div className="flex flex-wrap gap-2">
          <a href="/base64-tool" className="text-sm text-blue-600 hover:underline">Base64 Tool</a>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ToolLayout
      title="JSON Formatter & Validator"
      description="Format, minify, and validate your JSON data. Paste your JSON to instantly beautify, compress, or check its structure."
      category="Developer Tools"
    >
      <JSONFormatterClient />
    </ToolLayout>
  );
}
