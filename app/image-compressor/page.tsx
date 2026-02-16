import { Metadata } from "next";
import ToolLayout from "../components/ToolLayout";

export const metadata: Metadata = {
  title: "Image Compressor - Reduce Image Size | ToolForge",
  description:
    "Compress images online without losing quality. Reduce JPG and PNG file sizes for faster websites and better performance. Free, client-side tool.",
  keywords: "image compressor, compress jpg, compress png, reduce image size, optimize images",
};

export default function ImageCompressorPage() {
  return (
    <ToolLayout
      title="Image Compressor"
      description="Reduce image file size without noticeable quality loss. Perfect for optimizing images for web use, social media, or email attachments."
      category="Image Tools"
    >
      {/* Tool content will be loaded via client component */}
      <CompressorClient />
    </ToolLayout>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Download, ImageIcon, Check } from "lucide-react";
import FileDropZone from "../components/FileDropZone";
import { compressImage, formatFileSize } from "../lib/imageUtils";

function CompressorClient() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(80);
  const [compressed, setCompressed] = useState<{
    blob: Blob;
    originalSize: number;
    compressedSize: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setCompressed(null);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }, []);

  const handleCompress = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const result = await compressImage(file, quality);
      setCompressed(result);
    } catch (error) {
      alert("Failed to compress image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!compressed) return;
    
    const url = URL.createObjectURL(compressed.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed-${file?.name || "image.jpg"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const compressionRatio = compressed
    ? ((1 - compressed.compressedSize / compressed.originalSize) * 100).toFixed(1)
    : 0;

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
                  setCompressed(null);
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
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quality Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compression Quality: {quality}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>

          {/* Compress Button */}
          {!compressed ? (
            <button
              onClick={handleCompress}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  Compress Image
                </>
              )}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 mb-3">
                <Check className="w-5 h-5" />
                <span className="font-medium">Compression complete!</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">Original</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatFileSize(compressed.originalSize)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">Compressed</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatFileSize(compressed.compressedSize)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-green-700 font-medium">
                  Saved {compressionRatio}% ({formatFileSize(compressed.originalSize - compressed.compressedSize)})
                </span>
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
          <a href="/image-resizer" className="text-sm text-blue-600 hover:underline">Image Resizer</a>
          <span className="text-gray-300">|</span>
          <a href="/image-converter" className="text-sm text-blue-600 hover:underline">Image Converter</a>
        </div>
      </div>
    </div>
  );
}
