export type SupportedLanguage = "en" | "hi" | "te";

export interface UserPreferences {
  helpTopics: string[]; // Q1 (multiple)
  explanationDepth: string; // Q2
  communicationMedium: string; // Q3
  preferredLanguage: string; // Q4
  conversationalStyle: string; // Q5
  answerPriority: string; // Q6
  difficultApproach: string; // Q7
  additionalNotes?: string; // Q8 (optional)
  completedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  preferences?: UserPreferences;
  onboardingCompleted: boolean;
}

export interface Citation {
  title: string;
  url: string;
  snippet?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  citations?: Citation[];
  isResearch?: boolean;
  language?: SupportedLanguage;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isResearch: boolean;
  language: SupportedLanguage;
  messages: Message[];
}

export type TavusConversationState =
  | "connecting"
  | "ready"
  | "in_call"
  | "listening"
  | "speaking"
  | "user_speaking"
  | "luna_speaking"
  | "processing"
  | "reconnecting"
  | "ended"
  | "error";
