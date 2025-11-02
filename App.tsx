import React, { useState, useRef, useEffect } from 'react';
import { Chapter, GameState, Novel, AdvancedOptions, Theme, CharacterProfile } from './types';
import { generateFirstChapter, generateNextChapter, generateThemeDescription, generateCharacterProfile, generateSpeech } from './services/geminiService';
import { saveNovelToCollection, loadActiveNovel, setActiveNovelId, deleteNovelFromCollection, getAllSavedNovels, saveTextSize, loadTextSize, hasSeenTutorial, markTutorialAsSeen } from './services/storageService';
import Header from './components/Header';
import Disclaimer from './components/Disclaimer';
import ConceptInput from './components/ConceptInput';
import ChatBubble from './components/ChatBubble';
import ChoiceButton from './components/ChoiceButton';
import LoadingSpinner from './components/LoadingSpinner';
import ThemeViewer from './components/ThemeViewer';
import ExploreThemeButton from './components/ExploreThemeButton';
import CharacterProfileViewer from './components/CharacterProfileViewer';
import GenerateProfileButton from './components/GenerateProfileButton';
import FullNovelViewer from './components/FullNovelViewer';
import LoadNovelModal from './components/LoadNovelModal';
import TimelineGraph from './components/TimelineGraph';
import TutorialOverlay from './components/TutorialOverlay';
import { User } from 'firebase/auth';
// Fix: Import 'auth' from firebaseService.
import { onAuthChange, isUserSubscribed, signInWithGoogle, logout, redirectToCheckout, auth, saveNovelForUser, getAllNovelsForUser, deleteNovelForUser } from './services/firebaseService';
import LandingPage from './components/LandingPage';
import SubscriptionModal from './components/SubscriptionModal';
import { firebaseConfig } from './firebaseConfig';

const MIN_TEXT_SIZE = 12;
const MAX_TEXT_SIZE = 24;
const DEFAULT_TEXT_SIZE = 16;
const TEXT_SIZE_STEP = 2;
const TRIAL_CHAPTER_LIMIT = 1;

