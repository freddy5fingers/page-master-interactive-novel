import React from 'react';

interface ChoiceButtonProps {
  text: string;
  onClick: () => void;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full max-w-2xl text-left p-4 bg-brand-surface border border-transparent rounded-lg hover:border-brand-primary transition-all duration-300 group shadow-md hover:shadow-glow-primary"
    >
      <div className="flex justify-between items-center">
        <span className="text-brand-text group-hover:text-white transition-colors">{text}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    </div>
    </button>
  );
};

export default ChoiceButton;