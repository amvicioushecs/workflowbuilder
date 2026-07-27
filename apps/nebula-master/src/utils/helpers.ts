/**
 * Utility functions for Nebula Master
 */

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Generate a unique ID with optional prefix
 */
export function generateId(prefix?: string): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Validate that all required fields are present in discovery data
 */
export interface DiscoveryValidationResult {
  isValid: boolean;
  missingFields: string[];
  suggestions: Record<string, string>;
}

export function validateDiscoveryData(data: {
  targetUsers?: string[];
  corePurpose?: string;
  problemSolved?: string;
}): DiscoveryValidationResult {
  const missingFields: string[] = [];
  const suggestions: Record<string, string> = {};

  if (!data.targetUsers || data.targetUsers.length === 0) {
    missingFields.push('targetUsers');
    suggestions.targetUsers = 'Please describe specific user segments (e.g., "freelance designers", "small business owners")';
  }

  if (!data.corePurpose || data.corePurpose.trim() === '') {
    missingFields.push('corePurpose');
    suggestions.corePurpose = 'What is the main goal of your product?';
  }

  if (!data.problemSolved || data.problemSolved.trim() === '') {
    missingFields.push('problemSolved');
    suggestions.problemSolved = 'What specific problem does your product solve?';
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    suggestions,
  };
}

/**
 * Check if a response is vague or incomplete
 */
export function isResponseVague(response: string): boolean {
  const vagueIndicators = [
    'everyone',
    'anyone',
    'people',
    'users',
    'something',
    'thing',
    'stuff',
    'etc',
    'and so on',
    'whatever',
  ];

  const lowerResponse = response.toLowerCase();
  
  // Too short
  if (response.trim().length < 10) {
    return true;
  }

  // Contains vague indicators without specifics
  const hasVagueIndicator = vagueIndicators.some(indicator => 
    lowerResponse.includes(indicator)
  );

  // Check if response is just repeating the question
  const words = response.split(/\s+/);
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^\w]/g, '')));
  if (uniqueWords.size < 5) {
    return true;
  }

  return hasVagueIndicator && words.length < 15;
}

/**
 * Generate clarifying questions based on vague responses
 */
export function generateClarifyingQuestion(field: string): string {
  const clarifications: Record<string, string> = {
    targetUsers: 'Can you be more specific about who will use this? Think about demographics, job roles, or specific situations.',
    corePurpose: 'What exactly will users accomplish with your product? Please describe concrete outcomes.',
    problemSolved: 'What specific pain point are you addressing? How do users currently solve this problem?',
    brandPreferences: 'Are there any brands, websites, or products whose style you admire? What specifically appeals to you?',
    uiPreferences: 'Do you prefer minimal interfaces or feature-rich dashboards? Light or dark themes? Any specific layout preferences?',
    uxPreferences: 'Should interactions be quick and efficient, or exploratory and educational? Mobile-first or desktop-focused?',
    requiredSecrets: 'Will your app need API keys, database connections, or authentication credentials? List them specifically.',
  };

  return clarifications[field] || 'Can you provide more specific details?';
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Debounce function for search/input optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge two objects deeply
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const output = { ...target };

  for (const key in source) {
    if (source[key] !== undefined) {
      const targetValue = output[key];
      const sourceValue = source[key];

      if (
        typeof targetValue === 'object' &&
        typeof sourceValue === 'object' &&
        targetValue !== null &&
        sourceValue !== null &&
        !Array.isArray(targetValue) &&
        !Array.isArray(sourceValue)
      ) {
        output[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else {
        output[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return output;
}

/**
 * Group conversation messages by date
 */
export interface MessageGroup {
  date: string;
  messages: Array<{
    id: string;
    role: 'user' | 'nebula';
    content: string;
    timestamp: number;
  }>;
}

export function groupMessagesByDate(
  messages: Array<{
    id: string;
    role: 'user' | 'nebula';
    content: string;
    timestamp: number;
  }>
): MessageGroup[] {
  const groups: Map<string, MessageGroup> = new Map();

  for (const message of messages) {
    const date = new Date(message.timestamp).toLocaleDateString();
    
    if (!groups.has(date)) {
      groups.set(date, { date, messages: [] });
    }
    
    groups.get(date)!.messages.push(message);
  }

  return Array.from(groups.values());
}

/**
 * Calculate reading time for text content
 */
export function calculateReadingTime(text: string, wordsPerMinute = 200): number {
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Check if we're in a browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Get storage safely (handles SSR)
 */
export function getStorage(): Storage | null {
  if (!isBrowser) {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
