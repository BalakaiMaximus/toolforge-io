import ToolLayout from "../components/ToolLayout";
import WordCounterClient from "./WordCounter.client";

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
