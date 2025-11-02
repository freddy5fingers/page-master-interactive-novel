import { Novel } from '../types';

interface NovelCollection {
  novels: Record<string, Novel>;
  activeNovelId: string | null;
}

const NOVEL_COLLECTION_KEY = 'page-master-interactive-novels-collection';
const TEXT_SIZE_KEY = 'page-master-novel-text-size';
const TUTORIAL_SEEN_KEY = 'page-master-novel-tutorial-seen';

const loadNovelCollection = (): NovelCollection => {
  try {
    const collectionString = localStorage.getItem(NOVEL_COLLECTION_KEY);
    if (collectionString) {
      const collection = JSON.parse(collectionString);
      if (collection && typeof collection.novels === 'object') {
        return collection;
      }
    }
  } catch (error) {
    console.error("Failed to load novel collection:", error);
  }
  return { novels: {}, activeNovelId: null };
};

const saveNovelCollection = (collection: NovelCollection): void => {
  try {
    localStorage.setItem(NOVEL_COLLECTION_KEY, JSON.stringify(collection));
  } catch (error) {
    console.error("Failed to save novel collection:", error);
  }
};

export const saveNovelToCollection = (novel: Novel): void => {
  const collection = loadNovelCollection();
  collection.novels[novel.id] = novel;
  collection.activeNovelId = novel.id;
  saveNovelCollection(collection);
};

export const loadActiveNovel = (): Novel | null => {
  const collection = loadNovelCollection();
  if (collection.activeNovelId && collection.novels[collection.activeNovelId]) {
    return collection.novels[collection.activeNovelId];
  }
  return null;
};

export const getAllSavedNovels = (): Novel[] => {
    const collection = loadNovelCollection();
    return Object.values(collection.novels).sort((a, b) => Number(b.id) - Number(a.id));
};

export const setActiveNovelId = (id: string | null): void => {
  const collection = loadNovelCollection();
  collection.activeNovelId = id;
  saveNovelCollection(collection);
};

export const deleteNovelFromCollection = (id: string): void => {
  const collection = loadNovelCollection();
  delete collection.novels[id];
  if (collection.activeNovelId === id) {
    collection.activeNovelId = null;
  }
  saveNovelCollection(collection);
};


export const saveTextSize = (size: number): void => {
  try {
    localStorage.setItem(TEXT_SIZE_KEY, String(size));
  } catch (error) {
    console.error("Failed to save text size to local storage:", error);
  }
};

export const loadTextSize = (): number | null => {
  try {
    const sizeString = localStorage.getItem(TEXT_SIZE_KEY);
    if (sizeString === null) {
      return null;
    }
    const size = parseInt(sizeString, 10);
    return isNaN(size) ? null : size;
  } catch (error) {
    console.error("Failed to load text size from local storage:", error);
    return null;
  }
};

export const hasSeenTutorial = (): boolean => {
    try {
      return localStorage.getItem(TUTORIAL_SEEN_KEY) === 'true';
    } catch (error) {
      console.error("Failed to check tutorial status:", error);
      // Fail safe to not show tutorial if storage fails, assuming they've seen it.
      return true;
    }
  };
  
  export const markTutorialAsSeen = (): void => {
    try {
      localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    } catch (error) {
      console.error("Failed to mark tutorial as seen:", error);
    }
  };