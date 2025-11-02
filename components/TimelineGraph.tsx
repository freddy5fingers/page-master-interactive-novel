

import React from 'react';
import { Chapter } from '../types';

interface TimelineGraphProps {
  currentStage: string;
  chapters: Chapter[];
  onRevert: (chapterIndex: number) => void;
}

const STORY_STRUCTURE = {
  'Beginning': ['Introduction', 'Inciting Incident', 'Goal'],
  'Middle': ['Rising Action', 'Character Development', 'Turning Points', 'Climax'],
  'End': ['Falling Action', 'Resolution', 'New Equilibrium', 'Payoff'],
};

const ALL_STAGES = Object.values(STORY_STRUCTURE).flat();

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const TimelineGraph: React.FC<TimelineGraphProps> = ({ currentStage, chapters, onRevert }) => {
  const currentStageIndex = ALL_STAGES.indexOf(currentStage);

  const getStatus = (index: number) => {
    if (index < currentStageIndex) return 'completed';
    if (index === currentStageIndex) return 'active';
    return 'future';
  };

  const findChapterIndexForStage = (stageName: string): number => {
    return chapters.findIndex(c => c.narrativeStage === stageName);
  };

  return (
    <div className="bg-brand-surface/50 p-4 rounded-lg border border-brand-primary/10 mb-6 animate-fade-in">
      <div className="w-full">
        <div className="flex justify-between items-start">
          {Object.entries(STORY_STRUCTURE).map(([sectionTitle, stages]) => (
            <div key={sectionTitle} className="flex-1 px-2 text-center">
                <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider mb-4">{sectionTitle}</h3>
                <div className="relative flex justify-between items-center w-full pt-2">
                {stages.map((stageName) => {
                    const stageIndex = ALL_STAGES.indexOf(stageName);
                    const status = getStatus(stageIndex);
                    const chapterIndexForRevert = findChapterIndexForStage(stageName);

                    const canRevert = status === 'completed' && chapterIndexForRevert !== -1;

                    const dotClasses = {
                        completed: 'bg-brand-secondary',
                        active: 'bg-brand-secondary ring-4 ring-brand-secondary/40 animate-pulse',
                        future: 'bg-brand-text-secondary/30',
                    };

                    const textClasses = {
                        completed: 'text-brand-text-secondary group-hover:text-brand-primary',
                        active: 'text-brand-secondary font-bold scale-110',
                        future: 'text-brand-text-secondary/50',
                    };
                    
                    const NodeContent = (
                        <>
                            <div className={`w-4 h-4 rounded-full transition-all duration-500 z-10 flex items-center justify-center ${dotClasses[status]}`}>
                                {status === 'completed' && <CheckIcon />}
                            </div>
                            <p className={`absolute -bottom-7 text-xs transition-all duration-500 ${textClasses[status]}`}>
                                {stageName}
                            </p>
                        </>
                    );

                     if (canRevert) {
                      return (
                          <button 
                            key={stageName}
                            onClick={() => onRevert(chapterIndexForRevert)}
                            className="flex-1 flex flex-col items-center group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary rounded-full"
                            aria-label={`Revert story to: ${stageName}`}
                          >
                              {NodeContent}
                          </button>
                      )
                    }

                    return (
                        <div key={stageName} className="flex-1 flex flex-col items-center group relative">
                            {NodeContent}
                        </div>
                    );
                })}
                 <div className="absolute top-[8px] left-0 w-full h-0.5 bg-brand-text-secondary/30 transform -translate-y-1/2"></div>
                 <div 
                    className="absolute top-[8px] left-0 h-0.5 bg-brand-secondary transform -translate-y-1/2 transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max(0, (currentStageIndex / (ALL_STAGES.length -1 )) * 100)}%` }}
                 ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineGraph;