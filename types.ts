export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isTyping?: boolean;
}

export enum AppMode {
  CHAT = 'CHAT',
  BREATHING = 'BREATHING',
  TODO = 'TODO',
  JOURNAL = 'JOURNAL',
  GROUNDING = 'GROUNDING',
}

export interface MulState {
  mood: 'happy' | 'thinking' | 'sleeping' | 'listening' | 'sad' | 'calm' | 'curious' | 'celebrating';
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  moodContext?: string; // e.g., "drained", "happy"
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  dateString: string;
  prompt: string;
  text: string;
}

export interface InterventionResponse {
  mood: MulState['mood'];
  reasoning: string; // e.g. "Detected high anxiety"
  recommendedMode: AppMode;
}