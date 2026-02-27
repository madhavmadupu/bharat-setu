/**
 * Core type definitions for Bharat-Setu
 * 
 * This file contains the fundamental types used throughout the application.
 */

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
 * Voice query request
 */
export interface VoiceQueryRequest {
  audio: Buffer;
  sessionId?: string;
  userId?: string;
  language?: Language;
}

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
 * Transcription result
 */
export interface TranscriptionResult {
  text: string;
  language: Language;
  confidence: number;
  durationMs: number;
}

/**
 * Audio buffer
 */
export interface AudioBuffer {
  data: Buffer;
  format: 'mp3' | 'pcm';
  sampleRate: number;
}

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
 * Eligibility result
 */
export interface EligibilityResult {
  isEligible: boolean;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  confidence: number;
}

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
 * Query filters for RAG
 */
export interface QueryFilters {
  schemeNames?: string[];
  categories?: string[];
  dateRange?: { start: Date; end: Date };
}

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
