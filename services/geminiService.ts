
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChapterData, AdvancedOptions } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using fallback for development.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY_HERE" });

const NARRATIVE_STAGES = [
    'Introduction', 'Inciting Incident', 'Goal', 'Rising Action', 
    'Character Development', 'Turning Points', 'Climax', 'Falling Action', 
    'Resolution', 'New Equilibrium', 'Payoff'
];

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        text: {
            type: Type.STRING,
            description: "The text of the novel chapter.",
        },
        choices: {
            type: Type.ARRAY,
            description: "An array of 3 distinct string choices for the user. Should be an empty array if isEnding is true.",
            items: {
                type: Type.STRING,
            },
        },
        newThemes: {
            type: Type.ARRAY,
            description: "An array of strings identifying significant new literary themes introduced in this chapter. Example: ['Redemption', 'The price of progress']",
            items: {
                type: Type.STRING,
            },
        },
        newCharacters: {
            type: Type.ARRAY,
            description: "An array of strings identifying significant new characters introduced for the first time who seem important.",
            items: {
                type: Type.STRING,
            },
        },
        isEnding: {
            type: Type.BOOLEAN,
            description: "Set to true if this chapter is the natural conclusion of the story. If true, do not provide choices.",
        },
        narrativeStage: {
            type: Type.STRING,
            description: `The current stage of the story's narrative arc. Choose exactly one value from this list: [${NARRATIVE_STAGES.join(', ')}]`,
            enum: NARRATIVE_STAGES,
        }
    },
    required: ["text", "choices", "narrativeStage"],
};

const parseJsonResponse = (jsonString: string): ChapterData => {
    try {
        // The API might return the JSON wrapped in markdown backticks
        const cleanedString = jsonString.replace(/^```json\n|```$/g, '').trim();
        const parsed = JSON.parse(cleanedString);
        
        if (typeof parsed.text !== 'string' || typeof parsed.narrativeStage !== 'string') {
            throw new Error("Invalid JSON structure: 'text' or 'narrativeStage' field is missing or not a string.");
        }

        if (!NARRATIVE_STAGES.includes(parsed.narrativeStage)) {
            console.warn(`AI returned an unexpected narrative stage: "${parsed.narrativeStage}". Falling back to 'Rising Action'.`);
            parsed.narrativeStage = 'Rising Action';
        }
        
        if (!parsed.isEnding && (!Array.isArray(parsed.choices) || parsed.choices.length === 0)) {
           throw new Error("Invalid JSON structure: 'choices' must be a non-empty array unless it's the ending chapter.");
        }


        const chapterData: ChapterData = {
            text: parsed.text,
            choices: parsed.choices || [],
            narrativeStage: parsed.narrativeStage,
        };
        if (Array.isArray(parsed.newThemes) && parsed.newThemes.every((t: any) => typeof t === 'string')) {
            chapterData.newThemes = parsed.newThemes;
        }
        if (Array.isArray(parsed.newCharacters) && parsed.newCharacters.every((c: any) => typeof c === 'string')) {
            chapterData.newCharacters = parsed.newCharacters;
        }
        if (typeof parsed.isEnding === 'boolean') {
            chapterData.isEnding = parsed.isEnding;
        }

        return chapterData;

    } catch (error) {
        console.error("Failed to parse JSON response from Gemini:", jsonString, error);
        throw new Error("The AI returned an unexpected response. Please try again.");
    }
};

const buildPromptWithOptions = (basePrompt: string, advancedOptions?: AdvancedOptions): string => {
    let prompt = basePrompt;

    if (advancedOptions) {
        const optionsText = Object.entries(advancedOptions)
            .filter(([, value]) => value && value.trim() !== '')
            .map(([key, value]) => {
                // Convert camelCase to Title Case for the prompt
                const titleKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                return `- ${titleKey}: ${value}`;
            })
            .join('\n');

        if (optionsText) {
            prompt += `\n\nPlease adhere to these additional creative constraints:\n${optionsText}`;
        }
    }
    return prompt;
};

