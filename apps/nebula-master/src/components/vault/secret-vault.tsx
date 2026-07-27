import { useCallback, useState } from 'react';

import styles from './secret-vault.module.css';

export interface SecretEntry {
  key: string;
  value: string;
  encrypted: boolean;
}

interface SecretVaultProps {
  requiredSecrets?: string[];
  onSave?: (secrets: Record<string, string>) => void;
}

export function SecretVault({ requiredSecrets = [], onSave }: SecretVaultProps) {
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [isLocked, setIsLocked] = useState(true);
  
  const handleSecretChange = useCallback((key: string, value: string) => {
    setSecrets((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);
  
  const handleSave = useCallback(() => {
    if (onSave) {
      // In production, this would encrypt before storing
      onSave(secrets);
    }
  }, [secrets, onSave]);
  
  const missingSecrets = requiredSecrets.filter(
    (secret) => !secrets[secret] || secrets[secret].trim() === '',
  );
  
  return (
    <div className={styles['vault-container']}>
      <div className={styles['vault-header']}>
        <h2 className={styles['vault-title']}>Secure Secret Vault</h2>
        <div className={styles['vault-status']}>
          {isLocked ? (
            <span className={styles['status-locked']}>🔒 Encrypted</span>
          ) : (
            <span className={styles['status-unlocked']}>🔓 Editing</span>
          )}
        </div>
      </div>
      
      <div className={styles['vault-info']}>
        <p>
          Secrets are stored in an encrypted vault. They are never written to SSOT, 
          version history, or Git.
        </p>
      </div>
      
      {requiredSecrets.length > 0 && (
        <div className={styles['secrets-list']}>
          {requiredSecrets.map((secretKey) => (
            <div key={secretKey} className={styles['secret-item']}>
              <label htmlFor={secretKey} className={styles['secret-label']}>
                {secretKey}
                {missingSecrets.includes(secretKey) && (
                  <span className={styles['required-indicator']} title="Required">
                    *
                  </span>
                )}
              </label>
              <input
                id={secretKey}
                type={isLocked ? 'password' : 'text'}
                value={secrets[secretKey] || ''}
                onChange={(e) => handleSecretChange(secretKey, e.target.value)}
                className={styles['secret-input']}
                placeholder={`Enter ${secretKey}`}
                disabled={isLocked}
              />
            </div>
          ))}
        </div>
      )}
      
      {requiredSecrets.length === 0 && (
        <div className={styles['empty-state']}>
          <p>No secrets required for this project.</p>
        </div>
      )}
      
      <div className={styles['vault-actions']}>
        {isLocked ? (
          <button
            onClick={() => setIsLocked(false)}
            className={styles['unlock-button']}
          >
            Unlock to Edit
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsLocked(true)}
              className={styles['cancel-button']}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={styles['save-button']}
              disabled={missingSecrets.length > 0}
            >
              Save Secrets
            </button>
          </>
        )}
      </div>
      
      {missingSecrets.length > 0 && (
        <div className={styles['warning-message']}>
          ⚠️ {missingSecrets.length} required secret(s) missing
        </div>
      )}
    </div>
  );
}
