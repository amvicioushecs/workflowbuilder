import { create } from 'zustand';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'nebula';
  content: string;
  timestamp: number;
}

export interface DiscoveryData {
  targetUsers: string[];
  corePurpose: string;
  problemSolved: string;
  marketResearch?: string;
  competitorAnalysis?: string;
  brandPreferences?: string;
  uiPreferences?: string;
  uxPreferences?: string;
  requiredSecrets: string[];
}

export interface SSOT {
  id: string;
  version: number;
  createdAt: number;
  discoveryData: DiscoveryData;
  conversationHistory: ConversationMessage[];
  architectureDiagram?: {
    nodes: unknown[];
    edges: unknown[];
  };
}

interface NebulaState {
  // Conversation state
  messages: ConversationMessage[];
  isListening: boolean;
  isSpeaking: boolean;
  
  // Discovery state
  discoveryComplete: boolean;
  discoveryData: DiscoveryData | null;
  
  // SSOT state
  ssot: SSOT | null;
  ssotHistory: SSOT[];
  
  // Build state
  isBuilding: boolean;
  buildComplete: boolean;
  previewUrl: string | null;
  
  // Actions
  addMessage: (message: ConversationMessage) => void;
  setListening: (listening: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setDiscoveryComplete: (data: DiscoveryData) => void;
  createSSOT: () => SSOT;
  updateSSOT: (updates: Partial<SSOT>) => void;
  setBuildComplete: (previewUrl: string) => void;
  reset: () => void;
}

const initialState = {
  messages: [],
  isListening: false,
  isSpeaking: false,
  discoveryComplete: false,
  discoveryData: null,
  ssot: null,
  ssotHistory: [],
  isBuilding: false,
  buildComplete: false,
  previewUrl: null,
};

export const useNebulaStore = create<NebulaState>((set, get) => ({
  ...initialState,
  
  addMessage: (message: ConversationMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
  
  setListening: (isListening: boolean) => {
    set({ isListening });
  },
  
  setSpeaking: (isSpeaking: boolean) => {
    set({ isSpeaking });
  },
  
  setDiscoveryComplete: (discoveryData: DiscoveryData) => {
    set({ discoveryComplete: true, discoveryData });
  },
  
  createSSOT: () => {
    const state = get();
    if (!state.discoveryData) {
      throw new Error('Cannot create SSOT without complete discovery data');
    }
    
    const newVersion = state.ssotHistory.length + 1;
    const ssot: SSOT = {
      id: `ssot-${Date.now()}`,
      version: newVersion,
      createdAt: Date.now(),
      discoveryData: state.discoveryData,
      conversationHistory: state.messages,
    };
    
    set((prev) => ({
      ssot,
      ssotHistory: [...prev.ssotHistory, ssot],
    }));
    
    return ssot;
  },
  
  updateSSOT: (updates: Partial<SSOT>) => {
    set((state) => {
      if (!state.ssot) return state;
      
      const updated: SSOT = {
        ...state.ssot,
        ...updates,
      };
      
      return {
        ssot: updated,
        ssotHistory: [
          ...state.ssotHistory.filter((s) => s.id !== state.ssot!.id),
          updated,
        ],
      };
    });
  },
  
  setBuildComplete: (previewUrl: string) => {
    set({ buildComplete: true, previewUrl, isBuilding: false });
  },
  
  reset: () => {
    set(initialState);
  },
}));
