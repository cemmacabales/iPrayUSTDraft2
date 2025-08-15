/**
 * Utility functions for generating clean, readable document IDs and names
 * for Firebase collections to improve CMS management
 */

/**
 * Converts a string to a clean, URL-friendly slug
 * @param text - The text to convert to a slug
 * @returns A clean slug suitable for document IDs
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generates a clean document ID for prayers
 * @param title - Prayer title
 * @param category - Prayer category (optional)
 * @returns Clean document ID
 */
export function generatePrayerDocumentId(title: string, category?: string): string {
  const titleSlug = createSlug(title);
  const categorySlug = category ? createSlug(category) : '';
  
  if (categorySlug && titleSlug !== categorySlug) {
    return `${categorySlug}-${titleSlug}`;
  }
  
  return titleSlug;
}

/**
 * Generates a clean document ID for prayer categories
 * @param title - Category title
 * @returns Clean document ID
 */
export function generateCategoryDocumentId(title: string): string {
  return createSlug(title);
}

/**
 * Generates a clean document ID for user-related documents
 * @param userId - User ID
 * @param type - Document type (e.g., 'recent', 'bookmarks', 'stats')
 * @returns Clean document ID
 */
export function generateUserDocumentId(userId: string, type: string): string {
  // For user documents, we can use a combination of user ID and type
  // But keep the user ID as is for consistency with Firebase Auth
  return `${userId}-${type}`;
}

/**
 * Generates a clean document ID for suggested prayers
 * @param title - Suggestion title
 * @param timeContext - Time context (morning, evening, etc.)
 * @returns Clean document ID
 */
export function generateSuggestedPrayerDocumentId(title: string, timeContext?: string): string {
  const titleSlug = createSlug(title);
  const contextSlug = timeContext ? createSlug(timeContext) : '';
  
  if (contextSlug) {
    return `${contextSlug}-${titleSlug}`;
  }
  
  return titleSlug;
}

/**
 * Validates that a document ID is clean and readable
 * @param documentId - The document ID to validate
 * @returns True if the ID is clean, false otherwise
 */
export function isCleanDocumentId(documentId: string): boolean {
  // Check if the ID contains only lowercase letters, numbers, and hyphens
  const cleanPattern = /^[a-z0-9-]+$/;
  
  // Check if it doesn't start or end with hyphen
  const noLeadingTrailingHyphens = !/^-|-$/.test(documentId);
  
  // Check if it doesn't have consecutive hyphens
  const noConsecutiveHyphens = !/-{2,}/.test(documentId);
  
  return cleanPattern.test(documentId) && noLeadingTrailingHyphens && noConsecutiveHyphens;
}

/**
 * Converts an existing jumbled document ID to a clean one
 * This is useful for migration purposes
 * @param jumbledId - The existing jumbled ID
 * @param fallbackName - A fallback name to use if the ID can't be cleaned
 * @returns A clean document ID
 */
export function cleanExistingDocumentId(jumbledId: string, fallbackName: string): string {
  // If the ID is already clean, return it
  if (isCleanDocumentId(jumbledId)) {
    return jumbledId;
  }
  
  // Try to extract meaningful parts from the jumbled ID
  // This is a best-effort approach
  const cleaned = jumbledId
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // If the cleaned version is too short or meaningless, use the fallback
  if (cleaned.length < 3) {
    return createSlug(fallbackName);
  }
  
  return cleaned;
}

/**
 * Generates a timestamp-based suffix for ensuring uniqueness
 * @returns A short timestamp suffix
 */
export function generateTimestampSuffix(): string {
  return Date.now().toString(36); // Base36 encoding for shorter string
}

/**
 * Ensures a document ID is unique by adding a timestamp suffix if needed
 * @param baseId - The base document ID
 * @param existingIds - Array of existing document IDs to check against
 * @returns A unique document ID
 */
export function ensureUniqueDocumentId(baseId: string, existingIds: string[]): string {
  if (!existingIds.includes(baseId)) {
    return baseId;
  }
  
  // Add timestamp suffix to make it unique
  const suffix = generateTimestampSuffix();
  return `${baseId}-${suffix}`;
}