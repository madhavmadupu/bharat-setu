/**
 * Core type definitions for Bharat-Setu
 * 
 * This file contains the fundamental types used throughout the application.
 */

import { z } from 'zod';

/**
 * Supported languages for voice interaction
 */
export type Language =
  | 'hi-IN' // Hindi
  | 'ta-IN' // Tamil
  | 'mr-IN' // Marathi
  | 'te-IN' // Telugu
  | 'bn-IN' // Bengali
  | 'gu-IN' // Gujarati
  | 'kn-IN' // Kannada
  | 'ml-IN' // Malayalam
  | 'pa-IN' // Punjabi
  | 'or-IN'; // Odia

/**
 * Zod schema for Language validation
 */
export const LanguageSchema = z.enum([
  'hi-IN',
  'ta-IN',
  'mr-IN',
  'te-IN',
  'bn-IN',
  'gu-IN',
  'kn-IN',
  'ml-IN',
  'pa-IN',
  'or-IN',
]);

/**
 * User profile stored in DynamoDB
 */
export interface UserProfile {
  userId: string;
  age: number;
  occupation: string;
  income: number;
  location: string;
  state: string;
  language: Language;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    hasAadhaar: boolean;
    hasBankAccount: boolean;
    hasRationCard: boolean;
  };
}

/**
 * Zod schema for UserProfile validation
 */
export const UserProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  age: z.number().int().min(18, 'Age must be at least 18').max(120, 'Age must be at most 120'),
  occupation: z.string().min(1, 'Occupation is required'),
  income: z.number().min(0, 'Income must be non-negative'),
  location: z.string().min(1, 'Location is required'),
  state: z.string().min(1, 'State is required'),
  language: LanguageSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.object({
    hasAadhaar: z.boolean(),
    hasBankAccount: z.boolean(),
    hasRationCard: z.boolean(),
  }),
});

/**
 * Government scheme category
 */
export type SchemeCategory =
  | 'agriculture'
  | 'healthcare'
  | 'education'
  | 'pension'
  | 'housing'
  | 'employment'
  | 'women_empowerment';

/**
 * Zod schema for SchemeCategory validation
 */
export const SchemeCategorySchema = z.enum([
  'agriculture',
  'healthcare',
  'education',
  'pension',
  'housing',
  'employment',
  'women_empowerment',
]);

/**
 * Eligibility criteria for a scheme
 */
export interface EligibilityCriteria {
  minAge?: number;
  maxAge?: number;
  occupations?: string[];
  maxIncome?: number;
  states?: string[];
  gender?: 'male' | 'female' | 'any';
  customRules?: string[];
}

/**
 * Zod schema for EligibilityCriteria validation
 */
export const EligibilityCriteriaSchema = z.object({
  minAge: z.number().int().min(0).optional(),
  maxAge: z.number().int().min(0).optional(),
  occupations: z.array(z.string()).optional(),
  maxIncome: z.number().min(0).optional(),
  states: z.array(z.string()).optional(),
  gender: z.enum(['male', 'female', 'any']).optional(),
  customRules: z.array(z.string()).optional(),
}).refine(
  (data) => !data.minAge || !data.maxAge || data.minAge <= data.maxAge,
  { message: 'minAge must be less than or equal to maxAge' }
);

/**
 * Document type
 */
export type DocumentType =
  | 'identity_proof'
  | 'address_proof'
  | 'income_certificate'
  | 'caste_certificate'
  | 'bank_details'
  | 'land_records'
  | 'other';

/**
 * Zod schema for DocumentType validation
 */
export const DocumentTypeSchema = z.enum([
  'identity_proof',
  'address_proof',
  'income_certificate',
  'caste_certificate',
  'bank_details',
  'land_records',
  'other',
]);

/**
 * Required document for scheme application
 */
export interface Document {
  documentId: string;
  name: string;
  nameTranslations: Record<Language, string>;
  type: DocumentType;
  isMandatory: boolean;
  alternatives?: Document[];
  description: string;
  descriptionTranslations: Record<Language, string>;
}

/**
 * Zod schema for Document validation
 */
export const DocumentSchema: z.ZodType<Document> = z.lazy(() =>
  z.object({
    documentId: z.string().min(1, 'Document ID is required'),
    name: z.string().min(1, 'Document name is required'),
    nameTranslations: z.record(z.string(), z.string()) as z.ZodType<Record<Language, string>>,
    type: DocumentTypeSchema,
    isMandatory: z.boolean(),
    alternatives: z.array(DocumentSchema).optional(),
    description: z.string().min(1, 'Description is required'),
    descriptionTranslations: z.record(z.string(), z.string()) as z.ZodType<Record<Language, string>>,
  })
) as z.ZodType<Document>;

