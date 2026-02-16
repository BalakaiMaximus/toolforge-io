import { Metadata } from "next";
import ToolCard from "./components/ToolCard";
import {
  ImageIcon,
  Type,
  Code,
  Compress,
  Scaling,
  FileType,
  Hash,
  Key,
} from "lucide-react";

export const metadata: Metadata = {
  title: "ToolForge - Free Online Developer Tools",
  description:
    "A collection of free, fast, client-side tools for developers and creators. Image compression, text conversion, JSON formatting, and more.",
  keywords: "online tools, image compressor, JSON formatter, word counter, base64, UUID generator",
};

const tools = [
  {
    category: "Image Tools",
    items: [
      {
        title: "Image Compressor",
        description:
          "Reduce image file size without losing quality. Supports JPG and PNG formats with adjustable compression levels.",
        href: "/image-compressor",
        icon: Compress,
      },
      {
        title: "Image Resizer",
        description:
          "Resize images to exact dimensions. Maintain aspect ratio or set custom width and height.",
        href: "/image-resizer",
        icon: Scaling,
      },
      {
        title: "Image Converter",
        description:
          "Convert between JPG and PNG formats. Optimize images for web use with a single click.",
        href: "/image-converter",
        icon: FileType,
      },
    ],
  },
  {
    category: "Text Tools",
    items: [
      {
        title: "Word Counter",
        description:
          "Count words, characters, and estimate reading time. Perfect for writers and content creators.",
        href: "/word-counter",
        icon: Hash,
      },
      {
        title: "Case Converter",
        description:
          "Convert text between various case formats. Useful for programming, writing, and data formatting.",
        href: "/case-converter",
        icon: Type,
      },
    ],
  },
  {
    category: "Developer Tools",
    items: [
      {
        title: "JSON Formatter",
        description:
          "Format, validate, and minify JSON data. Make your JSON readable with proper indentation.",
        href: "/json-formatter",
        icon: Code,
      },
      {
        title: "Base64 Tool",
        description:
          "Encode text to Base64 or decode Base64 back to text. Essential for data encoding tasks.",
        href: "/base64-tool",
        icon: Key,
      },
      {
        title: "UUID Generator",
        description:
          "Generate UUID v4 identifiers for your applications. Create single or multiple UUIDs instantly.",
        href: "/uuid-generator",
        icon: Key,
      },
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Free Online Tools for{" "}
              <span className="text-blue-600">Developers</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              A collection of fast, free, and privacy-focused utilities. All
              tools run entirely in your browser — no uploads, no tracking, no
              signup required.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                100% Free
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Client-Side Only
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                No Registration
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Tools Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {tools.map((section, sectionIndex) => (
          <section key={sectionIndex} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gray-200"></div>
              <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-wider">
                {section.category}
              </h2>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((tool, toolIndex) => (
                <ToolCard
                  key={toolIndex}
                  title={tool.title}
                  description={tool.description}
                  href={tool.href}
                  icon={tool.icon}
                  category={section.category}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Features Section */}
      <section className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Private & Secure
              </h3>
              <p className="text-gray-600">
                All processing happens in your browser. Your data never leaves
                your device.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                No server uploads means instant results. Optimized for speed and
                performance.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Works Everywhere
              </h3>
              <p className="text-gray-600">
                Fully responsive design works on desktop, tablet, and mobile
                devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-xl font-bold">ToolForge</h3>
              <p className="text-gray-400 text-sm mt-1">
                Free tools for developers and creators
              </p>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} ToolForge. Open source utilities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