type AudioStatus = 'idle' | 'generating' | 'playing';
type AppView = 'landing' | 'app';

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.CONCEPT);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isThemeViewerOpen, setIsThemeViewerOpen] = useState<boolean>(false);
  const [isCharacterViewerOpen, setIsCharacterViewerOpen] = useState<boolean>(false);
  const [isNovelViewerOpen, setIsNovelViewerOpen] = useState<boolean>(false);
  const [isLoadNovelModalOpen, setIsLoadNovelModalOpen] = useState<boolean>(false);
  const [allNovels, setAllNovels] = useState<Novel[]>([]);
  const [generatingTheme, setGeneratingTheme] = useState<string | null>(null);
  const [generatingCharacterProfile, setGeneratingCharacterProfile] = useState<string | null>(null);
  const [textSize, setTextSize] = useState<number>(() => loadTextSize() || DEFAULT_TEXT_SIZE);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [audioState, setAudioState] = useState<{ status: AudioStatus; chapterId: string | null }>({ status: 'idle', chapterId: null });
  
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [isSubModalLoading, setIsSubModalLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<{ domain: string; projectId: string } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const chapters = novel?.chapters || [];

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
        try {
            setError(null);
            setUser(firebaseUser);
            if (firebaseUser) {
                // User is logged in
                const subscribed = await isUserSubscribed(firebaseUser.uid);
                setIsSubscribed(subscribed);

                // Migrate local novel if it exists
                const localNovel = loadActiveNovel();
                if (localNovel) {
                    await saveNovelForUser(firebaseUser.uid, localNovel);
                    setActiveNovelId(null); // Clear local after migration
                }

                // Load user's novels from Firestore
                const userNovels = await getAllNovelsForUser(firebaseUser.uid);
                setAllNovels(userNovels);

                const activeNovel = userNovels.length > 0 ? userNovels[0] : null; // Sorted by date
                if (activeNovel) {
                    setNovel(activeNovel);
                    setCurrentView('app');
                    const lastChapter = activeNovel.chapters[activeNovel.chapters.length - 1];
                    setGameState(lastChapter.isEnding ? GameState.ENDED : GameState.CHOOSING);
                } else {
                    handleStartNew(true);
                }
            } else {
                // User is logged out (or is a new anonymous user)
                setIsSubscribed(false);
                const activeNovel = loadActiveNovel();
                if (activeNovel) {
                    setNovel(activeNovel);
                    setCurrentView('app');
                    const lastChapter = activeNovel.chapters[activeNovel.chapters.length - 1];
                    setGameState(lastChapter.isEnding ? GameState.ENDED : GameState.CHOOSING);
                } else {
                    setCurrentView('landing');
                    if (!hasSeenTutorial()) {
                        setShowTutorial(true);
                    }
                }
                setAllNovels(getAllSavedNovels());
            }
        } catch (e: any) {
            setError(e.message || "Failed to sync your account data. Please refresh the page.");
        }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutSuccess = urlParams.get('checkout') === 'success';

    // When the user returns from a successful checkout and their subscription status is confirmed
    if (checkoutSuccess && isSubscribed) {
      // Clean the URL to prevent re-triggering on refresh
      window.history.replaceState({}, document.title, window.location.pathname);

      // Check if there was a choice they were trying to make
      const pendingChoice = sessionStorage.getItem('pendingChoice');
      if (pendingChoice) {
        sessionStorage.removeItem('pendingChoice');
        
        // Use a short timeout to ensure the novel/state is fully loaded before proceeding
        setTimeout(() => {
            handleChoiceSubmit(pendingChoice);
        }, 100); 
      }
    }
  }, [isSubscribed]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chapters, isLoading]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${textSize}px`;
    saveTextSize(textSize);
  }, [textSize]);

  const handleStartApp = () => {
    setCurrentView('app');
    setGameState(GameState.CONCEPT);
  };

  const handleStartNew = (isLoggedInUser: boolean = !!user) => {
    if (isLoggedInUser) {
        setNovel(null);
        setGameState(GameState.CONCEPT);
        setError(null);
        setCurrentView('app');
    } else {
        setActiveNovelId(null);
        setNovel(null);
        setGameState(GameState.CONCEPT);
        setError(null);
        setCurrentView('landing');
    }
  };

  const handleIncreaseTextSize = () => {
    setTextSize(currentSize => Math.min(MAX_TEXT_SIZE, currentSize + TEXT_SIZE_STEP));
  };

  const handleDecreaseTextSize = () => {
    setTextSize(currentSize => Math.max(MIN_TEXT_SIZE, currentSize - TEXT_SIZE_STEP));
  };

  const updateNovelAndSave = async (updatedNovel: Novel) => {
    setNovel(updatedNovel);
    try {
      setError(null);
      if (user) {
          await saveNovelForUser(user.uid, updatedNovel);
          const updatedNovels = await getAllNovelsForUser(user.uid);
          setAllNovels(updatedNovels);
      } else {
          saveNovelToCollection(updatedNovel);
          setAllNovels(getAllSavedNovels());
      }
    } catch (e: any) {
        setError(e.message || "A problem occurred while saving your progress. Please check your connection.");
    }
  };

  const handleConceptSubmit = async (concept: string, advancedOptions: AdvancedOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      const firstChapterData = await generateFirstChapter(concept, advancedOptions);
      const newNovelId = Date.now().toString();
      const firstChapter: Chapter = { 
        id: `${newNovelId}-0`,
        ...firstChapterData, 
        choiceMade: null 
      };
      
      const newNovel: Novel = {
        id: newNovelId,
        name: concept,
        concept: concept,
        chapters: [firstChapter],
        advancedOptions: advancedOptions,
        themes: [],
        characterProfiles: [],
      };

      await updateNovelAndSave(newNovel);
      setGameState(GameState.CHOOSING);
    } catch (err) {
      console.error(err);
      setError("Failed to start the story. The AI might be busy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoiceSubmit = async (choice: string) => {
    if (!novel || chapters.length === 0) return;

    if (chapters.length >= TRIAL_CHAPTER_LIMIT && !isSubscribed) {
        // User has hit the paywall. Save their intended choice before showing the modal.
        sessionStorage.setItem('pendingChoice', choice);
        setIsSubscriptionModalOpen(true);
        return;
    }

    const currentChapters = [...chapters];
    const lastChapter = { ...currentChapters[currentChapters.length - 1] };
    lastChapter.choiceMade = choice;
    currentChapters[currentChapters.length - 1] = lastChapter;
    
    const updatedNovelForUI: Novel = { ...novel, chapters: currentChapters };
    setNovel(updatedNovelForUI);

    setIsLoading(true);
    setError(null);
    
    try {
        const storySoFar = currentChapters.map(c => c.text).join('\n\n');
        const nextChapterData = await generateNextChapter(storySoFar, choice, novel.advancedOptions);
        const nextChapter: Chapter = {
             id: `${novel.id}-${currentChapters.length}`,
             ...nextChapterData, 
             choiceMade: null 
        };

        const finalNovel: Novel = { ...updatedNovelForUI, chapters: [...currentChapters, nextChapter] };

        await updateNovelAndSave(finalNovel);
        
        if (nextChapter.isEnding) {
            setGameState(GameState.ENDED);
        }

    } catch (err) {
        console.error(err);
        setError("Failed to generate the next chapter. Please try again.");
        const revertedChapters = [...chapters];
        const originalLastChapter = { ...revertedChapters[revertedChapters.length - 1] };
        originalLastChapter.choiceMade = null;
        revertedChapters[revertedChapters.length - 1] = originalLastChapter;
        setNovel({ ...novel, chapters: revertedChapters });
    } finally {
        setIsLoading(false);
    }
  };

  const handleGenerateTheme = async (themeName: string) => {
    if (!novel || novel.themes?.some(t => t.name === themeName)) return;
    setGeneratingTheme(themeName);
    setError(null);
    try {
        const storySoFar = novel.chapters.map(c => c.text).join('\n\n');
        const description = await generateThemeDescription(themeName, storySoFar);
        const newTheme: Theme = { name: themeName, description };
        const updatedNovel: Novel = { ...novel, themes: [...(novel.themes || []), newTheme] };
        await updateNovelAndSave(updatedNovel);
    } catch (err) {
        console.error(err);
        setError(`Failed to generate description for theme: "${themeName}". Please try again.`);
    } finally {
        setGeneratingTheme(null);
    }
  };

  const handleGenerateCharacterProfile = async (characterName: string) => {
    if (!novel || novel.characterProfiles?.some(c => c.name === characterName)) return;
    setGeneratingCharacterProfile(characterName);
    setError(null);
    try {
        const storySoFar = novel.chapters.map(c => c.text).join('\n\n');
        const { description, imageUrl } = await generateCharacterProfile(characterName, storySoFar, novel.concept);
        const newProfile: CharacterProfile = { name: characterName, description, imageUrl };
        const updatedNovel: Novel = { ...novel, characterProfiles: [...(novel.characterProfiles || []), newProfile] };
        await updateNovelAndSave(updatedNovel);
    } catch (err) {
        console.error(err);
        setError(`Failed to generate profile for character: "${characterName}". Please try again.`);
    } finally {
        setGeneratingCharacterProfile(null);
    }
  };

  const handleLoadNovelFromModal = (novelId: string) => {
    const novelToLoad = allNovels.find(n => n.id === novelId);
    if (novelToLoad) {
      setNovel(novelToLoad);
      const lastChapter = novelToLoad.chapters[novelToLoad.chapters.length - 1];
      setGameState(lastChapter.isEnding ? GameState.ENDED : GameState.CHOOSING);
      setError(null);
      setIsLoadNovelModalOpen(false);
    }
  };

  const handleDeleteNovelFromModal = async (novelId: string) => {
    try {
        setError(null);
        if (user) {
            await deleteNovelForUser(user.uid, novelId);
            const updatedNovels = await getAllNovelsForUser(user.uid);
            setAllNovels(updatedNovels);
            if (novel?.id === novelId) {
                handleStartNew(true);
            }
        } else {
            deleteNovelFromCollection(novelId);
            const updatedNovels = getAllSavedNovels();
            setAllNovels(updatedNovels);
            if (novel?.id === novelId) {
                handleStartNew(false);
            }
        }
    } catch (e: any) {
        setError(e.message || "A problem occurred while deleting the novel.");
    }
  };

  const handleTimelineRevert = async (chapterIndex: number) => {
    if (!novel) return;

    const revertedChapters = novel.chapters.slice(0, chapterIndex + 1);

    if (revertedChapters.length > 0) {
      const lastChapter = { ...revertedChapters[revertedChapters.length - 1] };
      lastChapter.choiceMade = null;
      revertedChapters[revertedChapters.length - 1] = lastChapter;
    }

    const revertedNovel: Novel = {
      ...novel,
      chapters: revertedChapters,
    };

    await updateNovelAndSave(revertedNovel);
    setGameState(GameState.CHOOSING);
    setError(null);
  };

  const handleTutorialClose = () => {
    markTutorialAsSeen();
    setShowTutorial(false);
  };

  const handleReadAloud = async (chapterId: string, text: string) => {
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
    }

    if (audioState.status === 'playing' && audioState.chapterId === chapterId) {
        setAudioState({ status: 'idle', chapterId: null });
        return;
    }

    if (!audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        } catch (e) {
            console.error("Web Audio API is not supported.", e);
            setError("Audio playback is not supported in your browser.");
            return;
        }
    }
    const audioContext = audioContextRef.current;
    
    setAudioState({ status: 'generating', chapterId });

    try {
        const base64Audio = await generateSpeech(text);
        const decodedData = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedData, audioContext, 24000, 1);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        source.onended = () => {
            setAudioState(prevState => {
                if (prevState.chapterId === chapterId) {
                    return { status: 'idle', chapterId: null };
                }
                return prevState;
            });
            audioSourceRef.current = null;
        };

        source.start();
        audioSourceRef.current = source;
        setAudioState({ status: 'playing', chapterId });
    } catch (err) {
        console.error("Failed to generate or play audio:", err);
        setError("Sorry, I couldn't read that aloud. Please try again.");
        setAudioState({ status: 'idle', chapterId: null });
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      // On successful sign-in, the onAuthChange listener will update the user state and migrate data.
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname || 'localhost';
        setAuthError({ domain: currentDomain, projectId: firebaseConfig.projectId });
      } else {
        console.error("Login failed:", error);
        alert("An unexpected error occurred during sign-in. Please try again later.");
      }
    }
  };

  const handleSubscribe = async () => {
      if (!user) {
        try {
          await signInWithGoogle();
          // After login, the auth listener will fire. The user may need to click subscribe again.
          // This is a simple implementation; a more robust one might automatically continue.
          if (!auth.currentUser) { // Check again after sign-in attempt
            alert("Login is required to subscribe. Please try again.");
            return;
          }
        } catch (error) {
            // Error is already handled and alerted by handleLogin
            return;
        }
      }
      setIsSubModalLoading(true);
      await redirectToCheckout();
      // No need to set loading to false, as the page will redirect.
      // If the user cancels, they come back and the modal will be closed.
  };

  const lastChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;

  if (currentView === 'landing') {
    return <LandingPage onStart={handleStartApp} />;
  }

  return (
    <div className="min-h-screen bg-brand-dark font-sans flex flex-col">
      <Header
        onStartNew={() => handleStartNew()}
        onViewThemes={() => setIsThemeViewerOpen(true)}
        hasThemes={(novel?.themes?.length || 0) > 0}
        onViewCharacters={() => setIsCharacterViewerOpen(true)}
        hasCharacters={(novel?.characterProfiles?.length || 0) > 0}
        onLoadNovels={async () => {
            try {
                setError(null);
                if (user) {
                    const userNovels = await getAllNovelsForUser(user.uid);
                    setAllNovels(userNovels);
                } else {
                    setAllNovels(getAllSavedNovels());
                }
                setIsLoadNovelModalOpen(true);
            } catch (e: any) {
                setError(e.message || "Could not load saved novels.");
                setIsLoadNovelModalOpen(false);
            }
        }}
        textSize={textSize}
        onIncreaseTextSize={handleIncreaseTextSize}
        onDecreaseTextSize={handleDecreaseTextSize}
        minTextSize={MIN_TEXT_SIZE}
        maxTextSize={MAX_TEXT_SIZE}
        defaultTextSize={DEFAULT_TEXT_SIZE}
        user={user}
        isSubscribed={isSubscribed}
        onLogin={handleLogin}
        onLogout={logout}
        onUpgrade={() => setIsSubscriptionModalOpen(true)}
      />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
        {novel && lastChapter && gameState !== GameState.CONCEPT && (
          <TimelineGraph
            currentStage={lastChapter.narrativeStage}
            chapters={chapters}
            onRevert={handleTimelineRevert}
          />
        )}
        <div className="flex-grow overflow-y-auto space-y-10 pr-2 pt-8">
          {chapters.map((chapter, index) => (
            <div key={chapter.id}>
              <ChatBubble
                text={chapter.text}
                animate={index === chapters.length - 1}
                chapterId={chapter.id}
                onReadAloud={handleReadAloud}
                audioStatus={audioState.chapterId === chapter.id ? audioState.status : 'idle'}
                actions={
                  <>
                    {chapter.newThemes && chapter.newThemes
                      .filter(themeName => !novel?.themes?.some(t => t.name === themeName))
                      .map(themeName => (
                        <ExploreThemeButton
                          key={themeName}
                          themeName={themeName}
                          onGenerate={handleGenerateTheme}
                          isGenerating={generatingTheme === themeName}
                        />
                      ))
                    }
                     {chapter.newCharacters && chapter.newCharacters
                      .filter(charName => !novel?.characterProfiles?.some(c => c.name === charName))
                      .map(charName => (
                        <GenerateProfileButton
                          key={charName}
                          characterName={charName}
                          onGenerate={handleGenerateCharacterProfile}
                          isGenerating={generatingCharacterProfile === charName}
                        />
                      ))
                    }
                  </>
                }
              />
              {chapter.choiceMade && (
                <div className="mt-6 flex justify-end">
                    <p className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-xl rounded-br-none px-5 py-3 max-w-md shadow-lg">
                        {chapter.choiceMade}
                    </p>
                </div>
              )}
            </div>
          ))}
          {isLoading && <LoadingSpinner />}
          {error && <p className="text-red-400 text-center">{error}</p>}
          <div ref={chatEndRef} />
        </div>
        
        <div className="mt-auto pt-4">
          {gameState === GameState.CONCEPT && !isLoading && (
            <ConceptInput onSubmit={handleConceptSubmit} />
          )}

          {gameState === GameState.CHOOSING && lastChapter && !lastChapter.choiceMade && !isLoading && (
            <div className="flex flex-col items-center gap-3 animate-slide-up">
                <h3 className="text-xl font-serif text-brand-secondary mb-2">What happens next?</h3>
                {lastChapter.choices.map((choice, index) => (
                    <ChoiceButton key={index} text={choice} onClick={() => handleChoiceSubmit(choice)} />
                ))}
            </div>
          )}

          {gameState === GameState.ENDED && !isLoading && (
            <div className="text-center animate-fade-in p-8">
              <h2 className="text-4xl font-serif text-brand-secondary mb-4">The End</h2>
              <p className="text-brand-text-secondary mb-6">Your epic tale has reached its conclusion.</p>
              <button
                onClick={() => setIsNovelViewerOpen(true)}
                className="bg-brand-secondary text-brand-bg font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                View Full Novel
              </button>
            </div>
          )}
        </div>
      </main>
      <ThemeViewer
        isOpen={isThemeViewerOpen}
        onClose={() => setIsThemeViewerOpen(false)}
        themes={novel?.themes || []}
      />
      <CharacterProfileViewer
        isOpen={isCharacterViewerOpen}
        onClose={() => setIsCharacterViewerOpen(false)}
        profiles={novel?.characterProfiles || []}
      />
      <FullNovelViewer
        isOpen={isNovelViewerOpen}
        onClose={() => setIsNovelViewerOpen(false)}
        novel={novel}
      />
       <LoadNovelModal
        isOpen={isLoadNovelModalOpen}
        onClose={() => setIsLoadNovelModalOpen(false)}
        novels={allNovels}
        onLoad={handleLoadNovelFromModal}
        onDelete={handleDeleteNovelFromModal}
      />
       <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSubscribe={handleSubscribe}
        isLoading={isSubModalLoading}
      />
      {gameState === GameState.CONCEPT && (
        <TutorialOverlay isOpen={showTutorial} onClose={handleTutorialClose} />
      )}
       <AuthErrorModal
        isOpen={!!authError}
        onClose={() => setAuthError(null)}
        domain={authError?.domain || ''}
        projectId={authError?.projectId || ''}
      />
      <Disclaimer />
    </div>
  );
};

interface AuthErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  projectId: string;
}

const AuthErrorModal: React.FC<AuthErrorModalProps> = ({ isOpen, onClose, domain, projectId }) => {
  if (!isOpen) return null;

  const firebaseConsoleUrl = `https://console.firebase.google.com/project/${projectId}/authentication/providers`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-xl shadow-2xl w-full max-w-2xl flex flex-col border border-red-500/40 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-red-500/20 flex justify-between items-center">
          <h2 className="text-2xl font-serif text-red-400">Firebase Sign-In Error</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text text-3xl font-light">&times;</button>
        </div>
        
        <div className="p-8 space-y-6">
          <p className="text-brand-text-secondary">
            This application's domain (<strong className="text-brand-text">{domain}</strong>) has not been authorized for Google Sign-In in your Firebase project.
          </p>
          <div className="bg-brand-dark/50 p-4 rounded-lg">
            <h3 className="font-bold text-brand-primary mb-2">To fix this, please follow these steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-brand-text-secondary">
                <li>Open your <a href={firebaseConsoleUrl} target="_blank" rel="noopener noreferrer" className="text-brand-secondary underline hover:text-brand-primary">Firebase project console</a>.</li>
                <li>Go to the <strong className="text-brand-text">Authentication</strong> section and select the <strong className="text-brand-text">Sign-in method</strong> tab.</li>
                <li>Scroll down to the <strong className="text-brand-text">Authorized domains</strong> section.</li>
                <li>Click <strong className="text-brand-text">Add domain</strong> and enter: <code className="bg-brand-dark px-1 py-0.5 rounded text-brand-secondary">{domain}</code></li>
                <li>Save your changes and refresh this page.</li>
            </ol>
          </div>
           <p className="text-xs text-brand-text-secondary text-center">
            If you are developing locally, you might need to add 'localhost'.
           </p>
        </div>
      </div>
    </div>
  );
};


export default App;
