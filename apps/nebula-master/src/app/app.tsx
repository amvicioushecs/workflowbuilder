import { useCallback, useState } from 'react';

import { TalkingNebula } from '../components/nebula/talking-nebula';
import type { ConversationMessage, DiscoveryData } from '../stores/use-nebula-store';
import { useNebulaStore } from '../stores/use-nebula-store';

export function App() {
  const {
    messages,
    isListening,
    isSpeaking,
    discoveryComplete,
    addMessage,
    setListening,
    setSpeaking,
    setDiscoveryComplete,
    createSSOT,
  } = useNebulaStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Discovery questions in order
  const discoveryQuestions = [
    {
      key: 'targetUsers',
      question: "Who is this product for? Please describe your real user segments (not 'everyone').",
    },
    {
      key: 'corePurpose',
      question: 'What is the core purpose of your product? What real problem are you solving?',
    },
    {
      key: 'marketResearch',
      question: 'Have you done any market research? What does the competitive landscape look like?',
    },
    {
      key: 'brandPreferences',
      question: 'Do you have any brand preferences? Colors, tone, personality?',
    },
    {
      key: 'uiPreferences',
      question: 'Any UI preferences? Style, layout, visual elements you like or dislike?',
    },
    {
      key: 'uxPreferences',
      question: 'Any UX preferences? How should users interact with your product?',
    },
    {
      key: 'requiredSecrets',
      question: 'Will your product need any environment variables or secrets? (API keys, database URLs, etc.)',
    },
  ];
  
  const handleUserInput = useCallback((text: string) => {
    // Add user message to history
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    addMessage(userMessage);
    
    // Process the answer and move to next question or complete discovery
    const currentQuestion = discoveryQuestions[currentQuestionIndex];
    
    if (currentQuestion) {
      // Store the answer (in a real app, this would update the store's discoveryData)
      console.log(`Answer to ${currentQuestion.key}:`, text);
      
      if (currentQuestionIndex < discoveryQuestions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex((prev) => prev + 1);
        
        // Nebula "speaks" the next question
        setSpeaking(true);
        setTimeout(() => {
          setSpeaking(false);
          setListening(true);
        }, 2000);
      } else {
        // Discovery complete
        setSpeaking(true);
        setTimeout(() => {
          setSpeaking(false);
          setListening(false);
          
          // Create SSOT
          const ssotData: DiscoveryData = {
            targetUsers: ['Example users'],
            corePurpose: 'Example purpose',
            problemSolved: 'Example problem',
            requiredSecrets: [],
          };
          setDiscoveryComplete(ssotData);
          createSSOT();
        }, 2000);
      }
    }
  }, [currentQuestionIndex, addMessage, setSpeaking, setListening, setDiscoveryComplete, createSSOT]);
  
  // Start the conversation on mount
  const startConversation = useCallback(() => {
    setListening(true);
  }, [setListening]);
  
  return (
    <div style={{ minHeight: '100vh' }}>
      {!isListening && !discoveryComplete && messages.length === 0 && (
        <div 
          onClick={startConversation}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            cursor: 'pointer',
          }}
        >
          <TalkingNebula />
        </div>
      )}
      
      {(isListening || isSpeaking || discoveryComplete) && (
        <TalkingNebula
          isListening={isListening}
          isSpeaking={isSpeaking}
          onUserInput={handleUserInput}
        />
      )}
    </div>
  );
}
