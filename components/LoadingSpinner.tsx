
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-brand-secondary rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-brand-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-brand-secondary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        <p className="ml-4 text-brand-text-secondary">The page master is thinking...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;