/**
 * Application step
 */
export interface ApplicationStep {
  stepNumber: number;
  description: string;
  descriptionTranslations: Record<Language, string>;
  url?: string;
  address?: string;
}

/**
 * Zod schema for ApplicationStep validation
 */
export const ApplicationStepSchema = z.object({
  stepNumber: z.number().int().min(1, 'Step number must be at least 1'),
  description: z.string().min(1, 'Description is required'),
  descriptionTranslations: z.record(z.string(), z.string()) as z.ZodType<Record<Language, string>>,
  url: z.string().url().optional(),
  address: z.string().optional(),
});

/**
 * Government scheme definition
 */
export interface Scheme {
  schemeId: string;
  name: string;
  nameTranslations: Record<Language, string>;
  description: string;
  descriptionTranslations: Record<Language, string>;
  category: SchemeCategory;
  eligibilityCriteria: EligibilityCriteria;
  benefits: string[];
  requiredDocuments: Document[];
  applicationProcess: ApplicationStep[];
  officialUrl: string;
  lastUpdated: Date;
}

/**
 * Zod schema for Scheme validation
 */
export const SchemeSchema = z.object({
  schemeId: z.string().min(1, 'Scheme ID is required'),
  name: z.string().min(1, 'Scheme name is required'),
  nameTranslations: z.record(z.string(), z.string()) as z.ZodType<Record<Language, string>>,
  description: z.string().min(1, 'Description is required'),
  descriptionTranslations: z.record(z.string(), z.string()) as z.ZodType<Record<Language, string>>,
  category: SchemeCategorySchema,
  eligibilityCriteria: EligibilityCriteriaSchema,
  benefits: z.array(z.string()).min(1, 'At least one benefit is required'),
  requiredDocuments: z.array(DocumentSchema),
  applicationProcess: z.array(ApplicationStepSchema).min(1, 'At least one application step is required'),
  officialUrl: z.string().url('Official URL must be a valid URL'),
  lastUpdated: z.date(),
});

/**
 * Session for conversation management
 */
export interface Session {
  sessionId: string;
  userId?: string;
  language: Language;
  startTime: Date;
  lastActivityTime: Date;
  conversationHistory: Message[];
  context: Record<string, unknown>;
  isActive: boolean;
}

/**
 * Message in conversation
 */
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

/**
 * Zod schema for Message validation
 */
export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content is required'),
  timestamp: z.date(),
  audioUrl: z.string().url().optional(),
});

/**
 * Zod schema for Session validation
 */
export const SessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  userId: z.string().optional(),
  language: LanguageSchema,
  startTime: z.date(),
  lastActivityTime: z.date(),
  conversationHistory: z.array(MessageSchema),
  context: z.record(z.string(), z.unknown()),
  isActive: z.boolean(),
}).refine(
  (data) => data.lastActivityTime >= data.startTime,
  { message: 'lastActivityTime must be after or equal to startTime' }
);

/**
 * Citation for factual claims
 */
export interface Citation {
  documentId: string;
  documentTitle: string;
  pageNumber?: number;
  excerpt: string;
  url?: string;
}

/**
 * Zod schema for Citation validation
 */
export const CitationSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  documentTitle: z.string().min(1, 'Document title is required'),
  pageNumber: z.number().int().min(1).optional(),
  excerpt: z.string().min(1, 'Excerpt is required'),
  url: z.string().url().optional(),
});

/**
 * Voice query request
 */
export interface VoiceQueryRequest {
  audio: Buffer;
  sessionId?: string;
  userId?: string;
  language?: Language;
}

/**
 * Zod schema for VoiceQueryRequest validation
 */
export const VoiceQueryRequestSchema = z.object({
  audio: z.instanceof(Buffer, { message: 'Audio must be a Buffer' }),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  language: LanguageSchema.optional(),
});

/**
 * Voice query response
 */
export interface VoiceQueryResponse {
  audio: Buffer;
  text: string;
  sessionId: string;
  citations: Citation[];
  latencyMs: number;
}

/**
 * Zod schema for VoiceQueryResponse validation
 */
export const VoiceQueryResponseSchema = z.object({
  audio: z.instanceof(Buffer, { message: 'Audio must be a Buffer' }),
  text: z.string().min(1, 'Response text is required'),
  sessionId: z.string().min(1, 'Session ID is required'),
  citations: z.array(CitationSchema),
  latencyMs: z.number().min(0, 'Latency must be non-negative'),
});

