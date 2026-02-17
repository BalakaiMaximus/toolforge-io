"use client";

import { useState } from "react";
import ToolLayout from "../components/ToolLayout";
import FileDropZone from "../components/FileDropZone";
import { convertImage, formatFileSize } from "../lib/imageUtils";
import { XCircle, Loader2, Download, FileImage } from "lucide-react";
import toast from 'react-hot-toast';

function ImageConverterClient() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'jpg' | 'png'>('png'); // Default to PNG
  const [convertedImageUrl, setConvertedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const targetFormat = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const convertedBlob = await convertImage(file, targetFormat);
      const url = URL.createObjectURL(convertedBlob);
      setConvertedImageUrl(url);
      toast.success(`Image converted to ${format.toUpperCase()} successfully!`);
    } catch (error: any) {
      toast.error(`Error converting image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!convertedImageUrl) return;
    const link = document.createElement('a');
    link.href = convertedImageUrl;
    link.download = `converted_to_${format}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  };

  const handleClear = () => {
    setFile(null);
    setConvertedImageUrl(null);
    if (convertedImageUrl) URL.revokeObjectURL(convertedImageUrl);
  };

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
            onClick={handleClear}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <label htmlFor="format" className="text-sm font-medium text-gray-700">Convert To:</label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value as 'jpg' | 'png')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleConvert}
            disabled={isLoading || !file}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileImage className="w-4 h-4"/>
            )}
            Convert
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-300 text-white rounded-lg font-medium hover:bg-gray-400 transition-colors"
          >
            <XCircle className="w-4 h-4 mr-1"/> Clear All
          </button>
        </div>
      </div>

      {convertedImageUrl && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Result</h3>
          <div className="flex justify-center mt-4">
            <img src={convertedImageUrl} alt={`Converted Image Preview (${format})`} className="max-h-64 rounded-lg border max-w-full"/>
          </div>
          <div className="flex justify-center mt-4">
            <button 
              onClick={handleDownload} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <Download className="w-4 h-4"/> Download {format.toUpperCase()}
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6 mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Related Tools</h4>
        <div className="flex flex-wrap gap-2">
          <a href="/image-compressor" className="text-sm text-blue-600 hover:underline">Image Compressor</a>
          <a href="/image-resizer" className="text-sm text-blue-600 hover:underline">Image Resizer</a>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ToolLayout
      title="Image Converter"
      description="Convert images between formats. JPG to PNG, PNG to JPG, and more. Free, fast, and client-side."
      category="Image Tools"
    >
      <ImageConverterClient />
    </ToolLayout>
  );
}
