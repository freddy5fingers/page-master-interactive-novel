import React from 'react';
import Typewriter from './Typewriter';

type AudioStatus = 'idle' | 'generating' | 'playing';

const ReadAloudButton: React.FC<{
  status: AudioStatus;
  onClick: () => void;
}> = ({ status, onClick }) => {
  const Icon = () => {
    if (status === 'generating') {
      return (
        <svg className="animate-spin h-5 w-5 text-brand-ink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
    if (status === 'playing') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-ink" viewBox="0 0 20 20" fill="currentColor">
          <rect x="7" y="7" width="6" height="6" rx="1" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-ink" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <button
      onClick={onClick}
      className="absolute bottom-2 right-2 p-2 rounded-full bg-brand-ink/10 hover:bg-brand-ink/20 transition-colors"
      aria-label={status === 'playing' ? 'Stop reading' : 'Read aloud'}
    >
      <Icon />
    </button>
  );
};

interface ChatBubbleProps {
  text: string;
  actions?: React.ReactNode;
  animate?: boolean;
  chapterId: string;
  onReadAloud: (chapterId: string, text: string) => void;
  audioStatus: AudioStatus;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  text,
  actions,
  animate = false,
  chapterId,
  onReadAloud,
  audioStatus,
}) => {
  const hasActions = React.Children.count(actions) > 0;
  return (
    <div className="animate-fade-in group">
        <div className="bg-brand-page rounded-xl rounded-bl-none p-5 pr-12 max-w-2xl shadow-lg relative">
            <p className="text-brand-ink leading-relaxed font-serif whitespace-pre-wrap">
                {animate ? (
                    <Typewriter text={text} speed={30} />
                ) : (
                    text
                )}
            </p>
            <ReadAloudButton
                status={audioStatus}
                onClick={() => onReadAloud(chapterId, text)}
            />
        </div>
         {hasActions && (
            <div className="flex justify-start items-center flex-wrap gap-2 mt-3 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {actions}
            </div>
        )}
    </div>
  );
};

export default ChatBubble;