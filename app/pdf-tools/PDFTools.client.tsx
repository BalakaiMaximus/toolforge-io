"use client";

import { useState, useEffect, useRef, DragEvent, ChangeEvent } from "react";
import { PDFDocument, PDFImage } from "pdf-lib";
import {
  Merge,
  Scissors,
  Minimize2,
  Image as ImageIcon,
  Upload,
  Download,
  ArrowUp,
  ArrowDown,
  FileText,
  Trash2,
  Loader2,
  Settings2,
  Plus,
  CheckCircle,
  XCircle,
  Info,
  Crown,
  AlertTriangle,
  Zap
} from "lucide-react";
import { getUsage, incrementUsage } from "@/lib/usage";
import { useAuth } from "@/context/AuthContext"; // Import useAuth hook

type TabType = "merge" | "split" | "compress" | "imagetopdf";

interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
}

// Re-using FileItem type for images
type ImageFileItem = FileItem;

function downloadFile(data: Uint8Array, filename: string) {
  const blob = new Blob([data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// =====================================================
// MERGE TOOL
// =====================================================
function MergeTool({ onAction }: { onAction: (action: TabType) => Promise<boolean> }) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf"));
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files).filter(f => f.type === "application/pdf"));
  };

  const addFiles = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file, name: file.name, size: file.size,
    }))]);
  };

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const moveFile = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === files.length - 1)) return;
    const newFiles = [...files];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const mergePDFs = async () => {
    if (files.length < 2) return;
    if (!(await onAction("merge"))) return; // Check usage/paywall
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const fileItem of files) {
        const pdf = await PDFDocument.load(await fileItem.file.arrayBuffer());
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
      downloadFile(await mergedPdf.save(), "merged.pdf");
      alert("PDFs merged successfully!");
    } catch (error) {
      alert("Error merging PDFs: " + (error instanceof Error ? error.message : "Unknown error"));
    }
    setIsProcessing(false);
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-700 font-medium mb-2">Drop PDF files here or click to browse</p>
        <p className="text-sm text-gray-500">Select multiple PDFs to merge them</p>
        <input ref={fileInputRef} type="file" accept=".pdf" multiple onChange={handleFileInput} className="hidden" />
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">{files.length} file{files.length !== 1 ? "s" : ""} selected</h3>
            <button onClick={() => setFiles([])} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          </div>

          <div className="space-y-2 mb-6">
            {files.map((fileItem, index) => (
              <div key={fileItem.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{fileItem.name}</p>
                  <p className="text-sm text-gray-500">{formatSize(fileItem.size)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveFile(index, "up")} disabled={index === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveFile(index, "down")} disabled={index === files.length - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeFile(fileItem.id)} className="p-1 rounded hover:bg-red-100 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={mergePDFs}
            disabled={files.length < 2 || isProcessing}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Merging...</> : <><Merge className="w-4 h-4" /> Merge PDFs</>}
          </button>
        </div>
      )}
    </div>
  );
}

