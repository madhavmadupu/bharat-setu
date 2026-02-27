/**
 * Tests for language utilities
 */

import { describe, it, expect } from '@jest/globals';
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_NATIVE_NAMES,
  LANGUAGE_ISO_CODES,
  isValidLanguage,
  validateLanguage,
  detectLanguage,
  getLanguageName,
  getLanguageISOCode,
  formatSupportedLanguages,
  detectLanguageFromText,
  isDevanagariScript,
  getDefaultLanguage,
} from '../src/utils/language';
import type { Language } from '../src/types';

describe('Language Constants', () => {
  it('should have 10 supported languages', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(10);
  });

  it('should have all languages in LANGUAGE_NAMES', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(LANGUAGE_NAMES[lang]).toBeDefined();
      expect(typeof LANGUAGE_NAMES[lang]).toBe('string');
    }
  });

  it('should have all languages in LANGUAGE_NATIVE_NAMES', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(LANGUAGE_NATIVE_NAMES[lang]).toBeDefined();
      expect(typeof LANGUAGE_NATIVE_NAMES[lang]).toBe('string');
    }
  });

  it('should have all languages in LANGUAGE_ISO_CODES', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(LANGUAGE_ISO_CODES[lang]).toBeDefined();
      expect(LANGUAGE_ISO_CODES[lang]).toHaveLength(2);
    }
  });
});

describe('isValidLanguage', () => {
  it('should return true for valid language codes', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(isValidLanguage(lang)).toBe(true);
    }
  });

  it('should return false for invalid language codes', () => {
    expect(isValidLanguage('en-US')).toBe(false);
    expect(isValidLanguage('invalid')).toBe(false);
    expect(isValidLanguage('hi')).toBe(false);
    expect(isValidLanguage('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isValidLanguage(null)).toBe(false);
    expect(isValidLanguage(undefined)).toBe(false);
    expect(isValidLanguage(123)).toBe(false);
    expect(isValidLanguage({})).toBe(false);
    expect(isValidLanguage([])).toBe(false);
  });
});

describe('validateLanguage', () => {
  it('should return the language for valid codes', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(validateLanguage(lang)).toBe(lang);
    }
  });

  it('should throw error for invalid language codes', () => {
    expect(() => validateLanguage('en-US')).toThrow();
    expect(() => validateLanguage('invalid')).toThrow();
    expect(() => validateLanguage('')).toThrow();
  });

  it('should throw error with helpful message', () => {
    expect(() => validateLanguage('en-US')).toThrow(/Invalid language code/);
    expect(() => validateLanguage('en-US')).toThrow(/Supported languages/);
  });
});

describe('detectLanguage', () => {
  it('should detect exact language codes', () => {
    expect(detectLanguage('hi-IN')).toBe('hi-IN');
    expect(detectLanguage('ta-IN')).toBe('ta-IN');
    expect(detectLanguage('mr-IN')).toBe('mr-IN');
  });

  it('should detect language codes with underscores', () => {
    expect(detectLanguage('hi_IN')).toBe('hi-IN');
    expect(detectLanguage('ta_IN')).toBe('ta-IN');
  });

  it('should detect case-insensitive codes', () => {
    expect(detectLanguage('HI-IN')).toBe('hi-IN');
    expect(detectLanguage('Hi-In')).toBe('hi-IN');
    expect(detectLanguage('TA-IN')).toBe('ta-IN');
  });

  it('should detect from ISO 639-1 codes', () => {
    expect(detectLanguage('hi')).toBe('hi-IN');
    expect(detectLanguage('ta')).toBe('ta-IN');
    expect(detectLanguage('mr')).toBe('mr-IN');
    expect(detectLanguage('te')).toBe('te-IN');
    expect(detectLanguage('bn')).toBe('bn-IN');
    expect(detectLanguage('gu')).toBe('gu-IN');
    expect(detectLanguage('kn')).toBe('kn-IN');
    expect(detectLanguage('ml')).toBe('ml-IN');
    expect(detectLanguage('pa')).toBe('pa-IN');
    expect(detectLanguage('or')).toBe('or-IN');
  });

  it('should return null for unsupported languages', () => {
    expect(detectLanguage('en')).toBeNull();
    expect(detectLanguage('en-US')).toBeNull();
    expect(detectLanguage('fr')).toBeNull();
    expect(detectLanguage('invalid')).toBeNull();
  });

  it('should return null for invalid inputs', () => {
    expect(detectLanguage('')).toBeNull();
    expect(detectLanguage(null as any)).toBeNull();
    expect(detectLanguage(undefined as any)).toBeNull();
    expect(detectLanguage(123 as any)).toBeNull();
  });
});

describe('getLanguageName', () => {
  it('should return English names by default', () => {
    expect(getLanguageName('hi-IN')).toBe('Hindi');
    expect(getLanguageName('ta-IN')).toBe('Tamil');
    expect(getLanguageName('mr-IN')).toBe('Marathi');
  });

  it('should return native names when requested', () => {
    expect(getLanguageName('hi-IN', true)).toBe('हिन्दी');
    expect(getLanguageName('ta-IN', true)).toBe('தமிழ்');
    expect(getLanguageName('mr-IN', true)).toBe('मराठी');
  });

  it('should return names for all supported languages', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(getLanguageName(lang)).toBeTruthy();
      expect(getLanguageName(lang, true)).toBeTruthy();
    }
  });
});