export const generateFirstChapter = async (concept: string, advancedOptions: AdvancedOptions): Promise<ChapterData> => {
    let basePrompt = `You are an interactive storyteller. The user wants to write a novel with the following concept: "${concept}".`;
    
    const prompt = buildPromptWithOptions(basePrompt, advancedOptions) +
     `\n\nWrite a compelling and immersive first chapter (around 250 words). 
    After the chapter, create three distinct and intriguing multiple-choice options for the user to decide what happens next. 
    The choices should lead to significantly different story paths.
    Also, identify any significant literary themes introduced in this chapter and return their names in the \`newThemes\` array.
    Also, identify any significant new characters introduced and return their names in the \`newCharacters\` array.
    Finally, determine the narrative stage for this first chapter. It should likely be 'Introduction' or 'Inciting Incident'.
    Respond with ONLY a valid JSON object following the defined schema.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });
    
    return parseJsonResponse(response.text);
};

export const generateNextChapter = async (storySoFar: string, userChoice: string, advancedOptions?: AdvancedOptions): Promise<ChapterData> => {
    let basePrompt = `You are an interactive storyteller continuing a novel. Here is the story so far:
    ---
    ${storySoFar}
    ---
    The user has just made the following choice: "${userChoice}".`;
    
    const prompt = buildPromptWithOptions(basePrompt, advancedOptions) + 
    `\n\nBased on this choice, write the next compelling chapter (around 250 words). Keep the tone and style consistent with the established narrative and constraints.
    After the new chapter, present three new, distinct, and intriguing multiple-choice options for the user.
    The choices should lead to significantly different story paths.
    IMPORTANT: If this chapter provides a natural and satisfying conclusion to the story based on the user's choice, set the 'isEnding' flag to true and provide an empty array for the 'choices' field.
    Also, identify any new significant literary themes that have become prominent in this chapter and return their names in the \`newThemes\` array.
    Also, identify any new significant characters introduced for the first time in this chapter and return their names in the \`newCharacters\` array.
    Finally, based on the new chapter's events, determine the current narrative stage of the story from the allowed list of stages.
    Respond with ONLY a valid JSON object following the defined schema.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    return parseJsonResponse(response.text);
};

export const generateThemeDescription = async (themeName: string, storySoFar: string): Promise<string> => {
    const prompt = `You are a literary analyst. The following is an excerpt from a novel:
    ---
    ${storySoFar}
    ---
    A key theme identified in the story is "${themeName}". Please write a brief, insightful analysis (around 100 words) of how this theme is being developed in the narrative so far. Focus on its significance, symbolism, and potential impact on the characters and plot.`;
  
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });
  
    return response.text;
  };


export const generateCharacterProfile = async (
    characterName: string,
    storySoFar: string,
    novelConcept: string
): Promise<{ description: string; imageUrl: string }> => {
    // 1. Generate text description
    const descriptionPrompt = `You are a character designer for a novel. The novel's concept is: "${novelConcept}".
    Here is the story so far:
    ---
    ${storySoFar}
    ---
    Based on this context, create a detailed character profile for "${characterName}".
    Describe their physical appearance, personality, background, and potential motivations in a compelling paragraph (around 150 words).`;

    const descriptionResponse = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: descriptionPrompt,
    });
    const description = descriptionResponse.text;

    // 2. Generate character portrait
    const imagePrompt = `Generate a character portrait based on this description: "${description}".
    The overall theme of the story is "${novelConcept}". The portrait should be artistic and evocative of this theme.`;
    
    const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: imagePrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    let imageUrl = '';
    
    if (imageResponse.candidates && imageResponse.candidates.length > 0 && imageResponse.candidates[0].content) {
        for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                break;
            }
        }
    }

    if (!imageUrl) {
        throw new Error("Failed to generate character image. The request may have been blocked by safety filters.");
    }
    
    return { description, imageUrl };
};

export const generateSpeech = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with a calm, clear narrative voice: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from API.");
    }
    return base64Audio;
};