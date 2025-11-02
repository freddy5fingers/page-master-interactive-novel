import React, { useMemo, useState } from 'react';
import { Novel } from '../types';

interface FullNovelViewerProps {
  isOpen: boolean;
  onClose: () => void;
  novel: Novel | null;
}

const FullNovelViewer: React.FC<FullNovelViewerProps> = ({ isOpen, onClose, novel }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');

  const fullStoryText = useMemo(() => {
    if (!novel) return '';
    let story = `Title: Page Master Interactive Novel\nConcept: ${novel.concept}\n\n---\n\n`;
    novel.chapters.forEach((chapter, index) => {
      story += `CHAPTER ${index + 1}\n\n`;
      story += `${chapter.text}\n\n`;
      if (chapter.choiceMade) {
        story += `YOUR CHOICE: ${chapter.choiceMade}\n\n---\n\n`;
      }
    });
    return story;
  }, [novel]);

  if (!isOpen || !novel) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullStoryText).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setCopyButtonText('Failed to copy');
       setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([fullStoryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'page-master-interactive-novel.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-brand-primary/20 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-brand-primary/20 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-serif text-brand-primary">Your Completed Novel</h2>
            <p className="text-sm text-brand-text-secondary truncate pr-4">{novel.concept}</p>
          </div>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text text-3xl font-light">&times;</button>
        </div>
        
        <div className="overflow-y-auto p-6 md:p-8 bg-brand-page">
            <pre className="whitespace-pre-wrap font-serif text-brand-ink bg-transparent p-0 m-0 text-lg leading-relaxed">
                {fullStoryText}
            </pre>
        </div>
        
        <div className="p-4 border-t border-brand-primary/20 flex-shrink-0 flex justify-end items-center gap-4">
            <button
              onClick={handleCopy}
              className="bg-brand-primary/20 text-brand-primary font-bold py-2 px-4 rounded-lg hover:bg-brand-primary/40 transition-all duration-300 w-40 text-center"
            >
              {copyButtonText}
            </button>
            <button
              onClick={handleDownload}
              className="bg-brand-secondary text-brand-bg font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors duration-300"
            >
              Download .txt
            </button>
        </div>
      </div>
    </div>
  );
};

export default FullNovelViewer;