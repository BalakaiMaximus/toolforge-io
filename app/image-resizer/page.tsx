"use client";

import { useState } from "react";
import ToolLayout from "../components/ToolLayout";
import FileDropZone from "../components/FileDropZone";
import { resizeImage, formatFileSize } from "../lib/imageUtils";
import { XCircle, Loader2, Download, Image as ImageIcon, FileImage } from "lucide-react";
import toast from 'react-hot-toast';

function ImageResizerClient() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [resizedImageUrl, setResizedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResize = async () => {
    if (!file || (width <= 0 && height <= 0)) return;
    setIsLoading(true);
    try {
      const resizedBlob = await resizeImage(file, width, height, aspectRatioLocked);
      const url = URL.createObjectURL(resizedBlob);
      setResizedImageUrl(url);
      toast.success('Image resized successfully!');
    } catch (error: any) {
      toast.error(`Error resizing image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resizedImageUrl) return;
    const link = document.createElement('a');
    link.href = resizedImageUrl;
    link.download = `resized_${file?.name || 'image'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  };

  const handleClear = () => {
    setFile(null);
    setWidth(0);
    setHeight(0);
    setResizedImageUrl(null);
    if (resizedImageUrl) URL.revokeObjectURL(resizedImageUrl);
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = URL.createObjectURL(selectedFile);
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value, 10);
    if (aspectRatioLocked && file) {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        setHeight(Math.round(newWidth / aspectRatio));
      };
      img.src = URL.createObjectURL(file);
    }
    setWidth(newWidth);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value, 10);
    if (aspectRatioLocked && file) {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.height / img.width;
        setWidth(Math.round(newHeight / aspectRatio));
      };
      img.src = URL.createObjectURL(file);
    }
    setHeight(newHeight);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileDropZone 
          onFileSelect={handleFileChange}
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
              <p className="text-sm text-gray-500">{formatFileSize(file.size)} • {width}×{height}px</p>
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
          <label htmlFor="width" className="text-sm font-medium text-gray-700">Width:</label>
          <input
            id="width"
            type="number"
            value={width}
            onChange={handleWidthChange}
            className="w-24 px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
            className={`p-1 rounded-md ${aspectRatioLocked ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {aspectRatioLocked ? (
              <ImageIcon className="w-5 h-5" />
            ) : (
              <ImageIcon className="w-5 h-5" />
            )}
          </button>
          <label htmlFor="height" className="text-sm font-medium text-gray-700">Height:</label>
          <input
            id="height"
            type="number"
            value={height}
            onChange={handleHeightChange}
            className="w-24 px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResize}
            disabled={isLoading || !file || (width <= 0 && height <= 0)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileImage className="w-4 h-4"/>
            )}
            Resize
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-300 text-white rounded-lg font-medium hover:bg-gray-400 transition-colors"
          >
            <XCircle className="w-4 h-4 mr-1"/> Clear All
          </button>
        </div>
      </div>

      {resizedImageUrl && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Result</h3>
          <div className="flex justify-center mt-4">
            <img src={resizedImageUrl} alt="Resized Image Preview" className="max-h-64 rounded-lg border max-w-full"/>
          </div>
          <div className="flex justify-center mt-4">
            <button 
              onClick={handleDownload} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <Download className="w-4 h-4"/> Download Resized
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6 mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Related Tools</h4>
        <div className="flex flex-wrap gap-2">
          <a href="/image-compressor" className="text-sm text-blue-600 hover:underline">Image Compressor</a>
          <a href="/image-converter" className="text-sm text-blue-600 hover:underline">Image Converter</a>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ToolLayout
      title="Image Resizer"
      description="Resize images to exact dimensions. Maintain aspect ratio or set custom width and height. Free, fast, and client-side."
      category="Image Tools"
    >
      <ImageResizerClient />
    </ToolLayout>
  );
}
