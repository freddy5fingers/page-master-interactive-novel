import React from 'react';

interface ExploreThemeButtonProps {
  themeName: string;
  onGenerate: (themeName: string) => void;
  isGenerating: boolean;
}

const ExploreThemeButton: React.FC<ExploreThemeButtonProps> = ({ themeName, onGenerate, isGenerating }) => {
  return (
    <button
      onClick={() => onGenerate(themeName)}
      disabled={isGenerating}
      className="bg-brand-secondary/10 border border-brand-secondary/30 text-brand-secondary text-xs font-semibold py-1 px-3 rounded-full hover:bg-brand-secondary/20 hover:border-brand-secondary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
    >
      {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-brand-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exploring...
          </>
      ) : (
        `Explore Theme: ${themeName}`
      )}
    </button>
  );
};

export default ExploreThemeButton;