/**
 * Secure Secret Vault Service
 * 
 * Project-scoped encrypted vault for environment variables and secrets.
 * Secrets are NEVER written to SSOT, history, or Git.
 * 
 * This service handles:
 * - Encryption/decryption of secrets
 * - Integration with external vault providers (e.g., Vercel Environment Variables, AWS Secrets Manager)
 * - Validation of required secrets before deployment
 */

export interface SecretEntry {
  key: string;
  value: string;
  encrypted: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface VaultState {
  projectId: string;
  secrets: Map<string, SecretEntry>;
  isLocked: boolean;
}

export interface VaultValidationResult {
  isValid: boolean;
  missingSecrets: string[];
  invalidSecrets: string[];
}

class SecretVault {
  private vaults: Map<string, VaultState> = new Map();
  private encryptionKey: string | null = null;

  /**
   * Initialize the vault service
   * In production, this would integrate with a proper key management service
   */
  async initialize(encryptionKey?: string): Promise<void> {
    if (encryptionKey) {
      this.encryptionKey = encryptionKey;
      console.log('[SecretVault] Initialized with encryption key');
    } else {
      // Generate a temporary key for development
      this.encryptionKey = `dev-key-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      console.warn('[SecretVault] Using development encryption key');
    }
  }

  /**
   * Create a new project vault
   */
  async createVault(projectId: string): Promise<VaultState> {
    if (this.vaults.has(projectId)) {
      throw new Error(`Vault already exists for project: ${projectId}`);
    }

    const vault: VaultState = {
      projectId,
      secrets: new Map(),
      isLocked: true,
    };

    this.vaults.set(projectId, vault);
    console.log('[SecretVault] Created vault for project:', projectId);
    return vault;
  }

  /**
   * Get vault for a project
   */
  getVault(projectId: string): VaultState | null {
    return this.vaults.get(projectId) || null;
  }

  /**
   * Unlock vault for editing
   */
  unlockVault(projectId: string): boolean {
    const vault = this.vaults.get(projectId);
    if (!vault) {
      return false;
    }

    vault.isLocked = false;
    console.log('[SecretVault] Unlocked vault for project:', projectId);
    return true;
  }

  /**
   * Lock vault after editing
   */
  lockVault(projectId: string): boolean {
    const vault = this.vaults.get(projectId);
    if (!vault) {
      return false;
    }

    vault.isLocked = true;
    console.log('[SecretVault] Locked vault for project:', projectId);
    return true;
  }

  /**
   * Add or update a secret
   * Automatically encrypts the value before storing
   */
  async setSecret(
    projectId: string,
    key: string,
    value: string
  ): Promise<SecretEntry | null> {
    const vault = this.vaults.get(projectId);
    if (!vault || vault.isLocked) {
      console.error('[SecretVault] Cannot set secret: vault is locked or does not exist');
      return null;
    }

    // Encrypt the value
    const encryptedValue = await this.encrypt(value);

    const entry: SecretEntry = {
      key,
      value: encryptedValue,
      encrypted: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    vault.secrets.set(key, entry);
    console.log('[SecretVault] Set secret:', key, 'for project:', projectId);
    return entry;
  }

  /**
   * Get a decrypted secret value
   */
  async getSecret(projectId: string, key: string): Promise<string | null> {
    const vault = this.vaults.get(projectId);
    if (!vault) {
      return null;
    }

    const entry = vault.secrets.get(key);
    if (!entry) {
      return null;
    }

    // Decrypt the value
    const decryptedValue = await this.decrypt(entry.value);
    return decryptedValue;
  }

  /**
   * Get all secret keys for a project (without values)
   */
  getSecretKeys(projectId: string): string[] {
    const vault = this.vaults.get(projectId);
    if (!vault) {
      return [];
    }

    return Array.from(vault.secrets.keys());
  }

  /**
   * Delete a secret
   */
  deleteSecret(projectId: string, key: string): boolean {
    const vault = this.vaults.get(projectId);
    if (!vault || vault.isLocked) {
      return false;
    }

    const deleted = vault.secrets.delete(key);
    if (deleted) {
      console.log('[SecretVault] Deleted secret:', key, 'for project:', projectId);
    }
    return deleted;
  }

  /**
   * Validate that all required secrets are present
   * Used before deployment to ensure no missing secrets
   */
  async validateSecrets(
    projectId: string,
    requiredSecrets: string[]
  ): Promise<VaultValidationResult> {
    const vault = this.vaults.get(projectId);
    const missingSecrets: string[] = [];
    const invalidSecrets: string[] = [];

    if (!vault) {
      return {
        isValid: requiredSecrets.length === 0,
        missingSecrets: [...requiredSecrets],
        invalidSecrets: [],
      };
    }

    for (const requiredKey of requiredSecrets) {
      const entry = vault.secrets.get(requiredKey);

      if (!entry) {
        missingSecrets.push(requiredKey);
        continue;
      }

      // Try to decrypt to validate
      try {
        const decrypted = await this.decrypt(entry.value);
        if (!decrypted || decrypted.trim() === '') {
          invalidSecrets.push(requiredKey);
        }
      } catch (error) {
        console.error('[SecretVault] Failed to decrypt secret:', requiredKey, error);
        invalidSecrets.push(requiredKey);
      }
    }

    const isValid = missingSecrets.length === 0 && invalidSecrets.length === 0;

    return {
      isValid,
      missingSecrets,
      invalidSecrets,
    };
  }

  /**
   * Export secrets for deployment
   * Returns encrypted values only - never expose raw secrets
   */
  async exportForDeployment(projectId: string): Promise<Record<string, string> | null> {
    const vault = this.vaults.get(projectId);
    if (!vault) {
      return null;
    }

    const exported: Record<string, string> = {};

    for (const [key, entry] of vault.secrets.entries()) {
      // Export the encrypted value
      // The deployment system will handle decryption in the target environment
      exported[key] = entry.value;
    }

    console.log('[SecretVault] Exported', Object.keys(exported).length, 'secrets for deployment');
    return exported;
  }

  /**
   * Import secrets from external vault provider
   * e.g., Vercel Environment Variables, AWS Secrets Manager
   */
  async importFromProvider(
    projectId: string,
    provider: 'vercel' | 'aws' | 'manual',
    secrets: Record<string, string>
  ): Promise<number> {
    const vault = this.vaults.get(projectId);
    if (!vault || vault.isLocked) {
      return 0;
    }

    let importedCount = 0;

    for (const [key, value] of Object.entries(secrets)) {
      const entry: SecretEntry = {
        key,
        value: await this.encrypt(value),
        encrypted: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      vault.secrets.set(key, entry);
      importedCount++;
    }

    console.log('[SecretVault] Imported', importedCount, 'secrets from', provider);
    return importedCount;
  }

  /**
   * Simple encryption (XOR-based for demo)
   * In production, use proper AES-256-GCM encryption
   */
  private async encrypt(value: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    // Simple XOR encryption for demonstration
    // In production, use Web Crypto API or a library like crypto-js
    const keyBytes = this.encryptionKey.split('').map(c => c.charCodeAt(0));
    const valueBytes = value.split('').map(c => c.charCodeAt(0));

    const encrypted = valueBytes.map((byte, i) => {
      return byte ^ keyBytes[i % keyBytes.length];
    });

    return btoa(encrypted.join(','));
  }

  /**
   * Simple decryption (XOR-based for demo)
   * In production, use proper AES-256-GCM decryption
   */
  private async decrypt(encryptedValue: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    try {
      const decoded = atob(encryptedValue).split(',').map(n => parseInt(n, 10));
      const keyBytes = this.encryptionKey.split('').map(c => c.charCodeAt(0));

      const decrypted = decoded.map((byte, i) => {
        return String.fromCharCode(byte ^ keyBytes[i % keyBytes.length]);
      });

      return decrypted.join('');
    } catch (error) {
      console.error('[SecretVault] Decryption failed:', error);
      throw new Error('Failed to decrypt secret');
    }
  }

  /**
   * Clear all vaults (for testing)
   */
  clearAll(): void {
    this.vaults.clear();
    console.log('[SecretVault] Cleared all vaults');
  }
}

// Singleton instance
export const secretVault = new SecretVault();
