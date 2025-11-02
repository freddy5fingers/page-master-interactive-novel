import React from 'react';
import { User } from 'firebase/auth';

interface HeaderProps {
    onStartNew: () => void;
    onViewThemes: () => void;
    hasThemes: boolean;
    onViewCharacters: () => void;
    hasCharacters: boolean;
    onLoadNovels: () => void;
    textSize: number;
    onIncreaseTextSize: () => void;
    onDecreaseTextSize: () => void;
    minTextSize: number;
    maxTextSize: number;
    defaultTextSize: number;
    user: User | null;
    isSubscribed: boolean;
    onLogin: () => void;
    onLogout: () => void;
    onUpgrade: () => void;
}

const Header: React.FC<HeaderProps> = ({
    onStartNew,
    onViewThemes,
    hasThemes,
    onViewCharacters,
    hasCharacters,
    onLoadNovels,
    textSize,
    onIncreaseTextSize,
    onDecreaseTextSize,
    minTextSize,
    maxTextSize,
    defaultTextSize,
    user,
    isSubscribed,
    onLogin,
    onLogout,
    onUpgrade
}) => {
  return (
    <header className="bg-brand-surface sticky top-0 z-20 shadow-lg border-b border-brand-primary/10">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold font-serif text-brand-primary tracking-wide">
          Page Master
        </h1>
        <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 bg-brand-primary/10 rounded-lg p-1">
                <button
                    onClick={onDecreaseTextSize}
                    disabled={textSize <= minTextSize}
                    className="text-brand-primary font-bold py-1 px-2 rounded-md hover:bg-brand-primary/20 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Decrease text size"
                >
                    A-
                </button>
                <span className="text-brand-text-secondary text-xs w-8 text-center font-mono" aria-live="polite" aria-atomic="true">
                    {Math.round((textSize / defaultTextSize) * 100)}%
                </span>
                <button
                    onClick={onIncreaseTextSize}
                    disabled={textSize >= maxTextSize}
                    className="text-brand-primary font-bold py-1 px-2 rounded-md hover:bg-brand-primary/20 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Increase text size"
                >
                    A+
                </button>
            </div>
            <button
              onClick={onViewCharacters}
              disabled={!hasCharacters}
              className="bg-brand-primary/10 text-brand-primary font-bold py-2 px-4 rounded-lg hover:bg-brand-primary/20 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Characters
            </button>
            <button
              onClick={onViewThemes}
              disabled={!hasThemes}
              className="bg-brand-primary/10 text-brand-primary font-bold py-2 px-4 rounded-lg hover:bg-brand-primary/20 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Themes
            </button>
            {user && (
                 <button
                    onClick={onLoadNovels}
                    className="bg-brand-primary/10 text-brand-primary font-bold py-2 px-4 rounded-lg hover:bg-brand-primary/20 transition-colors duration-300"
                    >
                    My Novels
                </button>
            )}

            {user ? (
                <>
                    {!isSubscribed && (
                        <button
                            onClick={onUpgrade}
                            className="bg-yellow-500/20 text-yellow-400 font-bold py-2 px-4 rounded-lg hover:bg-yellow-500/40 transition-colors"
                        >
                            Upgrade
                        </button>
                    )}
                     <div className="flex items-center gap-3">
                        <img 
                            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'A')}&background=BB86FC&color=121212&bold=true`}
                            alt={user.displayName || 'User profile'}
                            className="w-9 h-9 rounded-full border-2 border-brand-primary/50 object-cover"
                            title={`Logged in as ${user.displayName || 'Anonymous User'}`}
                        />
                        <button onClick={onLogout} className="bg-brand-primary/10 text-brand-primary font-bold py-2 px-4 rounded-lg hover:bg-brand-primary/20 transition-colors duration-300">
                            Logout
                        </button>
                    </div>
                </>
            ) : (
                <button onClick={onLogin} className="bg-brand-primary/10 text-brand-primary font-bold py-2 px-4 rounded-lg hover:bg-brand-primary/20 transition-colors duration-300">
                    Login
                </button>
            )}
           
            <button
              onClick={onStartNew}
              className="bg-brand-secondary text-brand-bg font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Start New
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;