import { useState, useCallback } from "react";
import { Download, Scaling, Lock, Unlock } from "lucide-react";
import FileDropZone from "../components/FileDropZone";
import { resizeImage, formatFileSize } from "../lib/imageUtils";

interface ResizerClientProps {
  // Props if needed, though currently self-contained
}

export default function ResizerClient() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState<string | number>("");
  const [height, setHeight] = useState<string | number>("");
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [resized, setResized] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{width: number, height: number} | null>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setResized(null);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    
    // Get original dimensions
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      setWidth(img.width);
      setHeight(img.height);
    };
    img.src = URL.createObjectURL(selectedFile);
  }, []);

  const handleResize = async () => {
    if (!file || !width || !height) return;
    
    setLoading(true);
    try {
      const result = await resizeImage(file, Number(width), Number(height), maintainAspect);
      setResized(result);
    } catch (error: any) {
      alert(`Failed to resize image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resized || !file) return;
    
    const url = URL.createObjectURL(resized);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resized-${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const compressionRatio = compressed
    ? ((1 - compressed.compressedSize / compressed.originalSize) * 100).toFixed(1)
    : 0;

  const originalSizeFormatted = file ? formatFileSize(file.size) : 'N/A';
  const resizedSizeFormatted = resized ? formatFileSize(resized.size) : 'N/A';

  return (
    <div className="space-y-6">
      {!file ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept="image/*"
          maxSize={10}
          label="Drop your image here, or click to browse"
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
                  setResized(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                  setOriginalDimensions(null);
                  setWidth("");
                  setHeight("");
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
                  {originalDimensions && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Dimensions:</span> {originalDimensions.width} x {originalDimensions.height}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dimensions Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Width"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Height"
                min="1"
              />
            </div>
          </div>

          {/* Aspect Ratio Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMaintainAspect(!maintainAspect)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              {maintainAspect ? (
                <Lock className="w-4 h-4 text-blue-600" />
              ) : (
                <Unlock className="w-4 h-4 text-gray-400" />
              )}
              <span>Maintain aspect ratio</span>
            </button>
          </div>

          {/* Resize Button */}
          {!resized ? (
            <button
              onClick={handleResize}
              disabled={loading || !file || !width || !height}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resizing...
                </>
              ) : (
                <>
                  <Scaling className="w-5 h-5" />
                  Resize Image
                </>
              )}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 mb-3">
                <span className="font-medium">Image resized successfully!</span>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-green-700 font-medium">
                  Resized size: {resizedSizeFormatted}
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
          <a href="/image-converter" className="text-sm text-blue-600 hover:underline">Image Converter</a>
        </div>
      </div>
    </div>
  );
}
