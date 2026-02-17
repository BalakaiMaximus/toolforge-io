"use client";

import { useState } from "react";
import ToolLayout from "../components/ToolLayout";
import FileDropZone from "../components/FileDropZone";
import { compressImage, formatFileSize } from "../lib/imageUtils";
import { XCircle, Loader2, Download, FileImage } from "lucide-react";
import toast from 'react-hot-toast';

function ImageCompressorClient() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [compressedImageUrl, setCompressedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompress = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const result = await compressImage(file, quality);
      const url = URL.createObjectURL(result.blob);
      setCompressedImageUrl(url);
      setCompressedSize(result.compressedSize);
      toast.success(`Compressed! Saved ${((1 - result.compressedSize / result.originalSize) * 100).toFixed(0)}%`);
    } catch (error: any) {
      toast.error(`Error compressing image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!compressedImageUrl) return;
    const link = document.createElement('a');
    link.href = compressedImageUrl;
    link.download = `compressed_${file?.name || 'image'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  };

  const handleClear = () => {
    setFile(null);
    setCompressedImageUrl(null);
    if (compressedImageUrl) URL.revokeObjectURL(compressedImageUrl);
  };

  const originalFileSize = file ? formatFileSize(file.size) : '0 KB';
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const compressedFileSize = compressedImageUrl ? formatFileSize(compressedSize) : '0 KB';

  return (
    <div className="space-y-6">
      {!file ? (
        <FileDropZone 
          onFileSelect={(selectedFile) => {
            setFile(selectedFile);
            toast.success(`Loaded: ${selectedFile.name}`);
          }}
          accept="image/*"
          maxSize={10}
          label="Drop your image here, or click to browse"
        />
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-medium text-xs uppercase">{file.name.split('.').pop()}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <label htmlFor="quality" className="text-sm font-medium text-gray-700">Compression Quality:</label>
          <input
            id="quality"
            type="range"
            min="0" 
            max="1" 
            step="0.01" 
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-900">{(quality * 100).toFixed(0)}%</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCompress}
            disabled={isLoading || !file}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileImage className="w-4 h-4"/>
            )}
            Compress
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-300 text-white rounded-lg font-medium hover:bg-gray-400 transition-colors"
          >
            <XCircle className="w-4 h-4 mr-1"/> Clear All
          </button>
        </div>
      </div>

      {compressedImageUrl && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Result</h3>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium text-gray-700">Original Size</p>
              <p className="text-lg font-bold text-gray-900">{originalFileSize}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium text-gray-700">Compressed Size</p>
              <p className="text-lg font-bold text-gray-900">{compressedFileSize}</p>
            </div>
            <button 
              onClick={handleDownload} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <Download className="w-4 h-4"/> Download Compressed
            </button>
          </div>
          <div className="flex justify-center mt-4">
            <img src={compressedImageUrl} alt="Compressed Image Preview" className="max-h-64 rounded-lg border max-w-full"/>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6 mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Related Tools</h4>
        <div className="flex flex-wrap gap-2">
          <a href="/image-resizer" className="text-sm text-blue-600 hover:underline">Image Resizer</a>
          <a href="/image-converter" className="text-sm text-blue-600 hover:underline">Image Converter</a>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ToolLayout
      title="Image Compressor"
      description="Compress images online while maintaining quality. Reduce file size for JPG, PNG, and WebP images. Fast, free, and client-side."
      category="Image Tools"
    >
      <ImageCompressorClient />
    </ToolLayout>
  );
}
