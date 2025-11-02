
import React from 'react';

const Disclaimer: React.FC = () => {
  return (
    <footer className="bg-brand-surface text-center p-4 mt-8">
      <p className="text-xs text-brand-text-secondary">
        This app uses the Gemini API and saves your progress in your browser.
        Extensive usage of the Gemini API may eventually incur charges.
      </p>
    </footer>
  );
};

export default Disclaimer;