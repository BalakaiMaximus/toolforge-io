"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { PDFDocument } from "pdf-lib";
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
} from "lucide-react";

type TabType = "merge" | "split" | "compress" | "imagetopdf";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
}

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

export default function PDFToolsClient() {
  const [activeTab, setActiveTab] = useState<TabType>("merge");

  const tabs = [
    { id: "merge" as TabType, label: "Merge PDFs", icon: Merge },
    { id: "split" as TabType, label: "Split PDF", icon: Scissors },
    { id: "compress" as TabType, label: "Compress", icon: Minimize2 },
    { id: "imagetopdf" as TabType, label: "Images to PDF", icon: ImageIcon },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-[2px] ${
                activeTab === tab.id
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === "merge" && <MergeTool />}
        {activeTab === "split" && <SplitTool />}
        {activeTab === "compress" && <CompressTool />}
        {activeTab === "imagetopdf" && <ImagesToPDFTool />}
      </div>
    </div>
  );
}

// =====================================================
// MERGE TOOL
// =====================================================
function MergeTool() {
  const [files, setFiles] = useState<PDFFile[]>([]);
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
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const pdf = await PDFDocument.load(await file.file.arrayBuffer());
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
      downloadFile(await mergedPdf.save(), "merged.pdf");
    } catch (error) {
      alert("Error merging PDFs: " + (error instanceof Error ? error.message : "Unknown error"));
    }
    setIsProcessing(false);
  };

  return (
    <div>
      {/* Upload Zone */}
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

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">{files.length} file{files.length !== 1 ? "s" : ""} selected</h3>
            <button onClick={() => setFiles([])} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          </div>

          <div className="space-y-2 mb-6">
            {files.map((file, index) => (
              <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveFile(index, "up")} disabled={index === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveFile(index, "down")} disabled={index === files.length - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeFile(file.id)} className="p-1 rounded hover:bg-red-100 text-red-600">
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
            {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Merging...</> : <><Merge className="w-5 h-5" /> Merge PDFs</>}
          </button>