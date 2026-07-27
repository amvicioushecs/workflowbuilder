import clsx from 'clsx';
import { useCallback, useRef, useEffect } from 'react';

import styles from './talking-nebula.module.css';

interface TalkingNebulaProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  onUserInput?: (text: string) => void;
}

export function TalkingNebula({ isListening = false, isSpeaking = false, onUserInput }: TalkingNebulaProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current?.value.trim() && onUserInput) {
      onUserInput(inputRef.current.value.trim());
      inputRef.current.value = '';
    }
  }, [onUserInput]);
  
  useEffect(() => {
    if (isListening && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isListening]);
  
  return (
    <div className={styles['nebula-container']}>
      {/* The living nebula presence */}
      <div 
        className={clsx(
          styles['nebula'],
          isListening && styles['nebula--listening'],
          isSpeaking && styles['nebula--speaking']
        )}
        aria-label="Talking Nebula AI Assistant"
        role="img"
      >
        <div className={styles['nebula-core']} />
        <div className={styles['nebula-tendril-1']} />
        <div className={styles['nebula-tendril-2']} />
        <div className={styles['nebula-tendril-3']} />
        <div className={styles['nebula-glow']} />
      </div>
      
      {/* Minimal input area - only appears when ready for input */}
      {isListening && (
        <form onSubmit={handleSubmit} className={styles['input-container']}>
          <textarea
            ref={inputRef}
            className={styles['input']}
            placeholder="Tell me about your product..."
            rows={3}
            aria-label="Your message to Nebula"
          />
          <button type="submit" className={styles['submit-button']} aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      )}
      
      {/* Status indicator */}
      <div className={styles['status']} aria-live="polite">
        {isListening && 'Listening...'}
        {isSpeaking && 'Nebula is speaking...'}
        {!isListening && !isSpeaking && ' '}
      </div>
    </div>
  );
}
