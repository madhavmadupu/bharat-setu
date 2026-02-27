/**
 * Language utilities for Bharat-Setu
 * 
 * Provides language detection, validation, and helper functions
 * for working with the 10 supported Indian languages.
 */

import { Language, LanguageSchema } from '../types';

/**
 * All supported languages
 */
export const SUPPORTED_LANGUAGES: readonly Language[] = [
  'hi-IN', // Hindi
  'ta-IN', // Tamil
  'mr-IN', // Marathi
  'te-IN', // Telugu
  'bn-IN', // Bengali
  'gu-IN', // Gujarati
  'kn-IN', // Kannada
  'ml-IN', // Malayalam
  'pa-IN', // Punjabi
  'or-IN', // Odia
] as const;

/**
 * Language display names in English
 */
export const LANGUAGE_NAMES: Record<Language, string> = {
  'hi-IN': 'Hindi',
  'ta-IN': 'Tamil',
  'mr-IN': 'Marathi',
  'te-IN': 'Telugu',
  'bn-IN': 'Bengali',
  'gu-IN': 'Gujarati',
  'kn-IN': 'Kannada',
  'ml-IN': 'Malayalam',
  'pa-IN': 'Punjabi',
  'or-IN': 'Odia',
};

/**
 * Language display names in their native scripts
 */
export const LANGUAGE_NATIVE_NAMES: Record<Language, string> = {
  'hi-IN': 'हिन्दी',
  'ta-IN': 'தமிழ்',
  'mr-IN': 'मराठी',
  'te-IN': 'తెలుగు',
  'bn-IN': 'বাংলা',
  'gu-IN': 'ગુજરાતી',
  'kn-IN': 'ಕನ್ನಡ',
  'ml-IN': 'മലയാളം',
  'pa-IN': 'ਪੰਜਾਬੀ',
  'or-IN': 'ଓଡ଼ିଆ',
};

/**
 * ISO 639-1 language codes (without region)
 */
export const LANGUAGE_ISO_CODES: Record<Language, string> = {
  'hi-IN': 'hi',
  'ta-IN': 'ta',
  'mr-IN': 'mr',
  'te-IN': 'te',
  'bn-IN': 'bn',
  'gu-IN': 'gu',
  'kn-IN': 'kn',
  'ml-IN': 'ml',
  'pa-IN': 'pa',
  'or-IN': 'or',
};

/**
 * Validates if a string is a supported language code
 * 
 * @param value - The value to validate
 * @returns true if the value is a valid Language, false otherwise
 * 
 * @example
 * ```typescript
 * isValidLanguage('hi-IN') // true
 * isValidLanguage('en-US') // false
 * isValidLanguage('invalid') // false
 * ```
 */
export function isValidLanguage(value: unknown): value is Language {
  const result = LanguageSchema.safeParse(value);
  return result.success;
}

/**
 * Validates and returns a Language, or throws an error
 * 
 * @param value - The value to validate
 * @returns The validated Language
 * @throws Error if the value is not a valid Language
 * 
 * @example
 * ```typescript
 * validateLanguage('hi-IN') // 'hi-IN'
 * validateLanguage('invalid') // throws Error
 * ```
 */
export function validateLanguage(value: unknown): Language {
  const result = LanguageSchema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `Invalid language code: ${value}. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`
    );
  }
  return result.data;
}

/**
 * Detects language from a language code string, handling various formats
 * 
 * This function attempts to match:
 * - Full locale codes (e.g., 'hi-IN', 'ta_IN')
 * - ISO 639-1 codes (e.g., 'hi', 'ta')
 * - Case-insensitive variants
 * 
 * @param languageCode - The language code to detect
 * @returns The detected Language, or null if not supported
 * 
 * @example
 * ```typescript
 * detectLanguage('hi-IN') // 'hi-IN'
 * detectLanguage('hi') // 'hi-IN'
 * detectLanguage('HI-IN') // 'hi-IN'
 * detectLanguage('ta_IN') // 'ta-IN'
 * detectLanguage('en') // null
 * ```
 */
export function detectLanguage(languageCode: string): Language | null {
  if (!languageCode || typeof languageCode !== 'string') {
    return null;
  }

  // Normalize the input: lowercase and replace underscores with hyphens
  const normalized = languageCode.toLowerCase().replace('_', '-');

  // Try exact match first
  if (isValidLanguage(normalized)) {
    return normalized;
  }

  // Try matching by ISO 639-1 code (first two characters)
  const isoCode = normalized.split('-')[0];
  for (const lang of SUPPORTED_LANGUAGES) {
    if (LANGUAGE_ISO_CODES[lang] === isoCode) {
      return lang;
    }
  }

  return null;
}

