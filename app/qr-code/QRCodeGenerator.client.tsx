"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import QRCode from 'qrcode'; // Import the qrcode library
import {
  QrCode, Upload, Download, Copy, RefreshCcw, Palette, Star, Key, Mail, Wifi, CreditCard, Loader2 
} from "lucide-react";
import { getUsage, incrementUsage } from "@/lib/usage";
import { useAuth } from "@/context/AuthContext";

// Constants for free tier limits and Pro features
const FREE_QR_LIMIT = 10;
const PRO_FEATURE_MSG = "This feature requires a Pro subscription.";

// Mock data for Pro features - will be replaced by actual components/logic
const ProFeaturesDisplay = () => (
  <div className="mt-4 p-4 border border-green-300 bg-green-50 rounded-lg text-sm text-green-700">
    <h4 className="font-semibold mb-2">Pro Features Available:</h4>
    <ul className="list-disc list-inside">
      <li>Custom Colors & Logo Embedding</li>
      <li>WiFi, vCard, Email QR Codes</li>
      <li>Batch Generation</li>
    </ul>
  </div>
);

export default function QRCodeGeneratorClient() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [qrData, setQrData] = useState("");
  const [qrCodeString, setQrCodeString] = useState(""); // Store the generated QR code data URL
  const [qrSize, setQrSize] = useState(256);
  const [qrColor, setQrColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [qrType, setQrType] = useState("text"); // "text", "url", "wifi", "vcard"
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState("WPA");
  const [vCardData, setVCardData] = useState({ fn: "", tel: "", email: "", url: "" });

  const [usage, setUsage] = useState({ count: 0, limit: FREE_TIER_LIMIT, isPro: false });
  const [showPaywall, setShowPaywall] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [qrGeneratedCount, setQrGeneratedCount] = useState(0);

  // State for displaying different QR code types
  const [currentInputType, setCurrentInputType] = useState("text"); // text, url, wifi, vcard

  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Effect to load usage data on mount and when auth state changes
  useEffect(() => {
    const loadUsageAndAuth = async () => {
      if (isLoading) return;
      
      const data = await getUsage();
      setUsage(data);
      if (!isAuthenticated) {
        // If not authenticated, reset usage data for guest/local tracking
        // Or decide on a guest limit.
        // For now, assume unauthenticated users have 0 usage and 0 limit.
        setUsage({ count: 0, limit: 0, isPro: false });
      }
    };
    loadUsageAndAuth();
  }, [isLoading, user]); // Depend on auth state

  // Handle action gating (for free tier limit)
  const handleAction = async (actionType: string): Promise<boolean> => {
    if (!isAuthenticated) {
      alert("Please sign in to use the QR Code Generator.");
      // Optionally redirect to login
      return false;
    }

    if (usage.isPro) {
      return true; // Pro users have unlimited access
    }

    if (usage.count >= usage.limit) {
      setShowPaywall(true);
      return false;
    }

    // Increment usage if within limits
    try {
      const success = await incrementUsage();
      if (success) {
        setUsage(prev => ({ ...prev, count: prev.count + 1 }));
        return true;
      }
      else {
        // If increment failed for some reason, show paywall
        setShowPaywall(true);
        return false;
      }
    } catch (error) {
      console.error("Error incrementing usage:", error);
      alert("An error occurred while tracking usage. Please try again.");
      return false;
    }
  };

  // Redirect to Stripe checkout
  const redirectToCheckout = async () => {
    // ... (Implementation for redirectToCheckout from PDFToolsClient)
    // For now, assume it works and redirects. This will need to be implemented properly.
    alert("Redirecting to Stripe checkout...");
    setShowPaywall(false);
    // Example: window.location.href = '/api/create-checkout?priceId=price_qr_pro';
  };

  const generateQRCode = async () => {
    if (!qrData) {
      alert("Please enter data to generate QR code.");
      return;
    }

    if (!(await handleAction("qr_code"))) {
      return; // Paywall triggered or not authenticated
    }

    try {
      const qrPayload = {
        input: qrData,
        // Add other options based on qrType and user input
        size: qrSize,
        color: {
          dark: qrColor,
          light: bgColor
        },
        // For Pro features like logo, batch, etc., check usage.isPro
      };

      if (qrType === "wifi") {
        qrPayload.input = `WIFI:S:${wifiSsid};T:${wifiSecurity};P:${wifiPassword};;`;
      } else if (qrType === "vcard") {
        qrPayload.input = `BEGIN:VCARD\nVERSION:3.0\nFN:${vCardData.fn}\nTEL:${vCardData.tel}\nEMAIL:${vCardData.email}\nURL:${vCardData.url}\nEND:VCARD`;
      }
      // Add more types as needed...

      // Use the qrcode library to generate QR code
      const url = await QRCode.toDataURL(qrPayload.input, {
        width: qrSize,
        margin: 2,
        color: {
          dark: qrPayload.color.dark,
          light: qrPayload.color.light,
        },
        // errorCorrectionLevel: 'H' // example for Pro feature
      });
      setQrCodeString(url);

      // Increment count only after successful generation
      // (handleAction already does this before calling generateQRCode)

    } catch (err) {
      console.error("Error generating QR code:", err);
      alert("Error generating QR code. Please check your input and settings.");
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeString) return;
    const link = document.createElement('a');
    link.href = qrCodeString;
    link.download = `qrcode_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      // TODO: Implement logo embedding logic (more complex)
      alert("Logo embedding is a Pro feature and is still under development!");
    }
  };

  const renderQrCodeInput = () => {
    switch (qrType) {
      case "wifi":
        return (
          <div className="space-y-3">
            <input type="text" placeholder="SSID (Network Name)" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} className="input-field" />
            <input type="password" placeholder="Password" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} className="input-field" />
            <select value={wifiSecurity} onChange={(e) => setWifiSecurity(e.target.value)} className="input-field">
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
            </select>
          </div>
        );
      case "vcard":
        return (
          <div className="space-y-3">
            <input type="text" placeholder="Full Name (FN)" value={vCardData.fn} onChange={(e) => setVCardData({ ...vCardData, fn: e.target.value })} className="input-field" />
            <input type="tel" placeholder="Phone (TEL)" value={vCardData.tel} onChange={(e) => setVCardData({ ...vCardData, tel: e.target.value })} className="input-field" />
            <input type="email" placeholder="Email" value={vCardData.email} onChange={(e) => setVCardData({ ...vCardData, email: e.target.value })} className="input-field" />
            <input type="url" placeholder="Website (URL)" value={vCardData.url} onChange={(e) => setVCardData({ ...vCardData, url: e.target.value })} className="input-field" />
          </div>
        );
      default: // text or url
        return (
          <textarea
            placeholder="Enter text or URL"
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            className="input-field h-32 resize-none"
            rows={4}
          />
        );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">QR Code Generator</h1>

      {/* Usage Bar and Upgrade Button */} 
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="text-base font-medium text-gray-700">
              {usage.isPro ? (
                <span className="text-green-600 flex items-center gap-1"><Crown className="w-5 h-5" /> Pro - Unlimited</span>
              ) : (
                `Free tier: ${usage.count}/${usage.limit} QR codes today`
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
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${usage.count >= 8 ? 'bg-red-500' : 'bg-blue-500'}`}
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
                : "Get unlimited QR code generations with ToolForge Pro."
              }
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Pro includes:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Unlimited QR codes</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Custom Colors & Logo</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> WiFi, vCard, Email, SMS</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Batch Generation</li>
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
                <p className="text-sm text-yellow-800">Your free limit resets tomorrow. Upgrade now to continue generating QR codes today.</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowPaywall(false)} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Maybe Later</button>
              <button onClick={redirectToCheckout} disabled={isLoading} className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2">
                {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>) : (<><Crown className="w-4 h-4" /> Upgrade Now</>)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Generator Interface */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="p-6 border border-gray-300 rounded-xl bg-gray-50 flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Generate QR Code</h2>
            
            <div className="flex flex-col gap-1">
              <label htmlFor="qr-type" className="text-sm font-medium text-gray-700">QR Code Type</label>
              <select id="qr-type" value={qrType} onChange={(e) => {
                setQrType(e.target.value as typeof qrType);
                setQrData(""); // Clear data when type changes
                setWifiSsid(""); setWifiPassword(""); setWifiSecurity("WPA"); // Reset WiFi fields
                setVCardData({ fn: "", tel: "", email: "", url: "" }); // Reset vCard fields
              }} className="input-field">
                <option value="text">Text</option>
                <option value="url">URL</option>
                <option value="wifi">WiFi</option>
                <option value="vcard">vCard</option>
              </select>
            </div>

            {renderQrCodeInput()}

            <div className="flex flex-col gap-1">
              <label htmlFor="qr-size" className="text-sm font-medium text-gray-700">Size (px)</label>
              <input type="range" id="qr-size" min="100" max="500" step="10" value={qrSize} onChange={(e) => setQrSize(parseInt(e.target.value))} className="w-full" />
              <span className="text-xs text-gray-500">{qrSize}px</span>
            </div>

            {/* Basic Customization (Free Tier) */} 
            <div className="flex flex-col gap-1">
              <label htmlFor="qr-color" className="text-sm font-medium text-gray-700">QR Color</label>
              <input type="color" id="qr-color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="h-10 border-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="bg-color" className="text-sm font-medium text-gray-700">Background Color</label>
              <input type="color" id="bg-color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 border-none" />
            </div>

            {/* Pro Feature: Logo Upload */} 
            {!usage.isPro && (
              <div className="p-3 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-700 font-medium mb-1">Upload Logo (Pro Feature)</p>
                <p className="text-xs text-gray-500">Enhance your QR codes with your brand!</p>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </div>
            )}

            <button onClick={generateQRCode} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><QrCode className="w-5 h-5" /> Generate QR Code</>}
            </button>
          </div>
        </div>

        {/* QR Code Display and Download */} 
        <div className="w-full md:w-1/2 flex flex-col items-center gap-4">
          {qrCodeString ? (
            <>
              <h3 className="text-lg font-semibold">Your QR Code:</h3>
              <canvas ref={qrCodeCanvasRef} style={{ width: `${qrSize}px`, height: `${qrSize}px` }}></canvas>
              <div className="flex gap-3">
                <button onClick={downloadQRCode} className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2"><Download className="w-4 h-4" /> Download</button>
                <button onClick={() => { setQrCodeString(""); setQrData(""); /* Reset state */ }} className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"><Trash2 className="w-4 h-4" /> Clear</button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-lg">
              Enter data and settings to generate your QR code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