describe('getLanguageISOCode', () => {
  it('should return ISO 639-1 codes', () => {
    expect(getLanguageISOCode('hi-IN')).toBe('hi');
    expect(getLanguageISOCode('ta-IN')).toBe('ta');
    expect(getLanguageISOCode('mr-IN')).toBe('mr');
  });

  it('should return 2-character codes for all languages', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      const isoCode = getLanguageISOCode(lang);
      expect(isoCode).toHaveLength(2);
      expect(isoCode).toMatch(/^[a-z]{2}$/);
    }
  });
});

describe('formatSupportedLanguages', () => {
  it('should format English names by default', () => {
    const formatted = formatSupportedLanguages();
    expect(formatted).toContain('Hindi');
    expect(formatted).toContain('Tamil');
    expect(formatted).toContain('Marathi');
  });

  it('should format native names when requested', () => {
    const formatted = formatSupportedLanguages(true);
    expect(formatted).toContain('हिन्दी');
    expect(formatted).toContain('தமிழ்');
    expect(formatted).toContain('मराठी');
  });

  it('should include all 10 languages', () => {
    const formatted = formatSupportedLanguages();
    const languages = formatted.split(', ');
    expect(languages).toHaveLength(10);
  });
});

describe('detectLanguageFromText', () => {
  it('should detect Hindi from Devanagari text', () => {
    expect(detectLanguageFromText('नमस्ते')).toBe('hi-IN');
    expect(detectLanguageFromText('मैं भारत से हूं')).toBe('hi-IN');
  });

  it('should detect Tamil from Tamil text', () => {
    expect(detectLanguageFromText('வணக்கம்')).toBe('ta-IN');
    expect(detectLanguageFromText('நான் இந்தியாவிலிருந்து வந்தேன்')).toBe('ta-IN');
  });

  it('should detect Telugu from Telugu text', () => {
    expect(detectLanguageFromText('నమస్కారం')).toBe('te-IN');
  });

  it('should detect Bengali from Bengali text', () => {
    expect(detectLanguageFromText('নমস্কার')).toBe('bn-IN');
  });

  it('should detect Gujarati from Gujarati text', () => {
    expect(detectLanguageFromText('નમસ્તે')).toBe('gu-IN');
  });

  it('should detect Kannada from Kannada text', () => {
    expect(detectLanguageFromText('ನಮಸ್ಕಾರ')).toBe('kn-IN');
  });

  it('should detect Malayalam from Malayalam text', () => {
    expect(detectLanguageFromText('നമസ്കാരം')).toBe('ml-IN');
  });

  it('should detect Punjabi from Gurmukhi text', () => {
    expect(detectLanguageFromText('ਸਤ ਸ੍ਰੀ ਅਕਾਲ')).toBe('pa-IN');
  });

  it('should detect Odia from Odia text', () => {
    expect(detectLanguageFromText('ନମସ୍କାର')).toBe('or-IN');
  });

  it('should return null for non-Indian scripts', () => {
    expect(detectLanguageFromText('Hello')).toBeNull();
    expect(detectLanguageFromText('Bonjour')).toBeNull();
    expect(detectLanguageFromText('123456')).toBeNull();
  });

  it('should return null for invalid inputs', () => {
    expect(detectLanguageFromText('')).toBeNull();
    expect(detectLanguageFromText(null as any)).toBeNull();
    expect(detectLanguageFromText(undefined as any)).toBeNull();
  });

  it('should detect language from mixed text', () => {
    // Text with Hindi and some English/numbers
    expect(detectLanguageFromText('नमस्ते 123 hello')).toBe('hi-IN');
  });
});

describe('isDevanagariScript', () => {
  it('should return true for Hindi', () => {
    expect(isDevanagariScript('hi-IN')).toBe(true);
  });

  it('should return true for Marathi', () => {
    expect(isDevanagariScript('mr-IN')).toBe(true);
  });

  it('should return false for non-Devanagari languages', () => {
    expect(isDevanagariScript('ta-IN')).toBe(false);
    expect(isDevanagariScript('te-IN')).toBe(false);
    expect(isDevanagariScript('bn-IN')).toBe(false);
    expect(isDevanagariScript('gu-IN')).toBe(false);
    expect(isDevanagariScript('kn-IN')).toBe(false);
    expect(isDevanagariScript('ml-IN')).toBe(false);
    expect(isDevanagariScript('pa-IN')).toBe(false);
    expect(isDevanagariScript('or-IN')).toBe(false);
  });
});

describe('getDefaultLanguage', () => {
  it('should return Hindi as default', () => {
    expect(getDefaultLanguage()).toBe('hi-IN');
  });

  it('should return a valid language', () => {
    const defaultLang = getDefaultLanguage();
    expect(isValidLanguage(defaultLang)).toBe(true);
  });
});

describe('Edge Cases', () => {
  it('should handle empty strings gracefully', () => {
    expect(detectLanguage('')).toBeNull();
    expect(detectLanguageFromText('')).toBeNull();
  });

  it('should handle whitespace-only strings', () => {
    expect(detectLanguage('   ')).toBeNull();
    expect(detectLanguageFromText('   ')).toBeNull();
  });

  it('should handle special characters', () => {
    // detectLanguage extracts valid parts, so 'hi-IN!' becomes 'hi-IN'
    expect(detectLanguage('hi-IN!')).toBe('hi-IN');
    expect(detectLanguage('@#$%')).toBeNull();
  });

  it('should handle very long strings', () => {
    const longText = 'नमस्ते'.repeat(1000);
    expect(detectLanguageFromText(longText)).toBe('hi-IN');
  });
});
