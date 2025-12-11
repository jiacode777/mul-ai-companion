import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { MUL_SYSTEM_INSTRUCTION } from "../constants";
import { AppMode, InterventionResponse, MulState } from "../types";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
      return null;
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export const initializeChat = (): void => {
  const ai = getGenAI();
  if (!ai) return;

  // We use gemini-2.5-flash for speed and low latency, fitting Mul's responsive nature.
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: MUL_SYSTEM_INSTRUCTION,
      temperature: 0.7, // Slightly creative but stable
      candidateCount: 1,
    },
  });
};

export const sendMessageStream = async (
  message: string,
  onChunk: (text: string) => void
): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
     const errorMsg = "I'm having a little trouble connecting to the stream...";
     onChunk(errorMsg);
     return errorMsg;
  }

  try {
    const resultStream = await chatSession.sendMessageStream({ message });
    let fullText = "";

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      const text = c.text;
      if (text) {
        fullText += text;
        onChunk(fullText);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Error sending message to Mul:", error);
    const errorMessage = "Oh no... the water is a bit murky right now. Can we try again?";
    onChunk(errorMessage);
    return errorMessage;
  }
};

/**
 * Robust helper to extract and parse JSON from mixed text
 */
const cleanAndParseJSON = <T>(text: string): T | null => {
  try {
    let cleanText = text;
    
    // 1. Try to extract from markdown code blocks first
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        cleanText = codeBlockMatch[1];
    } else {
        // 2. If no code block, try to find the first '{' or '[' and last '}' or ']'
        const firstBrace = text.indexOf('{');
        const firstBracket = text.indexOf('[');
        
        // Find the earliest occurrence of either
        let start = -1;
        if (firstBrace > -1 && firstBracket > -1) {
            start = Math.min(firstBrace, firstBracket);
        } else if (firstBrace > -1) {
            start = firstBrace;
        } else if (firstBracket > -1) {
            start = firstBracket;
        }

        if (start > -1) {
            const lastBrace = text.lastIndexOf('}');
            const lastBracket = text.lastIndexOf(']');
            const end = Math.max(lastBrace, lastBracket);
            
            if (end > start) {
                cleanText = text.substring(start, end + 1);
            }
        }
    }
    
    return JSON.parse(cleanText) as T;
  } catch (e) {
    console.error("JSON Parse Error:", e);
    // console.log("Failed text:", text);
    return null;
  }
};

/**
 * Rapidly analyzes user input to determine visual/audio reaction and intervention.
 * This runs parallel to the chat stream for the "Instant Reaction" effect.
 */
export const analyzeMoodAndIntervention = async (userText: string): Promise<InterventionResponse | null> => {
  const ai = getGenAI();
  if (!ai) return null;

  try {
    const prompt = `
      Analyze this user message: "${userText}"
      
      Determine three things:
      1. The most appropriate Avatar Mood (happy, sad, calm, curious, thinking, listening, celebrating).
      2. A very short (max 5 words) reasoning for the AI's internal thought process (e.g., "Detected sadness", "High energy found", "Anxiety detected").
      3. The best App Mode to help them (CHAT, BREATHING, TODO, JOURNAL, GROUNDING).
         - Use BREATHING for anxiety, stress, panic, overwhelming feelings.
         - Use GROUNDING for dissociation, "too much", "floating away".
         - Use TODO for "overwhelmed by tasks", "busy", "need plan", "stressed by work".
         - Use JOURNAL for "thoughts stuck", "venting", "reflecting".
         - Default to CHAT for general conversation.

      Return ONLY raw JSON.
      Example: { "mood": "sad", "reasoning": "Detected low mood", "recommendedMode": "GROUNDING" }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return null;
    return cleanAndParseJSON<InterventionResponse>(text);
  } catch (e) {
    console.error("Error analyzing intervention", e);
    return null;
  }
};

/**
 * Generates a list of gentle to-do items based on the user's mood/input.
 */
export const generateGentleTodos = async (userText: string): Promise<string[]> => {
  const ai = getGenAI();
  if (!ai) return [];

  try {
    const prompt = `
      The user said: "${userText}".
      Analyze the underlying mood (e.g., drained, happy, anxious, energetic).
      Generate 3 to 5 small, gentle, actionable, and very short to-do items tailored to this mood.
      
      - If drained/tired: restful tasks (e.g., "Drink a glass of water", "Stretch for 1 min", "Close your eyes").
      - If happy/energetic: creative or sharing tasks (e.g., "Write down one joy", "Text a friend", "Go for a walk").
      - If anxious: grounding tasks (e.g., "Count 5 blue things", "Deep breath").
      
      Return ONLY a raw JSON array of strings. Do not add markdown formatting.
      Example: ["Drink water", "Look at the sky"]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return [];

    const tasks = cleanAndParseJSON<string[]>(text);
    return Array.isArray(tasks) ? tasks : [];
  } catch (e) {
    console.error("Error generating todos", e);
    return [];
  }
};