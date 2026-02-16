import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  category: string;
  backHref?: string;
}

export default function ToolLayout({
  children,
  title,
  description,
  category,
  backHref = "/",
}: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={backHref}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <span className="text-sm text-blue-600 font-medium">{category}</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">{description}</p>
        </div>

        {/* Tool Interface */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          {children}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Is this tool free to use?
              </h3>
              <p className="text-gray-600">
                Yes, all tools on ToolForge are completely free and run entirely in your browser.
                No registration or payment required.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. All processing happens client-side on your device. Your files and data
                never leave your browser or get uploaded to any server.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Can I use this on mobile?
              </h3>
              <p className="text-gray-600">
                Yes, all tools are fully responsive and work on mobile devices, tablets, and desktops.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} ToolForge. Free online utilities for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
}
