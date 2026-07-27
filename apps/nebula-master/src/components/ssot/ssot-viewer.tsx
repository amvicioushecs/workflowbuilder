import { useCallback } from 'react';

import styles from './ssot-viewer.module.css';
import type { SSOT } from '../../stores/use-nebula-store';

interface SSOTViewerProps {
  ssot: SSOT;
  onRollback?: (versionId: string) => void;
  history?: SSOT[];
}

export function SSOTViewer({ ssot, onRollback, history = [] }: SSOTViewerProps) {
  const handleRollback = useCallback(() => {
    if (onRollback) {
      onRollback(ssot.id);
    }
  }, [ssot.id, onRollback]);
  
  return (
    <div className={styles['ssot-container']}>
      <div className={styles['ssot-header']}>
        <h2 className={styles['ssot-title']}>Single Source of Truth</h2>
        <div className={styles['ssot-meta']}>
          <span className={styles['version-badge']}>v{ssot.version}</span>
          <span className={styles['timestamp']}>
            {new Date(ssot.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className={styles['ssot-content']}>
        <section className={styles['ssot-section']}>
          <h3 className={styles['section-title']}>Discovery Data</h3>
          <dl className={styles['discovery-list']}>
            <dt>Target Users</dt>
            <dd>{ssot.discoveryData.targetUsers.join(', ')}</dd>
            
            <dt>Core Purpose</dt>
            <dd>{ssot.discoveryData.corePurpose}</dd>
            
            <dt>Problem Solved</dt>
            <dd>{ssot.discoveryData.problemSolved}</dd>
            
            {ssot.discoveryData.marketResearch && (
              <>
                <dt>Market Research</dt>
                <dd>{ssot.discoveryData.marketResearch}</dd>
              </>
            )}
            
            {ssot.discoveryData.brandPreferences && (
              <>
                <dt>Brand Preferences</dt>
                <dd>{ssot.discoveryData.brandPreferences}</dd>
              </>
            )}
            
            {ssot.discoveryData.uiPreferences && (
              <>
                <dt>UI Preferences</dt>
                <dd>{ssot.discoveryData.uiPreferences}</dd>
              </>
            )}
            
            {ssot.discoveryData.uxPreferences && (
              <>
                <dt>UX Preferences</dt>
                <dd>{ssot.discoveryData.uxPreferences}</dd>
              </>
            )}
            
            {ssot.discoveryData.requiredSecrets.length > 0 && (
              <>
                <dt>Required Secrets</dt>
                <dd>{ssot.discoveryData.requiredSecrets.join(', ')}</dd>
              </>
            )}
          </dl>
        </section>
        
        <section className={styles['ssot-section']}>
          <h3 className={styles['section-title']}>Conversation History</h3>
          <div className={styles['conversation-history']}>
            {ssot.conversationHistory.map((message) => (
              <div
                key={message.id}
                className={`${styles['message']} ${styles[`message--${message.role}`]}`}
              >
                <div className={styles['message-role']}>
                  {message.role === 'nebula' ? '🌌 Nebula' : '👤 You'}
                </div>
                <div className={styles['message-content']}>{message.content}</div>
                <div className={styles['message-time']}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {history.length > 1 && (
        <div className={styles['ssot-actions']}>
          <button
            onClick={handleRollback}
            className={styles['rollback-button']}
            disabled={ssot.version === 1}
          >
            Rollback to this version
          </button>
        </div>
      )}
      
      {history.length > 0 && (
        <div className={styles['version-history']}>
          <h4 className={styles['history-title']}>Version History</h4>
          <ul className={styles['version-list']}>
            {history.map((historicalSsot) => (
              <li
                key={historicalSsot.id}
                className={`${styles['version-item']} ${
                  historicalSsot.id === ssot.id ? styles['version-item--current'] : ''
                }`}
              >
                <span className={styles['version-number']}>v{historicalSsot.version}</span>
                <span className={styles['version-date']}>
                  {new Date(historicalSsot.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
