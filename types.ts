export interface CharacterProfile {
  name: string;
  description: string;
  imageUrl: string;
}

export interface Chapter {
  id: string;
  text: string;
  choices: string[];
  choiceMade: string | null;
  newThemes?: string[];
  newCharacters?: string[];
  isEnding?: boolean;
  narrativeStage: string;
}

export interface ChapterData {
  text: string;
  choices: string[];
  newThemes?: string[];
  newCharacters?: string[];
  isEnding?: boolean;
  narrativeStage: string;
}

export interface AdvancedOptions {
  plot?: string;
  characters?: string;
  setting?: string;
  theme?: string;
  conflict?: string;
  pointOfView?: string;
  dialogue?: string;
  narrativeVoice?: string;
}

export interface Theme {
    name: string;
    description: string;
}

export interface Novel {
  id: string;
  name: string;
  concept: string;
  chapters: Chapter[];
  advancedOptions?: AdvancedOptions;
  themes?: Theme[];
  characterProfiles?: CharacterProfile[];
  lastSaved?: any; // Used for sorting novels from Firestore
}

export enum GameState {
  CONCEPT = 'CONCEPT',
  READING = 'READING',
  CHOOSING = 'CHOOSING',
  ENDED = 'ENDED',
}
