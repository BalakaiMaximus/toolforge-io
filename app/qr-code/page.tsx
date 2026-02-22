import ToolLayout from "../components/ToolLayout";
import QRCodeGeneratorClient from "./QRCodeGenerator.client";

export default function QRCodePage() {
  return (
    <ToolLayout
      title="QR Code Generator"
      description="Create custom QR codes for URLs, text, WiFi credentials, vCards, and more. Free tier with basic options, Pro tier for advanced features."
      category="Utilities"
    >
      <QRCodeGeneratorClient />
    </ToolLayout>
  );
}
