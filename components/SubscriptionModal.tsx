import React from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  isLoading: boolean;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSubscribe, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-xl shadow-2xl w-full max-w-lg flex flex-col border border-brand-primary/20 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-brand-primary/20 flex justify-between items-center">
          <h2 className="text-2xl font-serif text-brand-primary">Unlock the Full Story</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text text-3xl font-light">&times;</button>
        </div>
        
        <div className="p-8 space-y-6">
          <p className="text-brand-text-secondary">You've reached the end of your free preview. Subscribe to Page Master Pro to continue your adventure!</p>
          <ul className="space-y-3 text-brand-text">
            <li className="flex items-center">
              <CheckIcon /> Unlimited Chapters & Novels
            </li>
            <li className="flex items-center">
              <CheckIcon /> Save Your Progress to the Cloud
            </li>
            <li className="flex items-center">
              <CheckIcon /> Generate Unlimited Character Profiles
            </li>
             <li className="flex items-center">
              <CheckIcon /> Explore All Story Themes
            </li>
          </ul>
          <button
            onClick={onSubscribe}
            disabled={isLoading}
            className="w-full bg-brand-secondary text-brand-bg font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50 transform hover:scale-105 shadow-glow-secondary flex items-center justify-center"
          >
            {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : "Subscribe Now - $5/month"}
          </button>
           <p className="text-xs text-brand-text-secondary text-center">Login with Google required to subscribe.</p>
        </div>
      </div>
    </div>
  );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-brand-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default SubscriptionModal;
