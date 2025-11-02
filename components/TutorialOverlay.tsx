import React, { useState, useEffect, useRef } from 'react';

interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const tutorialSteps: TutorialStep[] = [
  {
    targetId: 'concept-input',
    title: '1/3: Start Your Adventure',
    content: 'Welcome! Type a single sentence here to define the concept for your unique story. Be creative!',
    placement: 'bottom',
  },
  {
    targetId: 'advanced-options',
    title: '2/3: Refine Your Vision',
    content: 'For more control, click here to add details about the plot, characters, and setting. This helps guide the AI.',
    placement: 'bottom',
  },
  {
    targetId: 'forge-button',
    title: '3/3: Begin the Tale',
    content: 'Once you\'re ready, click this button to generate the very first chapter of your novel.',
    placement: 'top',
  }
];

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ isOpen, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = tutorialSteps[stepIndex];

  useEffect(() => {
    if (!isOpen || !currentStep) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const targetElement = document.querySelector(`[data-tutorial-id='${currentStep.targetId}']`);
      if (targetElement) {
        setTargetRect(targetElement.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    const timeoutId = setTimeout(updatePosition, 100);

    window.addEventListener('resize', updatePosition);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, currentStep]);

  if (!isOpen) {
    return null;
  }

  const handleNext = () => {
    if (stepIndex < tutorialSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!targetRect || !tooltipRef.current) return { opacity: 0 };
    const tooltipHeight = tooltipRef.current.offsetHeight;
    const tooltipWidth = tooltipRef.current.offsetWidth;
    const spacing = 15;
    let top, left;

    switch (currentStep.placement) {
      case 'top':
        top = targetRect.top - tooltipHeight - spacing;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + spacing;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - spacing;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + spacing;
        break;
    }
    
    // Clamp to viewport
    const margin = 10;
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin));
    
    return { top, left };
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 animate-fade-in" onClick={onClose}></div>
      
      {/* Spotlight */}
      {targetRect && (
        <div
          className="fixed rounded-lg transition-all duration-500 ease-in-out pointer-events-none"
          style={{
            top: `${targetRect.top - 5}px`,
            left: `${targetRect.left - 5}px`,
            width: `${targetRect.width + 10}px`,
            height: `${targetRect.height + 10}px`,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
          }}
        ></div>
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed bg-brand-surface rounded-lg p-5 w-80 shadow-2xl border border-brand-primary/20 transition-all duration-500 ease-in-out animate-slide-up"
        style={getTooltipPosition()}
      >
        <h3 className="text-xl font-serif text-brand-secondary mb-2">{currentStep.title}</h3>
        <p className="text-brand-text-secondary mb-4 text-sm">{currentStep.content}</p>
        <div className="flex justify-between items-center">
          <button onClick={onClose} className="text-xs text-brand-text-secondary hover:text-white transition-colors">
            Skip Tutorial
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button onClick={handlePrev} className="bg-brand-primary/20 text-brand-primary font-bold py-1 px-3 rounded-md hover:bg-brand-primary/40 transition-colors">
                Prev
              </button>
            )}
            <button onClick={handleNext} className="bg-brand-secondary text-brand-bg font-bold py-1 px-3 rounded-md hover:bg-opacity-80 transition-colors">
              {stepIndex === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
