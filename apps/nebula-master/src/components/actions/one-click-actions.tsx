import { useCallback, useState } from 'react';

import styles from './one-click-actions.module.css';

interface OneClickActionsProps {
  onGitPush?: () => Promise<void>;
  onVercelPublish?: () => Promise<void>;
  gitStatus?: 'idle' | 'pushing' | 'success' | 'error';
  vercelStatus?: 'idle' | 'publishing' | 'success' | 'error';
}

export function OneClickActions({
  onGitPush,
  onVercelPublish,
  gitStatus = 'idle',
  vercelStatus = 'idle',
}: OneClickActionsProps) {
  const [showConfirm, setShowConfirm] = useState<'git' | 'vercel' | null>(null);
  
  const handleGitPush = useCallback(async () => {
    if (onGitPush && showConfirm === 'git') {
      try {
        await onGitPush();
        setShowConfirm(null);
      } catch (error) {
        console.error('Git push failed:', error);
      }
    } else {
      setShowConfirm('git');
    }
  }, [onGitPush, showConfirm]);
  
  const handleVercelPublish = useCallback(async () => {
    if (onVercelPublish && showConfirm === 'vercel') {
      try {
        await onVercelPublish();
        setShowConfirm(null);
      } catch (error) {
        console.error('Vercel publish failed:', error);
      }
    } else {
      setShowConfirm('vercel');
    }
  }, [onVercelPublish, showConfirm]);
  
  const handleCancel = useCallback(() => {
    setShowConfirm(null);
  }, []);
  
  return (
    <div className={styles['actions-container']}>
      <div className={styles['actions-header']}>
        <h3 className={styles['actions-title']}>Deploy</h3>
      </div>
      
      <div className={styles['actions-grid']}>
        {/* Git Push */}
        <div className={styles['action-card']}>
          <div className={styles['action-icon']}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-6.225 0-1.38.45-2.535 1.335-3.435-.135-.33-.585-1.71.135-3.57 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.72 1.86.27 3.24.135 3.57.885.9 1.335 2.04 1.335 3.435 0 4.905-2.805 5.925-5.475 6.225.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </div>
          <h4 className={styles['action-name']}>Push to Git</h4>
          <p className={styles['action-description']}>
            Commit and push your code to GitHub
          </p>
          
          {showConfirm === 'git' ? (
            <div className={styles['confirm-actions']}>
              <button
                onClick={handleGitPush}
                className={`${styles['confirm-button']} ${styles['confirm-button--primary']}`}
                disabled={gitStatus === 'pushing'}
              >
                {gitStatus === 'pushing' ? 'Pushing...' : 'Confirm Push'}
              </button>
              <button
                onClick={handleCancel}
                className={styles['confirm-button']}
                disabled={gitStatus === 'pushing'}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleGitPush}
              className={`${styles['action-button']} ${styles['action-button--git']}`}
              disabled={gitStatus === 'pushing'}
            >
              {gitStatus === 'pushing' ? (
                <span className={styles['loading']}>Pushing...</span>
              ) : gitStatus === 'success' ? (
                <span className={styles['success']}>✓ Pushed</span>
              ) : gitStatus === 'error' ? (
                <span className={styles['error']}>✗ Failed</span>
              ) : (
                'One-Click Push'
              )}
            </button>
          )}
        </div>
        
        {/* Vercel Publish */}
        <div className={styles['action-card']}>
          <div className={styles['action-icon']}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L0 20.8h24L12 0zm0 4.8l7.2 12.8H4.8L12 4.8z"/>
            </svg>
          </div>
          <h4 className={styles['action-name']}>Publish to Vercel</h4>
          <p className={styles['action-description']}>
            Deploy your application to Vercel
          </p>
          
          {showConfirm === 'vercel' ? (
            <div className={styles['confirm-actions']}>
              <button
                onClick={handleVercelPublish}
                className={`${styles['confirm-button']} ${styles['confirm-button--primary']}`}
                disabled={vercelStatus === 'publishing'}
              >
                {vercelStatus === 'publishing' ? 'Publishing...' : 'Confirm Publish'}
              </button>
              <button
                onClick={handleCancel}
                className={styles['confirm-button']}
                disabled={vercelStatus === 'publishing'}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleVercelPublish}
              className={`${styles['action-button']} ${styles['action-button--vercel']}`}
              disabled={vercelStatus === 'publishing'}
            >
              {vercelStatus === 'publishing' ? (
                <span className={styles['loading']}>Publishing...</span>
              ) : vercelStatus === 'success' ? (
                <span className={styles['success']}>✓ Published</span>
              ) : vercelStatus === 'error' ? (
                <span className={styles['error']}>✗ Failed</span>
              ) : (
                'One-Click Publish'
              )}
            </button>
          )}
        </div>
      </div>
      
      <div className={styles['actions-note']}>
        <p>
          Both actions are truly one-click. No terminal, no configuration files to edit.
        </p>
      </div>
    </div>
  );
}