/**
 * Transcription result
 */
export interface TranscriptionResult {
  text: string;
  language: Language;
  confidence: number;
  durationMs: number;
}

/**
 * Zod schema for TranscriptionResult validation
 */
export const TranscriptionResultSchema = z.object({
  text: z.string().min(1, 'Transcription text is required'),
  language: LanguageSchema,
  confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1'),
  durationMs: z.number().min(0, 'Duration must be non-negative'),
});

/**
 * Audio buffer
 */
export interface AudioBuffer {
  data: Buffer;
  format: 'mp3' | 'pcm';
  sampleRate: number;
}

/**
 * Zod schema for AudioBuffer validation
 */
export const AudioBufferSchema = z.object({
  data: z.instanceof(Buffer, { message: 'Data must be a Buffer' }),
  format: z.enum(['mp3', 'pcm']),
  sampleRate: z.number().int().min(8000, 'Sample rate must be at least 8000 Hz'),
});

/**
 * Scheme match result
 */
export interface SchemeMatch {
  scheme: Scheme;
  eligibilityScore: number;
  matchReasons: string[];
  missingCriteria?: string[];
}

/**
 * Zod schema for SchemeMatch validation
 */
export const SchemeMatchSchema = z.object({
  scheme: SchemeSchema,
  eligibilityScore: z.number().min(0).max(1, 'Eligibility score must be between 0 and 1'),
  matchReasons: z.array(z.string()).min(1, 'At least one match reason is required'),
  missingCriteria: z.array(z.string()).optional(),
});

/**
 * Eligibility result
 */
export interface EligibilityResult {
  isEligible: boolean;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  confidence: number;
}

/**
 * Zod schema for EligibilityResult validation
 */
export const EligibilityResultSchema = z.object({
  isEligible: z.boolean(),
  matchedCriteria: z.array(z.string()),
  unmatchedCriteria: z.array(z.string()),
  confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1'),
});

/**
 * Checklist for document requirements
 */
export interface Checklist {
  mandatory: Document[];
  optional: Document[];
  alternatives: DocumentAlternative[];
}

/**
 * Document alternative
 */
export interface DocumentAlternative {
  description: string;
  options: Document[];
}

/**
 * Zod schema for DocumentAlternative validation
 */
export const DocumentAlternativeSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  options: z.array(DocumentSchema).min(2, 'At least two alternative options are required'),
});

/**
 * Zod schema for Checklist validation
 */
export const ChecklistSchema = z.object({
  mandatory: z.array(DocumentSchema),
  optional: z.array(DocumentSchema),
  alternatives: z.array(DocumentAlternativeSchema),
});

/**
 * RAG retrieval result
 */
export interface RetrievalResult {
  text: string;
  documentId: string;
  documentTitle: string;
  pageNumber?: number;
  relevanceScore: number;
  metadata: Record<string, unknown>;
}

/**
 * Zod schema for RetrievalResult validation
 */
export const RetrievalResultSchema = z.object({
  text: z.string().min(1, 'Retrieved text is required'),
  documentId: z.string().min(1, 'Document ID is required'),
  documentTitle: z.string().min(1, 'Document title is required'),
  pageNumber: z.number().int().min(1).optional(),
  relevanceScore: z.number().min(0).max(1, 'Relevance score must be between 0 and 1'),
  metadata: z.record(z.string(), z.unknown()),
});

/**
 * Query filters for RAG
 */
export interface QueryFilters {
  schemeNames?: string[];
  categories?: string[];
  dateRange?: { start: Date; end: Date };
}

/**
 * Zod schema for QueryFilters validation
 */
export const QueryFiltersSchema = z.object({
  schemeNames: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  dateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .refine((data) => data.start <= data.end, {
      message: 'Start date must be before or equal to end date',
    })
    .optional(),
});

/**
 * Error response
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    retryable: boolean;
    retryAfter?: number;
    supportContact?: string;
  };
  requestId: string;
  timestamp: string;
}

/**
 * Zod schema for ErrorResponse validation
 */
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().min(1, 'Error code is required'),
    message: z.string().min(1, 'Error message is required'),
    details: z.unknown().optional(),
    retryable: z.boolean(),
    retryAfter: z.number().int().min(0).optional(),
    supportContact: z.string().optional(),
  }),
  requestId: z.string().min(1, 'Request ID is required'),
  timestamp: z.string().datetime('Timestamp must be a valid ISO 8601 datetime'),
});