/**
 * Gets the display name for a language
 * 
 * @param language - The language code
 * @param native - If true, returns the native name; otherwise returns English name
 * @returns The display name
 * 
 * @example
 * ```typescript
 * getLanguageName('hi-IN') // 'Hindi'
 * getLanguageName('hi-IN', true) // 'हिन्दी'
 * ```
 */
export function getLanguageName(language: Language, native = false): string {
  return native ? LANGUAGE_NATIVE_NAMES[language] : LANGUAGE_NAMES[language];
}

/**
 * Gets the ISO 639-1 code for a language
 * 
 * @param language - The language code
 * @returns The ISO 639-1 code (e.g., 'hi' for 'hi-IN')
 * 
 * @example
 * ```typescript
 * getLanguageISOCode('hi-IN') // 'hi'
 * getLanguageISOCode('ta-IN') // 'ta'
 * ```
 */
export function getLanguageISOCode(language: Language): string {
  return LANGUAGE_ISO_CODES[language];
}

/**
 * Formats a list of supported languages for display
 * 
 * @param native - If true, uses native names; otherwise uses English names
 * @returns A formatted string of supported languages
 * 
 * @example
 * ```typescript
 * formatSupportedLanguages() // 'Hindi, Tamil, Marathi, ...'
 * formatSupportedLanguages(true) // 'हिन्दी, தமிழ், मराठी, ...'
 * ```
 */
export function formatSupportedLanguages(native = false): string {
  return SUPPORTED_LANGUAGES.map((lang) => getLanguageName(lang, native)).join(', ');
}

/**
 * Detects language from text content using Unicode script detection
 * 
 * This is a simple heuristic-based detection that looks at the Unicode
 * ranges of characters in the text to identify the script/language.
 * 
 * @param text - The text to analyze
 * @returns The detected Language, or null if detection fails
 * 
 * @example
 * ```typescript
 * detectLanguageFromText('नमस्ते') // 'hi-IN' (Devanagari script)
 * detectLanguageFromText('வணக்கம்') // 'ta-IN' (Tamil script)
 * detectLanguageFromText('Hello') // null (not a supported script)
 * ```
 */
export function detectLanguageFromText(text: string): Language | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Unicode ranges for Indian scripts
  const scriptRanges: Record<string, [number, number]> = {
    devanagari: [0x0900, 0x097f], // Hindi, Marathi
    tamil: [0x0b80, 0x0bff],
    telugu: [0x0c00, 0x0c7f],
    bengali: [0x0980, 0x09ff],
    gujarati: [0x0a80, 0x0aff],
    kannada: [0x0c80, 0x0cff],
    malayalam: [0x0d00, 0x0d7f],
    gurmukhi: [0x0a00, 0x0a7f], // Punjabi
    oriya: [0x0b00, 0x0b7f], // Odia
  };

  // Count characters in each script
  const scriptCounts: Record<string, number> = {};
  
  for (const char of text) {
    const code = char.charCodeAt(0);
    
    for (const [script, [start, end]] of Object.entries(scriptRanges)) {
      if (code >= start && code <= end) {
        scriptCounts[script] = (scriptCounts[script] || 0) + 1;
      }
    }
  }

  // Find the script with the most characters
  let maxCount = 0;
  let detectedScript: string | null = null;
  
  for (const [script, count] of Object.entries(scriptCounts)) {
    if (count > maxCount) {
      maxCount = count;
      detectedScript = script;
    }
  }

  // Map script to language
  const scriptToLanguage: Record<string, Language> = {
    devanagari: 'hi-IN', // Default to Hindi for Devanagari
    tamil: 'ta-IN',
    telugu: 'te-IN',
    bengali: 'bn-IN',
    gujarati: 'gu-IN',
    kannada: 'kn-IN',
    malayalam: 'ml-IN',
    gurmukhi: 'pa-IN',
    oriya: 'or-IN',
  };

  return detectedScript ? scriptToLanguage[detectedScript] || null : null;
}

/**
 * Checks if a language uses Devanagari script
 * 
 * @param language - The language to check
 * @returns true if the language uses Devanagari script
 * 
 * @example
 * ```typescript
 * isDevanagariScript('hi-IN') // true
 * isDevanagariScript('mr-IN') // true
 * isDevanagariScript('ta-IN') // false
 * ```
 */
export function isDevanagariScript(language: Language): boolean {
  return language === 'hi-IN' || language === 'mr-IN';
}

/**
 * Gets the default language (Hindi)
 * 
 * @returns The default language code
 */
export function getDefaultLanguage(): Language {
  return 'hi-IN';
}
