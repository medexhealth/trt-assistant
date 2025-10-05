import React from 'react';

interface ResultDisplayProps {
  result: string;
}

// A simple markdown to HTML converter
const Markdown: React.FC<{ content: string }> = ({ content }) => {
    const htmlContent = content
        // Process headings first to style them and prevent them getting extra line breaks
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-blue-300 mt-6 mb-4">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\n/g, '<br />') // Newlines
        .replace(/(\d+\.\s)/g, '<br />$1') // Add break before numbered list
        .replace(/-\s(.*?)(<br \/>|$)/g, '<li class="ml-4 list-disc">$1</li>'); // Unordered list
        
    // Clean up extra line breaks that might appear after a heading tag
    const cleanedHtml = htmlContent.replace(/(<\/h3>)\s*<br \/>/g, '$1');

    return <div dangerouslySetInnerHTML={{ __html: cleanedHtml }} />;
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold text-blue-400 mb-4">Analysis Report</h2>
      <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
        <Markdown content={result} />
      </div>
    </div>
  );
};

export default ResultDisplay;
