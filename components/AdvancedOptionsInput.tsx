import React from 'react';
import { AdvancedOptions } from '../types';

interface AdvancedOptionsInputProps {
    options: AdvancedOptions;
    setOptions: (options: AdvancedOptions) => void;
}

type OptionKey = keyof AdvancedOptions;

const optionsConfig: { key: OptionKey; label: string; placeholder: string }[] = [
    { key: 'plot', label: 'Plot', placeholder: 'e.g., A classic hero\'s journey with a tragic twist.' },
    { key: 'characters', label: 'Characters', placeholder: 'e.g., A grizzled veteran protagonist and a naive but brilliant sidekick.' },
    { key: 'setting', label: 'Setting', placeholder: 'e.g., A sprawling, futuristic city perpetually drenched in rain.' },
    { key: 'theme', label: 'Theme', placeholder: 'e.g., Exploring the moral cost of technological advancement.' },
    { key: 'conflict', label: 'Conflict', placeholder: 'e.g., An internal struggle between duty and personal freedom.' },
    { key: 'pointOfView', label: 'Point of View', placeholder: 'e.g., First-person, from the perspective of the antagonist.' },
    { key: 'dialogue', label: 'Dialogue', placeholder: 'e.g., Witty and fast-paced, with a lot of subtext.' },
    { key: 'narrativeVoice', label: 'Narrative Voice', placeholder: 'e.g., Poetic, lyrical, and introspective.' },
];

const AdvancedOptionsInput: React.FC<AdvancedOptionsInputProps> = ({ options, setOptions }) => {
    
    const handleChange = (key: OptionKey, value: string) => {
        setOptions({ ...options, [key]: value });
    };

    return (
        <div className="space-y-4 p-4 border border-brand-primary/20 rounded-lg bg-brand-bg/50">
            {optionsConfig.map(({ key, label, placeholder }) => (
                <div key={key}>
                    <label htmlFor={key} className="block text-sm font-medium text-brand-text-secondary mb-1">
                        {label}
                    </label>
                    <textarea
                        id={key}
                        value={options[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full p-2 bg-brand-bg border border-brand-primary/30 rounded-md focus:ring-1 focus:ring-brand-primary focus:outline-none transition-shadow text-sm"
                        rows={2}
                    />
                </div>
            ))}
        </div>
    );
};

export default AdvancedOptionsInput;