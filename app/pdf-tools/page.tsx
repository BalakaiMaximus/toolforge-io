import ToolLayout from "../components/ToolLayout";
import PDFToolsClient from "./PDFTools.client";

export default function PDFToolsPage() {
  return (
    <ToolLayout
      title="PDF Toolkit"
      description="Manipulate your PDFs with ease: merge, split, compress, and convert images to PDF. All processed securely in your browser."
      category="PDF Tools"
    >
      <PDFToolsClient />
    </ToolLayout>
  );
}
