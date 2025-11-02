import React from 'react';

interface LandingPageProps {
    onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-brand-dark text-white flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold font-serif text-brand-primary tracking-wide mb-4">
                Page Master
            </h1>
            <h2 className="text-2xl md:text-3xl font-serif text-brand-secondary mb-8">
                Your Interactive Novel, Forged by AI
            </h2>
            <p className="max-w-3xl text-lg text-brand-text-secondary mb-12">
                Craft compelling stories where your choices truly matter. Provide a concept, and our advanced AI storyteller will weave a unique narrative that evolves with every decision you make. Explore themes, generate character profiles, and watch your world come to life.
            </p>
            <button
                onClick={onStart}
                className="bg-brand-secondary text-brand-bg font-bold py-4 px-10 text-xl rounded-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105 shadow-glow-secondary animate-subtle-pulse"
            >
                Start Your First Chapter (Free)
            </button>
             <p className="text-xs text-brand-text-secondary mt-8">
                No account needed to start.
            </p>
        </div>
    );
};

export default LandingPage;
