import React from 'react';
import { Theme } from '../types';

interface ThemeViewerProps {
  isOpen: boolean;
  onClose: () => void;
  themes: Theme[];
}

const ThemeViewer: React.FC<ThemeViewerProps> = ({ isOpen, onClose, themes }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-brand-primary/20 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-brand-primary/20 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-serif text-brand-primary">Novel Themes</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text text-3xl font-light">&times;</button>
        </div>
        
        <div className="overflow-y-auto p-6 space-y-6">
          {themes.length === 0 ? (
            <p className="text-brand-text-secondary text-center">No themes have been explored yet.</p>
          ) : (
            themes.map((theme) => (
              <div key={theme.name} className="bg-brand-dark/50 p-4 rounded-lg">
                <h3 className="text-xl font-bold font-serif text-brand-secondary mb-2">{theme.name}</h3>
                <p className="text-brand-text leading-relaxed whitespace-pre-wrap">{theme.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeViewer;