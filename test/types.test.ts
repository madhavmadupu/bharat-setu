/**
 * Tests for Zod validation schemas
 */

import {
  LanguageSchema,
  UserProfileSchema,
  SchemeCategorySchema,
  EligibilityCriteriaSchema,
  DocumentTypeSchema,
  DocumentSchema,
  ApplicationStepSchema,
  SchemeSchema,
  MessageSchema,
  SessionSchema,
  CitationSchema,
  type Language,
  type UserProfile,
  type Document,
  type Scheme,
} from '../src/types';

describe('Zod Validation Schemas', () => {
  describe('LanguageSchema', () => {
    it('should validate supported languages', () => {
      expect(() => LanguageSchema.parse('hi-IN')).not.toThrow();
      expect(() => LanguageSchema.parse('ta-IN')).not.toThrow();
      expect(() => LanguageSchema.parse('en-US')).toThrow();
    });
  });

  describe('UserProfileSchema', () => {
    it('should validate a valid user profile', () => {
      const validProfile: UserProfile = {
        userId: 'user123',
        age: 35,
        occupation: 'farmer',
        income: 50000,
        location: 'Mumbai',
        state: 'Maharashtra',
        language: 'hi-IN' as Language,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          hasAadhaar: true,
          hasBankAccount: true,
          hasRationCard: false,
        },
      };

      expect(() => UserProfileSchema.parse(validProfile)).not.toThrow();
    });

    it('should reject invalid age', () => {
      const invalidProfile = {
        userId: 'user123',
        age: 15, // Too young
        occupation: 'farmer',
        income: 50000,
        location: 'Mumbai',
        state: 'Maharashtra',
        language: 'hi-IN',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          hasAadhaar: true,
          hasBankAccount: true,
          hasRationCard: false,
        },
      };

      expect(() => UserProfileSchema.parse(invalidProfile)).toThrow();
    });

    it('should reject negative income', () => {
      const invalidProfile = {
        userId: 'user123',
        age: 35,
        occupation: 'farmer',
        income: -1000, // Negative
        location: 'Mumbai',
        state: 'Maharashtra',
        language: 'hi-IN',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          hasAadhaar: true,
          hasBankAccount: true,
          hasRationCard: false,
        },
      };

      expect(() => UserProfileSchema.parse(invalidProfile)).toThrow();
    });
  });

  describe('EligibilityCriteriaSchema', () => {
    it('should validate valid eligibility criteria', () => {
      const validCriteria = {
        minAge: 18,
        maxAge: 60,
        occupations: ['farmer', 'daily_wage_worker'],
        maxIncome: 100000,
        states: ['Maharashtra', 'Karnataka'],
        gender: 'any' as const,
      };

      expect(() => EligibilityCriteriaSchema.parse(validCriteria)).not.toThrow();
    });

    it('should reject when minAge > maxAge', () => {
      const invalidCriteria = {
        minAge: 60,
        maxAge: 18, // Invalid: min > max
      };

      expect(() => EligibilityCriteriaSchema.parse(invalidCriteria)).toThrow();
    });
  });

  describe('DocumentSchema', () => {
    it('should validate a valid document', () => {
      const validDocument: Document = {
        documentId: 'doc123',
        name: 'Aadhaar Card',
        nameTranslations: {
          'hi-IN': 'आधार कार्ड',
          'ta-IN': 'ஆதார் அட்டை',
          'mr-IN': 'आधार कार्ड',
          'te-IN': 'ఆధార్ కార్డ్',
          'bn-IN': 'আধার কার্ড',
          'gu-IN': 'આધાર કાર્ડ',
          'kn-IN': 'ಆಧಾರ್ ಕಾರ್ಡ್',
          'ml-IN': 'ആധാർ കാർഡ്',
          'pa-IN': 'ਆਧਾਰ ਕਾਰਡ',
          'or-IN': 'ଆଧାର କାର୍ଡ',
        },
        type: 'identity_proof',
        isMandatory: true,
        description: 'Government issued identity card',
        descriptionTranslations: {
          'hi-IN': 'सरकार द्वारा जारी पहचान पत्र',
          'ta-IN': 'அரசு வழங்கிய அடையாள அட்டை',
          'mr-IN': 'सरकारने जारी केलेले ओळखपत्र',
          'te-IN': 'ప్రభుత్వం జారీ చేసిన గుర్తింపు కార్డు',
          'bn-IN': 'সরকার প্রদত্ত পরিচয়পত্র',
          'gu-IN': 'સરકાર દ્વારા જારી કરાયેલ ઓળખ કાર્ડ',
          'kn-IN': 'ಸರ್ಕಾರ ನೀಡಿದ ಗುರುತಿನ ಚೀಟಿ',
          'ml-IN': 'സർക്കാർ നൽകിയ തിരിച്ചറിയൽ കാർഡ്',
          'pa-IN': 'ਸਰਕਾਰ ਦੁਆਰਾ ਜਾਰੀ ਪਛਾਣ ਕਾਰਡ',
          'or-IN': 'ସରକାରଙ୍କ ଦ୍ୱାରା ଜାରି ପରିଚୟ ପତ୍ର',
        },
      };

      expect(() => DocumentSchema.parse(validDocument)).not.toThrow();
    });
  });

  describe('CitationSchema', () => {
    it('should validate a valid citation', () => {
      const validCitation = {
        documentId: 'doc123',
        documentTitle: 'PM-Kisan Guidelines',
        pageNumber: 5,
        excerpt: 'Farmers with less than 2 hectares are eligible',
        url: 'https://pmkisan.gov.in/guidelines.pdf',
      };

      expect(() => CitationSchema.parse(validCitation)).not.toThrow();
    });

    it('should reject invalid URL', () => {
      const invalidCitation = {
        documentId: 'doc123',
        documentTitle: 'PM-Kisan Guidelines',
        excerpt: 'Farmers with less than 2 hectares are eligible',
        url: 'not-a-valid-url',
      };

      expect(() => CitationSchema.parse(invalidCitation)).toThrow();
    });
  });

  describe('SessionSchema', () => {
    it('should validate a valid session', () => {
      const now = new Date();
      const validSession = {
        sessionId: 'session123',
        userId: 'user123',
        language: 'hi-IN' as Language,
        startTime: now,
        lastActivityTime: new Date(now.getTime() + 1000),
        conversationHistory: [],
        context: {},
        isActive: true,
      };

      expect(() => SessionSchema.parse(validSession)).not.toThrow();
    });

    it('should reject when lastActivityTime is before startTime', () => {
      const now = new Date();
      const invalidSession = {
        sessionId: 'session123',
        language: 'hi-IN',
        startTime: now,
        lastActivityTime: new Date(now.getTime() - 1000), // Before start
        conversationHistory: [],
        context: {},
        isActive: true,
      };

      expect(() => SessionSchema.parse(invalidSession)).toThrow();
    });
  });
});
