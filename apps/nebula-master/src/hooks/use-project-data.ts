/**
 * Hook for managing project data with Neon database
 * Integrates SSOT, conversation logs, and secret vault references
 */

import { useCallback, useEffect, useState } from 'react';
import type { ConversationMessage, DiscoveryData, SSOT } from '../stores/use-nebula-store';
import { nebulaDB, type Project, type SSOTVersion } from '../services/nebula-db';
import { secretVault, type VaultValidationResult } from '../services/secret-vault';

interface UseProjectDataOptions {
  projectId?: string;
  autoLoad?: boolean;
}

interface UseProjectDataReturn {
  // State
  project: Project | null;
  currentSSOT: SSOTVersion | null;
  ssotHistory: SSOTVersion[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  createProject: (name: string) => Promise<Project>;
  loadProject: (projectId: string) => Promise<void>;
  saveSSOT: (
    discoveryData: DiscoveryData,
    conversationHistory: ConversationMessage[],
    architectureDiagram?: { nodes: unknown[]; edges: unknown[] }
  ) => Promise<SSOTVersion>;
  rollbackToVersion: (ssotId: string) => Promise<void>;
  validateSecrets: (requiredSecrets: string[]) => Promise<VaultValidationResult>;
  setSecret: (key: string, value: string) => Promise<boolean>;
}

export function useProjectData(options: UseProjectDataOptions = {}): UseProjectDataReturn {
  const { autoLoad = true } = options;
  const [projectId, setProjectId] = useState<string | undefined>(options.projectId);
  const [project, setProject] = useState<Project | null>(null);
  const [currentSSOT, setCurrentSSOT] = useState<SSOTVersion | null>(null);
  const [ssotHistory, setSsotHistory] = useState<SSOTVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize database connection on mount
  useEffect(() => {
    const initDB = async () => {
      try {
        // In production, this would come from environment variables
        const connectionString = import.meta.env.VITE_NEON_DATABASE_URL;
        
        if (connectionString) {
          await nebulaDB.connect({ connectionString });
        } else {
          console.warn('[useProjectData] No database URL provided, using mock mode');
        }

        // Initialize secret vault
        await secretVault.initialize();
      } catch (err) {
        console.error('[useProjectData] Failed to initialize database:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize database'));
      }
    };

    initDB();
  }, []);

  // Auto-load project if projectId is provided
  useEffect(() => {
    if (autoLoad && projectId) {
      loadProject(projectId);
    }
  }, [projectId, autoLoad]);

  /**
   * Create a new project
   */
  const createProject = useCallback(async (name: string): Promise<Project> => {
    setIsLoading(true);
    setError(null);

    try {
      // In production, get user ID from auth context
      const userId = 'current-user-id';
      
      const newProject = await nebulaDB.createProject(userId, name);
      setProject(newProject);
      setProjectId(newProject.id);

      // Create vault for the project
      await secretVault.createVault(newProject.id);

      return newProject;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create project');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load an existing project
   */
  const loadProject = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedProject = await nebulaDB.getProjectById(id);
      
      if (!loadedProject) {
        throw new Error('Project not found');
      }

      setProject(loadedProject);
      setProjectId(id);

      // Load SSOT history
      const history = await nebulaDB.getSSOTVersionsByProjectId(id);
      setSsotHistory(history);

      // Load current SSOT
      if (loadedProject.current_ssot_version_id) {
        const current = await nebulaDB.getSSOTVersionById(loadedProject.current_ssot_version_id);
        setCurrentSSOT(current);
      } else if (history.length > 0) {
        // Use latest version if no current is set
        setCurrentSSOT(history[0]);
      }

      // Initialize vault
      await secretVault.createVault(id).catch(() => {
        // Vault might already exist, ignore error
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load project');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save a new SSOT version
   */
  const saveSSOT = useCallback(async (
    discoveryData: DiscoveryData,
    conversationHistory: ConversationMessage[],
    architectureDiagram?: { nodes: unknown[]; edges: unknown[] }
  ): Promise<SSOTVersion> => {
    if (!projectId) {
      throw new Error('No project loaded');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Calculate next version number
      const nextVersion = ssotHistory.length + 1;

      // Create SSOT version in database
      const ssotVersion = await nebulaDB.createSSOTVersion(
        projectId,
        nextVersion,
        discoveryData,
        conversationHistory,
        architectureDiagram
      );

      // Update SSOT history
      setSsotHistory(prev => [ssotVersion, ...prev]);
      setCurrentSSOT(ssotVersion);

      // Update project's current SSOT reference
      await nebulaDB.updateProjectCurrentSSOT(projectId, ssotVersion.id);

      // Log conversation history to dedicated table
      for (const message of conversationHistory) {
        await nebulaDB.logConversation(projectId, message);
      }

      // Store secret vault references for required secrets
      for (const secretKey of discoveryData.requiredSecrets || []) {
        const vaultRef = `vault-${projectId}-${secretKey}`;
        await nebulaDB.createSecretVaultReference(projectId, secretKey, vaultRef);
      }

      return ssotVersion;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save SSOT');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, ssotHistory]);

  /**
   * Rollback to a previous SSOT version
   */
  const rollbackToVersion = useCallback(async (ssotId: string): Promise<void> => {
    if (!projectId) {
      throw new Error('No project loaded');
    }

    setIsLoading(true);
    setError(null);

    try {
      const ssotVersion = await nebulaDB.getSSOTVersionById(ssotId);
      
      if (!ssotVersion) {
        throw new Error('SSOT version not found');
      }

      // Update project's current SSOT reference
      await nebulaDB.updateProjectCurrentSSOT(projectId, ssotId);
      setCurrentSSOT(ssotVersion);

      console.log('[useProjectData] Rolled back to SSOT version:', ssotVersion.version);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to rollback');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  /**
   * Validate secrets before deployment
   */
  const validateSecrets = useCallback(async (
    requiredSecrets: string[]
  ): Promise<VaultValidationResult> => {
    if (!projectId) {
      return {
        isValid: requiredSecrets.length === 0,
        missingSecrets: [...requiredSecrets],
        invalidSecrets: [],
      };
    }

    return await secretVault.validateSecrets(projectId, requiredSecrets);
  }, [projectId]);

  /**
   * Set a secret in the vault
   */
  const setSecret = useCallback(async (
    key: string,
    value: string
  ): Promise<boolean> => {
    if (!projectId) {
      return false;
    }

    // Unlock vault temporarily
    secretVault.unlockVault(projectId);
    
    const result = await secretVault.setSecret(projectId, key, value);
    
    // Lock vault again
    secretVault.lockVault(projectId);

    return result !== null;
  }, [projectId]);

  return {
    // State
    project,
    currentSSOT,
    ssotHistory,
    isLoading,
    error,

    // Actions
    createProject,
    loadProject,
    saveSSOT,
    rollbackToVersion,
    validateSecrets,
    setSecret,
  };
}
