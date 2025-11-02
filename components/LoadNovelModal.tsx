import React from 'react';
import { Novel } from '../types';

interface LoadNovelModalProps {
  isOpen: boolean;
  onClose: () => void;
  novels: Novel[];
  onLoad: (novelId: string) => void;
  onDelete: (novelId: string) => void;
}

const LoadNovelModal: React.FC<LoadNovelModalProps> = ({ isOpen, onClose, novels, onLoad, onDelete }) => {
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
        <div className="p-4 border-b border-brand-primary/20 flex justify-between items-center">
          <h2 className="text-2xl font-serif text-brand-primary">Load Saved Novel</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text text-3xl font-light">&times;</button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">
          {novels.length === 0 ? (
            <p className="text-brand-text-secondary text-center">You have no saved novels.</p>
          ) : (
            novels.map((novel) => (
              <div key={novel.id} className="bg-brand-dark/50 p-4 rounded-lg flex justify-between items-center gap-4">
                <p className="text-brand-text truncate" title={novel.name}>
                  {novel.name}
                </p>
                <div className="flex-shrink-0 flex gap-2">
                  <button
                    onClick={() => onLoad(novel.id)}
                    className="bg-brand-secondary text-brand-bg font-bold py-1 px-3 rounded-lg hover:bg-opacity-80 transition-colors"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => onDelete(novel.id)}
                    className="bg-red-500/20 text-red-400 font-bold py-1 px-3 rounded-lg hover:bg-red-500/40 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadNovelModal;
