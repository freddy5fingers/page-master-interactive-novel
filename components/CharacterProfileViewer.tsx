import React from 'react';
import { CharacterProfile } from '../types';

interface CharacterProfileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: CharacterProfile[];
}

const CharacterProfileViewer: React.FC<CharacterProfileViewerProps> = ({ isOpen, onClose, profiles }) => {
  if (!isOpen) return null;

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
          <h2 className="text-2xl font-serif text-brand-primary">Character Profiles</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text text-3xl font-light">&times;</button>
        </div>
        
        <div className="overflow-y-auto p-6 space-y-8">
          {profiles.length === 0 ? (
            <p className="text-brand-text-secondary text-center">No character profiles have been generated yet.</p>
          ) : (
            profiles.map((profile) => (
              <div key={profile.name} className="md:flex md:items-start md:space-x-6 bg-brand-dark/50 p-4 rounded-lg">
                <div className="md:w-1/3 flex-shrink-0">
                    <img src={profile.imageUrl} alt={`Portrait of ${profile.name}`} className="w-full rounded-lg shadow-lg object-cover aspect-[4/5]" />
                </div>
                <div className="md:w-2/3 mt-4 md:mt-0">
                    <h3 className="text-2xl font-bold font-serif text-brand-secondary mb-2">{profile.name}</h3>
                    <p className="text-brand-text leading-relaxed whitespace-pre-wrap">{profile.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterProfileViewer;