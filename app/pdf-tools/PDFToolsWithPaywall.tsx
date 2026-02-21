"use client";

import { useState, useEffect } from "react";
import { Crown, AlertTriangle, Zap } from "lucide-react";
import PDFToolsClient from "./PDFTools.client";

interface UsageData {
  count: number;
  limit: number;
  isPro: boolean;
}

export default function PDFToolsWithPaywall() {
  const [usage, setUsage] = useState<UsageData>({ count: 0, limit: 10, isPro: false });
  const [showPaywall, setShowPaywall] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkUsage();
  }, []);

  const checkUsage = async () => {
    const today = new Date().toISOString().split('T')[0];
    const key = `toolforge_usage_${today}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      const data = JSON.parse(stored);
      setUsage({
        count: data.count || 0,
        limit: 10,
        isPro: data.isPro || false
      });
    }
  };

  const handleAction = async (actionType: 'merge' | 'split' | 'compress' | 'imagetopdf') => {
    const today = new Date().toISOString().split('T')[0];
    const key = `toolforge_usage_${today}`;
    const stored = localStorage.getItem(key);
    const currentCount = stored ? JSON.parse(stored).count || 0 : 0;
    const isPro = stored ? JSON.parse(stored).isPro || false : false;

    if (currentCount >= 10 && !isPro) {
      setShowPaywall(true);
      return false;
    }

    // Increment usage
    localStorage.setItem(key, JSON.stringify({
      count: currentCount + 1,
      isPro: isPro
    }));
    
    setUsage(prev => ({ ...prev, count: currentCount + 1 }));
    return true;
  };

  const redirectToCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: 'price_pro_monthly' })
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to redirect to checkout. Please try again.');
    }
    setIsLoading(false);
  };

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
                  Free tier: {usage.count}/10 conversions today
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
              className={`h-2 rounded-full transition-all ${
                usage.count >= 8 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min((usage.count / 10) * 100, 100)}%` }}
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
                {usage.count >= 10 ? 'Daily Limit Reached' : 'Upgrade to Pro'}
              </h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              {usage.count >= 10 
                ? "You've used all 10 free conversions for today."
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

            {usage.count >= 10 && (
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
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
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

      {/* PDF Tools */}
      <PDFToolsClient />
    </div>
  );
}

// Need to import from lucide-react
import { CheckCircle, Loader2 } from "lucide-react";
