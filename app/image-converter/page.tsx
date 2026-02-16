import { Metadata } from "next";
import ToolLayout from "../components/ToolLayout";

export const metadata: Metadata = {
  title: "Image Converter - JPG to PNG, PNG to JPG | ToolForge",
  description:
    "Convert images between JPG and PNG formats online. Lossless conversion for PNG, adjustable quality for JPG. Free, client-side tool.",
  keywords: "image converter, jpg to png, png to jpg, convert image format",
};

export default function ImageConverterPage() {
  return (
    <ToolLayout
      title="Image Converter"
      description="Convert images between JPG and PNG formats. Optimize images for different use cases and maintain quality."
      category="Image Tools"
    >
      <ConverterClient />
    </ToolLayout>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Download, FileImage, RefreshCcw, ImageDown } from "lucide-react";
import FileDropZone from "../components/FileDropZone";
import { convertImage, formatFileSize } from "../lib/imageUtils";

function ConverterClient() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState("image/jpeg"); // Default to JPEG
  const [converted, setConverted] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setConverted(null);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const result = await convertImage(file, format as "image/jpeg" | "image/png");
      setConverted(result);
    } catch (error: any) {
      alert(`Failed to convert image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!converted || !file) return;
    
    const url = URL.createObjectURL(converted);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${format === "image/jpeg" ? "jpg" : "png"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const originalSizeFormatted = file ? formatFileSize(file.size) : 'N/A';
  const convertedSizeFormatted = converted ? formatFileSize(converted.size) : 'N/A';

  return (
    <div className="space-y-6">
      {!file ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept="image/jpeg,image/png,image/webp"
          maxSize={10}
          label="Drop your image here, or click to browse (JPG, PNG, WebP)"
        />
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Selected Image</h3>
              <button
                onClick={() => {
                  setFile(null);
                  setConverted(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            
            {previewUrl && (
              <div className="flex items-start gap-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 rounded-lg object-contain bg-gray-100"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">File:</span> {file.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Original size:</span>{" "}
                    {originalSizeFormatted}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Convert To
              </label>
              <select
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value);
                  setConverted(null); // Reset conversion on format change
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="image/jpeg">JPG</option>
                <option value="image/png">PNG</option>
              </select>
            </div>
            
            {/* Quality Slider for JPG */}
            {format === "image/jpeg" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JPG Quality
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={95} // Default quality for JPG
                  onChange={() => { /* Not directly used for conversion logic here */ }}
                  className="w-full"
                  disabled // Placeholder for now
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Lower quality</span>
                  <span>Higher quality</span>
                </div>
              </div>
            )}
          </div>

          {/* Convert Button */}
          {!converted ? (
            <button
              onClick={handleConvert}
              disabled={loading || !file}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <RefreshCcw className="w-5 h-5" />
                  Convert Image
                </>
              )}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 mb-3">
                <span className="font-medium">Conversion complete!</span>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-green-700 font-medium">
                  Converted size: {convertedSizeFormatted}
                </p>
                <button
                  onClick={handleDownload}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Related Tools */}
      <div className="border-t border-gray-200 pt-6 mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Related Tools</h4>
        <div className="flex flex-wrap gap-2">
          <a href="/image-compressor" className="text-sm text-blue-600 hover:underline">Image Compressor</a>
          <span className="text-gray-300">|</span>
          <a href="/image-resizer" className="text-sm text-blue-600 hover:underline">Image Resizer</a>
        </div>
      </div>
    </div>
  );
}