// =====================================================
// SPLIT TOOL
// =====================================================
function SplitTool({ onAction }: { onAction: (action: TabType) => Promise<boolean> }) { // Added onAction prop
  const [file, setFile] = useState<FileItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageRanges, setPageRanges] = useState<string>(""); // e.g., "1-5, 7, 10-12"
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const pdfFiles = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    if (pdfFiles.length > 0) setFile({ id: Math.random().toString(36).substr(2, 9), file: pdfFiles[0], name: pdfFiles[0].name, size: pdfFiles[0].size });
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const pdfFile = Array.from(e.target.files).filter(f => f.type === "application/pdf")[0];
      if (pdfFile) setFile({ id: Math.random().toString(36).substr(2, 9), file: pdfFile, name: pdfFile.name, size: pdfFile.size });
    }
  };

  const removeFile = () => setFile(null);

  const splitPDF = async () => {
    if (!file) return;
    if (!(await onAction("split"))) return; // Check usage/paywall
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.load(await file.file.arrayBuffer());
      const totalPages = pdfDoc.getPageCount();

      // Parse page ranges (e.g., "1-5, 7, 10-12")
      const ranges = pageRanges.split(',').map(r => r.trim()).filter(r => r.length > 0);
      let splitCount = 0;

      for (const range of ranges) {
        const pagesToSplit: number[] = [];
        const parts = range.split('-');
        if (parts.length === 1) { // Single page
          const pageNum = parseInt(parts[0]);
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            pagesToSplit.push(pageNum - 1); // 0-indexed
          }
        } else if (parts.length === 2) { // Page range
          const startPage = parseInt(parts[0]);
          const endPage = parseInt(parts[1]);
          if (!isNaN(startPage) && !isNaN(endPage) && startPage >= 1 && endPage <= totalPages && startPage <= endPage) {
            for (let i = startPage; i <= endPage; i++) {
              pagesToSplit.push(i - 1); // 0-indexed
            }
          }
        }

        if (pagesToSplit.length > 0) {
          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(pdfDoc, pagesToSplit);
          copiedPages.forEach(page => newPdf.addPage(page));
          downloadFile(await newPdf.save(), `split_${splitCount++}_${file.name}`);
        } else {
          console.warn(`Invalid page range: ${range}`);
        }
      }

      if (splitCount > 0) {
        alert(`${splitCount} PDF file(s) created successfully!`);
      } else {
        alert("No valid page ranges provided or found.");
      }

    } catch (error) {
      alert("Error splitting PDF: " + (error instanceof Error ? error.message : "Unknown error"));
    }
    setIsProcessing(false);
  };

  return (
    <div>
      {/* Upload Zone */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">Drop your PDF here or click to browse</p>
          <p className="text-sm text-gray-500">Select a single PDF file to split</p>
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-6">
            <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
            </div>
            <button onClick={removeFile} className="p-1 rounded hover:bg-red-100 text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-4">
            <label htmlFor="pageRanges" className="block text-sm font-medium text-gray-700 mb-1">
              Page Ranges to Split (e.g., "1-5, 7, 10-12")
            </label>
            <input
              id="pageRanges"
              type="text"
              value={pageRanges}
              onChange={(e) => setPageRanges(e.target.value)}
              placeholder="e.g., 1-3, 5, 8-10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
             <p className="text-xs text-gray-500 mt-1">Enter page numbers or ranges (e.g., 1-3 for pages 1 to 3, 5 for page 5). Each part separated by a comma.</p>
          </div>

          <button
            onClick={splitPDF}
            disabled={!file || pageRanges.length === 0 || isProcessing}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Splitting...</> : <><Scissors className="w-4 h-4" /> Split PDF</>}
          </button>
        </div>
      )}
    </div>
  );
}

