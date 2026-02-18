import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChunkErrorBoundary from "./components/ChunkErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ToolForge - Free Online Utilities",
  description: "A collection of free, fast, client-side tools for developers and creators. Image compression, text conversion, JSON formatting, and more.",
  keywords: "online tools, image compressor, JSON formatter, word counter, base64, UUID generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__chunkErrors = [];
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('ChunkLoadError')) {
                  window.__chunkErrors.push(e.message);
                  console.warn('Chunk load error, will reload:', e.message);
                  // Prevent multiple reloads
                  if (!window.__reloading) {
                    window.__reloading = true;
                    setTimeout(function() {
                      window.location.reload(true);
                    }, 100);
                  }
                }
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <ChunkErrorBoundary>
          {children}
        </ChunkErrorBoundary>
      </body>
    </html>
  );
}
