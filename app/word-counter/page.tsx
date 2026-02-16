import { Metadata } from "next";
import ToolLayout from "../components/ToolLayout";
import TextAreaTool from "../components/TextAreaTool";
import { countWords, countChars, estimateReadingTime } from "../lib/textUtils";

export const metadata: Metadata = {
  title: "Word Counter - Count Words & Characters Online | ToolForge",
  description:
    "Count words, characters, and estimate reading time for your text. Free, fast, and client-side tool for writers and editors.",
  keywords: "word counter, character count, reading time, text analysis",
};

export default function WordCounterPage() {
  return (
    <ToolLayout
      title="Word Counter"
      description="Analyze your text: count words, characters, lines, and estimate reading time. Paste your text below to get instant statistics."
      category="Text Tools"
    >
      <WordCounterClient />
    </ToolLayout>
  );
}

"use client";

import { useState, useMemo } from "react";

function WordCounterClient() {
  const [text, setText] = useState("");
  
  const wordCount = useMemo(() => countWords(text), [text]);
  const charCount = useMemo(() => countChars(text, true), [text]);
  const charCountNoSpaces = useMemo(() => countChars(text, false), [text]);
  const lines = countLines(text);
  const readingTime = useMemo(() => estimateReadingTime(wordCount), [wordCount]);

  return (
    <div className="space-y-6">
      <TextAreaTool 
        label="Your Text"
        value={text}
        onChange={setText}
        placeholder="Paste or type your text here..."
        rows={10}
        maxLength={5000} // Example max length
      />

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-lg font-bold text-gray-900">{wordCount.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Words</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-lg font-bold text-gray-900">{charCount.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Characters</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-lg font-bold text-gray-900">{charCountNoSpaces.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Chars (no spaces)</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-lg font-bold text-gray-900">{lines}</p>
            <p className="text-sm text-gray-500">Lines</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-700 font-medium">Estimated Reading Time: {readingTime}</p>
        </div>
      </div>

      {/* Related Tools */}
      <div className="border-t border-gray-200 pt-6 mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Related Tools</h4>
        <div className="flex flex-wrap gap-2">
          <a href="/case-converter" className="text-sm text-blue-600 hover:underline">Case Converter</a>
        </div>
      </div>
    </div>
  );
}
