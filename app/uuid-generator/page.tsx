import { Metadata } from "next";
import ToolLayout from "../components/ToolLayout";
import UUIDGeneratorClient from "./UUIDGenerator.client";

export const metadata: Metadata = {
  title: "Base64 Encoder/Decoder & UUID Generator | ToolForge",
  description:
    "Encode and decode text using Base64. Generate UUID v4 identifiers easily. Free, fast, and client-side.",
  keywords: "base64 encoder, base64 decoder, uuid generator, uuid v4, text encoding",
};

export default function Base64AndUUIDPage() {
  return (
    <ToolLayout
      title="Base64 & UUID Tools"
      description="Encode/decode text with Base64, generate UUIDs. Essential tools for developers."
      category="Developer Tools"
    >
      <UUIDGeneratorClient />
    </ToolLayout>
  );
}
