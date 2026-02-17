"use client";

import { useState, useMemo } from "react";
import TextAreaTool from "../components/TextAreaTool";
import { toUpperCase, toLowerCase, toCamelCase, toSnakeCase, toKebabCase, toTitleCase } from "../lib/textUtils";
import { Copy } from "lucide-react";

export default function CaseConverterClient() {
  const [text, setText] = useState("");

  const cases = [
    { label: "Uppercase", fn: toUpperCase },
    { label: "Lowercase", fn: toLowerCase },
    { label: "Camel Case", fn: toCamelCase },
    { label: "Snake Case", fn: toSnakeCase },
    { label: "Kebab Case", fn: toKebabCase },
    { label: "Title Case", fn: toTitleCase },
  ];

  const convertedTexts = useMemo(() => {
    const results: { label: string; value: string }[] = [];
    if (!text) return results;

    cases.forEach((caseOption) => {
      results.push({
        label: caseOption.label,
        value: caseOption.fn(text),
      });
    });
    return results;
  }, [text]);

  const handleCopy = (textToCopy: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <TextAreaTool 
        label="Your Text"
        value={text}
        onChange={setText}
        placeholder="Paste or type your text here..."
        rows={8}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {convertedTexts.map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-lg border border-gray-200 p-4 space-y-2"
          >
            <h3 className="font-medium text-gray-900">{item.label}</h3>
            <div className="relative">
              <textarea
                value={item.value}
                readOnly
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none font-mono text-sm"
              />
              <button
                onClick={() => handleCopy(item.value)}
                className="absolute top-1 right-1 px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition"
              >
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-6 mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Related Tools</h4>
        <div className="flex flex-wrap gap-2">
          <a href="/word-counter" className="text-sm text-blue-600 hover:underline">Word Counter</a>
        </div>
      </div>
    </div>
  );
}
