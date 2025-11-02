import React, { useState } from 'react';
import { AdvancedOptions } from '../types';
import AdvancedOptionsInput from './AdvancedOptionsInput';

interface ConceptInputProps {
  onSubmit: (concept: string, advancedOptions: AdvancedOptions) => void;
}

const ConceptInput: React.FC<ConceptInputProps> = ({ onSubmit }) => {
  const [concept, setConcept] = useState('');
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (concept.trim()) {
      onSubmit(concept, advancedOptions);
    }
  };

  return (
    <div className="bg-brand-surface p-6 sm:p-8 rounded-xl shadow-2xl animate-slide-up w-full max-w-3xl mx-auto border border-brand-primary/10">
      <h2 className="text-3xl font-serif text-center mb-4 text-brand-primary">Begin Your Story</h2>
      <p className="text-brand-text-secondary text-center mb-6">What is your novel about? A single sentence is enough to spark a universe.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="e.g., A detective in a cyberpunk city discovers a conspiracy that goes all the way to the top."
          className="w-full h-24 p-3 bg-brand-dark border border-brand-primary/30 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow"
          required
          data-tutorial-id="concept-input"
        />
        
        <div className="text-center">
            <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-brand-secondary hover:text-brand-primary transition-colors text-sm font-semibold"
                data-tutorial-id="advanced-options"
            >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
        </div>

        {showAdvanced && <AdvancedOptionsInput options={advancedOptions} setOptions={setAdvancedOptions} />}

        <button
          type="submit"
          className="w-full bg-brand-primary text-brand-bg font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50 transform hover:scale-105 shadow-glow-primary disabled:shadow-none disabled:scale-100 animate-subtle-pulse"
          disabled={!concept.trim()}
          data-tutorial-id="forge-button"
        >
          Forge the First Chapter
        </button>
      </form>
    </div>
  );
};

export default ConceptInput;