// =====================================================
// IMAGES TO PDF TOOL
// =====================================================
function ImagesToPDFTool({ onAction }: { onAction: (action: TabType) => Promise<boolean> }) { // Added onAction prop
  const [images, setImages] = useState<ImageFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addImages(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/")));
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addImages(Array.from(e.target.files).filter(f => f.type.startsWith("image/")));
  };

  const addImages = (newFiles: File[]) => {
    setImages(prev => [...prev, ...newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file, name: file.name, size: file.size,
    }))]);
  };

  const removeImage = (id: string) => setImages(prev => prev.filter(f => f.id !== id));

  const moveImage = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === images.length - 1)) return;
    const newImages = [...images];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
  };

  const createPDFFromImages = async () => {
    if (images.length === 0) return;
    if (!(await onAction("imagetopdf"))) return; // Check usage/paywall
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const imageItem of images) {
        const imageBytes = await imageItem.file.arrayBuffer();
        let pdfImage: PDFImage;
        if (imageItem.file.type.includes("jpeg") || imageItem.file.type.includes("jpg")) {
          pdfImage = await pdfDoc.embedJpg(imageBytes);
        } else if (imageItem.file.type.includes("png")) {
          pdfImage = await pdfDoc.embedPng(imageBytes);
        } else {
          console.warn(`Unsupported image type: ${imageItem.file.type}`);
          continue; // Skip unsupported types
        }

        const page = pdfDoc.addPage();
        const { width, height } = pdfImage;
        // Scale image to fit within a standard page size (e.g., A4) while maintaining aspect ratio
        const pageHeight = 841.89; // A4 height in points
        const pageWidth = 595.28; // A4 width in points

        const scale = Math.min(pageWidth / width, pageHeight / height);
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;

        // Center the image on the page
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;

        page.drawImage(pdfImage, { x, y, width: scaledWidth, height: scaledHeight });
      }
      downloadFile(await pdfDoc.save(), "images.pdf");
      alert("PDF created successfully from images!");
    } catch (error) {
      alert("Error creating PDF from images: " + (error instanceof Error ? error.message : "Unknown error"));
    }
    setIsProcessing(false);
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-700 font-medium mb-2">Drop image files here or click to browse</p>
        <p className="text-sm text-gray-500">Supports JPG, PNG. Order matters!</p>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
      </div>

      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">{images.length} image{images.length !== 1 ? "s" : ""} selected</h3>
            <button onClick={() => setImages([])} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          </div>

          <div className="space-y-2 mb-6">
            {images.map((imageItem, index) => (
              <div key={imageItem.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{imageItem.name}</p>
                  <p className="text-sm text-gray-500">{formatSize(imageItem.size)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveImage(index, "up")} disabled={index === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveImage(index, "down")} disabled={index === images.length - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeImage(imageItem.id)} className="p-1 rounded hover:bg-red-100 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={createPDFFromImages}
            disabled={images.length === 0 || isProcessing}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating PDF...</> : <><FileText className="w-4 h-4" /> Create PDF from Images</>}
          </button>
        </div>
      )}
    </div>
  );
}

// =====================================================
// COMPRESS TOOL (Placeholder - pdf-lib has limitations)
// =====================================================
function CompressTool({ onAction }: { onAction: (action: TabType) => Promise<boolean> }) { // Added onAction prop
  return (
    <div className="p-8 border border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-center">
      <Minimize2 className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">PDF Compression</h3>
      <p className="text-gray-500 mb-4">
        Direct PDF compression is complex and often requires server-side processing or more advanced libraries for significant size reduction. pdf-lib currently offers limited compression capabilities.
      </p>
      <p className="text-gray-500 mb-4">
        We can explore server-side solutions or alternative libraries if this is a critical feature. For now, it's a placeholder.
      </p>
      <button onClick={() => onAction("compress")} className="py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
        <Zap className="w-4 h-4" /> Try Compression (Limited)
      </button>
    </div>
  );
}


