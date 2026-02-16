import ToolLayout from "../components/ToolLayout";

export default function CaseConverterPage() {
  return (
    <ToolLayout
      title="Case Converter"
      description="Convert text between various case formats. Useful for programming, writing, and data formatting."
      category="Text Tools"
    >
      <CaseConverterClient />
    </ToolLayout>
  );
}