// =====================================================
// MAIN PDF TOOLS CLIENT COMPONENT
// =====================================================
export default function PDFToolsClient() {
  const { user, isAuthenticated, isLoading } = useAuth(); // Get auth state
  const [activeTab, setActiveTab] = useState<TabType>("merge");
  const [usage, setUsage] = useState<{ count: number; limit: number; isPro: boolean }>({ count: 0, limit: 10, isPro: false });
  const [showPaywall, setShowPaywall] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  useEffect(() => {
    const loadUsageAndAuth = async () => {
      if (isLoading) return; // Don't load if auth is still checking
      
      // Fetch usage data
      const data = await getUsage();
      setUsage(data);
    };
    loadUsage();
  }, [isLoading, user]); // Re-run if auth state changes

  const handleAction = async (actionType: TabType): Promise<boolean> => {
    if (!isAuthenticated) {
      alert("Please sign in to use this feature.");
      // Optionally redirect to login page here, or handle it in UI
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    // The key should ideally be tied to user.id as well, but for simplicity we'll use today
    const key = `toolforge_usage_${user.id}_${today}`; 

    // Get current usage state
    const currentUsage = await getUsage();

    if (currentUsage.count >= currentUsage.limit && !currentUsage.isPro) {
      setShowPaywall(true);
      return false; // Prevent action
    }

    // Increment usage if within limits or Pro
    try {
      // incrementUsage internally checks if user is authenticated and uses Supabase
      const success = await incrementUsage(); 
      if (success) {
        setUsage(prev => ({ ...prev, count: prev.count + 1 }));
        return true;
      }
      else {
        // This case should ideally be caught by the check above, but as a fallback:
        setShowPaywall(true);
        return false;
      }
    } catch (error) {
      console.error("Error incrementing usage:", error);
      alert("An error occurred while tracking usage. Please try again.");
      return false;
    }
  };

  const redirectToCheckout = async () => {
    setIsLoadingCheckout(true);
    try {
      // Assuming user is authenticated here because they clicked upgrade
      const response = await fetch('/api/create-checkout',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Potentially pass auth token if needed by backend, but usually not required if backend verifies session directly
        },
        body: JSON.stringify({ priceId: 'price_pro_monthly' }) // Example price ID
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe checkout page
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Failed to redirect to checkout. Please try again. Error: ' + error.message);
    }
    setIsLoadingCheckout(false);
  };

  const tabs = [
    { id: "merge" as TabType, label: "Merge PDFs", icon: Merge },
    { id: "split" as TabType, label: "Split PDF", icon: Scissors },
    { id: "compress" as TabType, label: "Compress", icon: Minimize2 },
    { id: "imagetopdf" as TabType, label: "Images to PDF", icon: ImageIcon },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <Loader2 className="w-12 h-12 animate-spin" />
        <span className="ml-4">Loading your session...</span>
      </div>
    );
  }

  // If not authenticated and not loading, show login prompt or redirect
  if (!isAuthenticated && !user) {
      // You might want to redirect to a login page or show a modal asking to sign in.
      // For now, we'll display a message.
      return (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
              <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-6">Please sign in to use the PDF Toolkit.</p>
              <button
                  onClick={() => window.location.href = '/auth/login'} // Adjust if you have a router
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                  Sign In / Sign Up
              </button>
          </div>
      );
  }

  return (
    <div className="relative">
      {/* Usage Bar */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              {usage.isPro ? (
                <span className="text-green-600 flex items-center gap-1">
                  <Crown className="w-4 h-4" /> Pro - Unlimited
                </span>
              ) : (
                <>
                  Free tier: {usage.count}/{usage.limit} conversions today
                </>
              )}
            </span>
          </div>
          {!usage.isPro && (
            <button
              onClick={() => setShowPaywall(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
        
        {!usage.isPro && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${usage.count >= usage.limit ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min((usage.count / usage.limit) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">
                {usage.count >= usage.limit ? 'Daily Limit Reached' : 'Upgrade to Pro'}
              </h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              {usage.count >= usage.limit 
                ? "You've used all your free conversions for today."
                : "Get unlimited PDF conversions with ToolForge Pro."
              }
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Pro includes:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Unlimited PDF conversions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Merge, split, compress, image→PDF
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Priority processing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No daily limits
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">$9</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>
            </div>

            {usage.count >= usage.limit && (
              <div className="flex items-start gap-2 mb-4 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Your free limit resets tomorrow. Upgrade now to continue converting PDFs today.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaywall(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Maybe Later
              </button>
              <button
                onClick={redirectToCheckout}
                disabled={isLoadingCheckout}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                {isLoadingCheckout ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    Upgrade Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Tools - Wrapped with onAction prop */}
      {isAuthenticated && !isLoading && (
        <>
          <MergeTool onAction={handleAction} />
          <SplitTool onAction={handleAction} />
          <CompressTool onAction={handleAction} />
          <ImagesToPDFTool onAction={handleAction} />
        </>
      )}
    </div>
  );
}

// Need to import from lucide-react if not already imported in the file
// import { CheckCircle, Loader2, Crown, AlertTriangle, Zap } from "lucide-react"; // Already imported above

// Need to make sure these are available to the components if they are defined outside
// e.g. const handleAction = async (actionType) => { ... };
// or pass them down as props.

// For the edit, I'm targeting the import section.
// The goal is to insert the new state, useEffect, handleAction, redirectToCheckout, and the paywall modal JSX.

// I will edit the file to insert the state, useEffect, handleAction, redirectToCheckout, and the paywall modal JSX.
// Then, I will ensure the tool components receive the onAction prop.

// The exact oldText to find is:
// export default function PDFToolsClient() {
//   const [activeTab, setActiveTab] = useState<TabType>("merge");
//
//   const tabs = [

// The newText will be the entire component function with the new logic.

// Since edit by exact string replacement is problematic with large blocks, I will use write to replace the entire file content.
// The previous step already added the imports correctly.
// This step is to integrate the state, hooks, and paywall logic into the component function.

// Let's find the exact insertion point within the PDFToolsClient function.
// The insertion should be after `export default function PDFToolsClient() {` and before `const tabs = [

// The oldText to search for should be:
/*
export default function PDFToolsClient() {
  const [activeTab, setActiveTab] = useState<TabType>("merge");

  const tabs = [
*/

// The newText will be:
/*
export default function PDFToolsClient() {
  const { user, isAuthenticated, isLoading } = useAuth(); // Get auth state
  const [activeTab, setActiveTab] = useState<TabType>("merge");
  const [usage, setUsage] = useState<{ count: number; limit: number; isPro: boolean }>({ count: 0, limit: 10, isPro: false });
  const [showPaywall, setShowPaywall] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  useEffect(() => {
    const loadUsageAndAuth = async () => {
      if (isLoading) return; // Don't load if auth is still checking
      
      // Fetch usage data
      const data = await getUsage();
      setUsage(data);
    };
    loadUsage();
  }, [isLoading, user]); // Re-run if auth state changes

  const handleAction = async (actionType: TabType): Promise<boolean> => {
    if (!isAuthenticated) {
      alert("Please sign in to use this feature.");
      // Optionally redirect to login page here, or handle it in UI
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    // The key should ideally be tied to user.id as well, but for simplicity we'll use today
    const key = `toolforge_usage_${user.id}_${today}`; 

    // Get current usage state
    const currentUsage = await getUsage();

    if (currentUsage.count >= currentUsage.limit && !currentUsage.isPro) {
      setShowPaywall(true);
      return false; // Prevent action
    }

    // Increment usage if within limits or Pro
    try {
      // incrementUsage internally checks if user is authenticated and uses Supabase
      const success = await incrementUsage(); 
      if (success) {
        setUsage(prev => ({ ...prev, count: prev.count + 1 }));
        return true;
      }
      else {
        // This case should ideally be caught by the check above, but as a fallback:
        setShowPaywall(true);
        return false;
      }
    } catch (error) {
      console.error("Error incrementing usage:", error);
      alert("An error occurred while tracking usage. Please try again.");
      return false;
    }
  };

  const redirectToCheckout = async () => {
    setIsLoadingCheckout(true);
    try {
      // Assuming user is authenticated here because they clicked upgrade
      const response = await fetch('/api/create-checkout',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Potentially pass auth token if needed by backend, but usually not required if backend verifies session directly
        },
        body: JSON.stringify({ priceId: 'price_pro_monthly' }) // Example price ID
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe checkout page
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Failed to redirect to checkout. Please try again. Error: ' + error.message);
    }
    setIsLoadingCheckout(false);
  };

  const tabs = [
*/

// I will now write the complete file to ensure all parts are correctly integrated.
