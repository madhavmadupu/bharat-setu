# Implementation Plan: Bharat-Setu

## Overview

This implementation plan breaks down the Bharat-Setu voice-first AI agent into discrete, incremental coding tasks. The approach follows a bottom-up strategy: building core data models and utilities first, then service layers, integration layers, and finally the orchestration and API layers. Each task builds on previous work, with checkpoints to ensure quality and integration.

The implementation uses TypeScript with AWS CDK for infrastructure, AWS Lambda for compute, and integrates with Amazon Bedrock, Transcribe, Polly, DynamoDB, and S3.

## Tasks

- [-] 1. Project setup and infrastructure foundation
  - Initialize TypeScript project with AWS CDK
  - Configure build tools (esbuild/webpack), linting (ESLint), and testing (Jest)
  - Set up project structure: `/src`, `/test`, `/infrastructure`, `/lib`
  - Install core dependencies: AWS SDK v3, fast-check for property testing
  - Create CDK stack skeleton for API Gateway, Lambda, DynamoDB, S3
  - _Requirements: 9.1, 14.1_


- [ ] 2. Implement core data models and types
  - [~] 2.1 Create TypeScript interfaces for UserProfile, Scheme, Document, Session, Citation
    - Define all data models from design document
    - Include validation schemas using Zod or similar
    - _Requirements: 3.1, 3.5_
  
  - [ ]* 2.2 Write property test for UserProfile unique identifiers
    - **Property 8: Profile Unique Identifier**
    - **Validates: Requirements 3.5**
  
  - [~] 2.3 Implement Language enum and language utilities
    - Define supported languages (10 Indian languages)
    - Create language detection and validation functions
    - _Requirements: 1.1, 2.1_
  
  - [ ]* 2.4 Write property test for multilingual support
    - **Property 1: Multilingual Voice Input Acceptance**
    - **Validates: Requirements 1.1**

- [ ] 3. Implement Profile Store (DynamoDB integration)
  - [~] 3.1 Create ProfileStore class with CRUD operations
    - Implement create, get, update, delete methods
    - Use AWS SDK v3 DynamoDB client
    - Add error handling for throttling and not found cases
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [ ]* 3.2 Write property test for profile persistence
    - **Property 7: Profile Update Persistence**
    - **Validates: Requirements 3.4**
  
  - [ ]* 3.3 Write property test for profile deletion
    - **Property 27: Profile Deletion Completeness**
    - **Validates: Requirements 10.4**
  
  - [~] 3.4 Implement PII protection in profile storage
    - Add field-level encryption for sensitive data
    - Ensure no plain-text PII in logs
    - _Requirements: 10.1, 10.3_
  
  - [ ]* 3.5 Write property test for PII protection
    - **Property 26: PII Protection in Logs**
    - **Validates: Requirements 10.3**

- [ ] 4. Implement Session Manager
  - [~] 4.1 Create SessionManager class
    - Implement session creation with unique IDs (UUID v4)
    - Add session storage (in-memory with Redis/ElastiCache for production)
    - Implement session timeout logic (30 minutes)
    - Add conversation history management
    - _Requirements: 13.1, 13.2, 13.6_
  
  - [ ]* 4.2 Write property test for session unique IDs
    - **Property 40: Session Creation with Unique ID**
    - **Validates: Requirements 13.1**
  
  - [ ]* 4.3 Write property test for conversation context
    - **Property 41: Conversation Context Utilization**
    - **Validates: Requirements 13.3**
  
  - [ ]* 4.4 Write unit test for session timeout
    - Test that sessions expire after 30 minutes
    - Test session resumption within timeout
    - _Requirements: 13.2, 13.4_
  
  - [ ]* 4.5 Write property test for session termination
    - **Property 42: Session Termination**
    - **Validates: Requirements 13.5**

- [~] 5. Checkpoint - Core data layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Transcription Service (Amazon Transcribe wrapper)
  - [~] 6.1 Create TranscriptionService class
    - Wrap Amazon Transcribe StartStreamTranscription API
    - Implement language detection
    - Add confidence score calculation
    - Handle streaming audio input
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [~] 6.2 Add error handling for low audio quality
    - Detect low confidence scores (<0.7)
    - Return appropriate error responses
    - _Requirements: 1.4_
  
  - [ ]* 6.3 Write unit test for low quality audio handling
    - Test that low confidence triggers repeat request
    - _Requirements: 1.4_
  
  - [ ]* 6.4 Write property test for language preference storage
    - **Property 2: Language Preference Persistence**
    - **Validates: Requirements 1.3**

- [ ] 7. Implement Speech Service (Amazon Polly wrapper)
  - [~] 7.1 Create SpeechService class
    - Wrap Amazon Polly SynthesizeSpeech API
    - Implement voice selection based on language
    - Add streaming synthesis support
    - Cache frequently used phrases
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 7.2 Write property test for speech synthesis language matching
    - **Property 4: Speech Synthesis Language Matching**
    - **Validates: Requirements 2.1**
  
  - [ ]* 7.3 Write property test for number/date formatting
    - **Property 5: Localized Number and Date Formatting**
    - **Validates: Requirements 2.5**

- [ ] 8. Implement RAG System (Amazon Bedrock Knowledge Base integration)
  - [~] 8.1 Create RAGSystem class
    - Wrap Amazon Bedrock RetrieveAndGenerate API
    - Implement query method with filters
    - Add result ranking by relevance score
    - Include citation extraction
    - _Requirements: 5.1, 5.6_
  
  - [ ]* 8.2 Write property test for document retrieval
    - **Property 13: RAG Document Retrieval**
    - **Validates: Requirements 5.1**
  
  - [~] 8.3 Implement document management operations
    - Add ingestDocument, updateDocument, deleteDocument methods
    - Use S3 for document storage
    - Trigger Knowledge Base sync after changes
    - _Requirements: 12.1, 12.2, 12.4_
  
  - [ ]* 8.4 Write property test for document version currency
    - **Property 35: Document Version Currency**
    - **Validates: Requirements 12.2**
  
  - [ ]* 8.5 Write property test for removed document exclusion
    - **Property 37: Removed Document Exclusion**
    - **Validates: Requirements 12.4**
  
  - [ ]* 8.6 Write property test for batch document upload
    - **Property 38: Batch Document Upload**
    - **Validates: Requirements 12.5**

- [ ] 9. Implement Guardrails integration
  - [~] 9.1 Create Guardrails class
    - Wrap Amazon Bedrock Guardrails ApplyGuardrail API
    - Implement validation logic
    - Add factual accuracy checking against sources
    - Log all interventions
    - _Requirements: 11.1, 11.4, 11.5, 11.6_
  
  - [ ]* 9.2 Write property test for contradiction blocking
    - **Property 30: Contradiction Blocking**
    - **Validates: Requirements 11.1**
  
  - [ ]* 9.3 Write property test for unsupported claim blocking
    - **Property 15: Guardrail Blocking of Unsupported Claims**
    - **Validates: Requirements 5.4**
  
  - [ ]* 9.4 Write property test for guardrail intervention logging
    - **Property 34: Guardrail Intervention Logging**
    - **Validates: Requirements 11.5**

- [~] 10. Checkpoint - Service layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement AI Agent (Amazon Bedrock Agent integration)
  - [~] 11.1 Create AIAgent class
    - Wrap Amazon Bedrock Agent InvokeAgent API
    - Implement query processing with conversation context
    - Add confidence score tracking
    - Integrate with RAG System for retrieval
    - _Requirements: 4.2, 5.2, 11.2_
  
  - [ ]* 11.2 Write property test for response grounding
    - **Property 14: Response Grounding in Sources**
    - **Validates: Requirements 5.2, 5.3**
  
  - [ ]* 11.3 Write property test for uncertainty expression
    - **Property 31: Uncertainty Expression**
    - **Validates: Requirements 11.2**
  
  - [ ]* 11.4 Write property test for knowledge gap acknowledgment
    - **Property 16: Acknowledgment of Knowledge Gaps**
    - **Validates: Requirements 5.5**

- [ ] 12. Implement Scheme Matcher
  - [~] 12.1 Create SchemeMatcher class
    - Implement findEligibleSchemes method
    - Add eligibility criteria evaluation logic
    - Implement relevance scoring algorithm
    - Add explanation generation for matches
    - _Requirements: 4.1, 4.3, 4.4, 4.6_
  
  - [ ]* 12.2 Write property test for scheme eligibility matching
    - **Property 9: Scheme Eligibility Matching**
    - **Validates: Requirements 4.1**
  
  - [ ]* 12.3 Write property test for scheme ranking
    - **Property 10: Scheme Relevance Ranking**
    - **Validates: Requirements 4.3**
  
  - [ ]* 12.4 Write property test for eligibility explanations
    - **Property 11: Eligibility Explanation Provision**
    - **Validates: Requirements 4.4**
  
  - [ ]* 12.5 Write property test for alternative suggestions
    - **Property 12: Alternative Scheme Suggestions**
    - **Validates: Requirements 4.6**

- [ ] 13. Implement Document Assistant
  - [~] 13.1 Create DocumentAssistant class
    - Implement checklist generation from scheme data
    - Add language translation for document names
    - Implement priority organization (mandatory vs optional)
    - Add alternative document suggestion logic
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 13.2 Write property test for checklist generation
    - **Property 17: Document Checklist Generation**
    - **Validates: Requirements 6.1**
  
  - [ ]* 13.3 Write property test for checklist localization
    - **Property 18: Checklist Language Localization**
    - **Validates: Requirements 6.2**
  
  - [ ]* 13.4 Write property test for document alternatives
    - **Property 19: Document Alternative Explanation**
    - **Validates: Requirements 6.3**
  
  - [ ]* 13.5 Write property test for document priority organization
    - **Property 20: Document Priority Organization**
    - **Validates: Requirements 6.4**

- [ ] 14. Implement Application Guidance Generator
  - [~] 14.1 Create ApplicationGuidance class
    - Generate step-by-step instructions from scheme data
    - Add location-specific guidance based on user profile
    - Include URLs and addresses in steps
    - Format in conversational language
    - _Requirements: 7.1, 7.3, 7.5_
  
  - [ ]* 14.2 Write property test for guidance provision
    - **Property 22: Step-by-Step Guidance Provision**
    - **Validates: Requirements 7.1**
  
  - [ ]* 14.3 Write property test for location details
    - **Property 23: Location Detail Inclusion**
    - **Validates: Requirements 7.3**
  
  - [ ]* 14.4 Write property test for location-specific guidance
    - **Property 24: Location-Specific Guidance**
    - **Validates: Requirements 7.5**

- [~] 15. Checkpoint - Intelligence layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Implement error handling utilities
  - [~] 16.1 Create CircuitBreaker class
    - Implement state machine (closed, open, half-open)
    - Add failure threshold and timeout configuration
    - Track success/failure counts
    - _Requirements: 9.5_
  
  - [ ]* 16.2 Write property test for circuit breaker
    - **Property 25: Circuit Breaker Activation**
    - **Validates: Requirements 9.5**
  
  - [~] 16.3 Create RetryWithBackoff utility
    - Implement exponential backoff with jitter
    - Add configurable max attempts and delays
    - _Requirements: 9.6_
  
  - [~] 16.4 Create ErrorResponse builder
    - Implement structured error response format
    - Add localization support for error messages
    - Include retry guidance
    - _Requirements: 14.6_
  
  - [ ]* 16.5 Write property test for structured error responses
    - **Property 46: Structured Error Responses**
    - **Validates: Requirements 14.6**

- [ ] 17. Implement logging and monitoring
  - [~] 17.1 Create Logger class
    - Implement structured logging with JSON format
    - Add PII redaction before logging
    - Include request ID, user ID, session ID in all logs
    - Support multiple log levels (ERROR, WARN, INFO, DEBUG)
    - _Requirements: 15.1, 15.2, 10.3_
  
  - [ ]* 17.2 Write property test for request logging
    - **Property 47: Request Logging Completeness**
    - **Validates: Requirements 15.1**
  
  - [ ]* 17.3 Write property test for error logging
    - **Property 48: Error Logging with Context**
    - **Validates: Requirements 15.2**
  
  - [~] 17.4 Create MetricsEmitter class
    - Emit metrics to CloudWatch
    - Track latency, error rates, throughput
    - Add custom metrics for AI quality
    - _Requirements: 15.3, 15.4_
  
  - [ ]* 17.5 Write property test for metrics emission
    - **Property 49: Metrics Emission**
    - **Validates: Requirements 15.3**
  
  - [ ]* 17.6 Write property test for error rate alerts
    - **Property 50: Error Rate Alert Triggering**
    - **Validates: Requirements 15.4**

- [ ] 18. Implement caching layer
  - [~] 18.1 Create CacheManager class
    - Implement in-memory cache with TTL
    - Add cache key generation from queries
    - Implement cache invalidation logic
    - Track cache hit/miss rates
    - _Requirements: 16.3, 16.4_
  
  - [ ]* 18.2 Write property test for query caching
    - **Property 52: Query Response Caching**
    - **Validates: Requirements 16.3, 16.4**

- [ ] 19. Implement Lambda Orchestrator
  - [~] 19.1 Create Orchestrator class
    - Implement processVoiceQuery method
    - Coordinate calls to Transcribe, AI Agent, Polly
    - Add session management integration
    - Implement error handling and retries
    - Add latency tracking
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [~] 19.2 Implement profile management methods
    - Add createProfile, getProfile, updateProfile methods
    - Integrate with ProfileStore
    - _Requirements: 3.1, 3.4_
  
  - [ ]* 19.3 Write property test for new user profile collection
    - **Property 6: New User Profile Collection**
    - **Validates: Requirements 3.1**
  
  - [~] 19.4 Implement scheme matching orchestration
    - Add matchSchemes method
    - Integrate SchemeMatcher and AI Agent
    - _Requirements: 4.1, 4.3_
  
  - [~] 19.5 Implement checklist and guidance orchestration
    - Add generateChecklist and getApplicationGuidance methods
    - Integrate DocumentAssistant and ApplicationGuidance
    - _Requirements: 6.1, 7.1_

- [~] 20. Checkpoint - Orchestration layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Implement API Gateway handlers
  - [~] 21.1 Create API handler for voice query endpoint
    - Implement POST /v1/voice/query handler
    - Add request validation
    - Integrate with Orchestrator
    - Add authentication validation
    - _Requirements: 14.1, 14.2_
  
  - [ ]* 21.2 Write property test for API authentication
    - **Property 44: API Authentication Validation**
    - **Validates: Requirements 14.2**
  
  - [~] 21.3 Create API handlers for profile management
    - Implement POST /v1/profile and GET /v1/profile/{userId}
    - Add request validation
    - _Requirements: 3.1, 3.3_
  
  - [~] 21.4 Create API handler for scheme discovery
    - Implement GET /v1/schemes/eligible
    - Add query parameter validation
    - _Requirements: 4.1_
  
  - [~] 21.5 Create API handler for document checklist
    - Implement GET /v1/schemes/{schemeId}/checklist
    - Add path and query parameter validation
    - _Requirements: 6.1_
  
  - [~] 21.6 Implement rate limiting middleware
    - Add rate limiting per user/IP
    - Return HTTP 429 with Retry-After header
    - _Requirements: 14.4_
  
  - [ ]* 21.7 Write property test for rate limiting
    - **Property 45: Rate Limit Enforcement**
    - **Validates: Requirements 14.4**

- [ ] 22. Implement security and access control
  - [~] 22.1 Create authentication middleware
    - Implement JWT token validation
    - Add token expiration checking
    - _Requirements: 14.2_
  
  - [~] 22.2 Create authorization middleware
    - Implement role-based access control
    - Add permission checking for admin functions
    - _Requirements: 10.5_
  
  - [ ]* 22.3 Write property test for RBAC
    - **Property 28: Role-Based Access Control**
    - **Validates: Requirements 10.5**
  
  - [~] 22.4 Implement suspicious activity detection
    - Add pattern detection for rapid failures, unusual access
    - Trigger security alerts
    - _Requirements: 10.6_
  
  - [ ]* 22.5 Write property test for suspicious pattern alerts
    - **Property 29: Suspicious Pattern Alert Triggering**
    - **Validates: Requirements 10.6**

- [ ] 23. Implement language context management
  - [~] 23.1 Add language switching support
    - Track language changes within sessions
    - Update all subsequent responses to new language
    - _Requirements: 1.5_
  
  - [ ]* 23.2 Write property test for language adaptation
    - **Property 3: Language Context Adaptation**
    - **Validates: Requirements 1.5**
  
  - [~] 23.3 Implement verbal option numbering
    - Format multi-option responses with clear numbering
    - _Requirements: 18.2_
  
  - [ ]* 23.4 Write property test for option numbering
    - **Property 57: Verbal Option Numbering**
    - **Validates: Requirements 18.2**
  
  - [~] 23.5 Implement technical term explanations
    - Detect technical terms in responses
    - Add simple explanations inline
    - _Requirements: 18.4_
  
  - [ ]* 23.6 Write property test for term explanations
    - **Property 58: Technical Term Explanation**
    - **Validates: Requirements 18.4**

- [ ] 24. Implement offline and connectivity handling
  - [~] 24.1 Add unavailability notification
    - Detect system unavailability
    - Generate localized error messages
    - _Requirements: 17.2_
  
  - [ ]* 24.2 Write property test for unavailability notification
    - **Property 54: Unavailability Notification**
    - **Validates: Requirements 17.2**
  
  - [~] 24.3 Implement session resumption after reconnection
    - Detect reconnection within timeout
    - Restore session context
    - _Requirements: 17.4_
  
  - [ ]* 24.4 Write property test for session resumption
    - **Property 55: Session Resumption After Reconnection**
    - **Validates: Requirements 17.4**
  
  - [~] 24.5 Implement operation queueing for intermittent connectivity
    - Queue critical operations during connectivity issues
    - Retry when connectivity restored
    - _Requirements: 17.5_
  
  - [ ]* 24.6 Write property test for operation queueing
    - **Property 56: Critical Operation Queueing**
    - **Validates: Requirements 17.5**

- [~] 25. Checkpoint - API and integration layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 26. Implement AWS CDK infrastructure
  - [~] 26.1 Define API Gateway stack
    - Create REST API with CORS configuration
    - Add custom domain and SSL certificate
    - Configure request/response models
    - _Requirements: 14.1_
  
  - [~] 26.2 Define Lambda function stack
    - Create Lambda functions for all handlers
    - Configure memory, timeout, environment variables
    - Add IAM roles with least privilege
    - _Requirements: 9.1, 10.5_
  
  - [~] 26.3 Define DynamoDB table stack
    - Create UserProfiles table with encryption
    - Add GSIs for common query patterns
    - Enable point-in-time recovery
    - _Requirements: 3.2, 10.1_
  
  - [~] 26.4 Define S3 bucket stack
    - Create bucket for scheme documents
    - Enable versioning and encryption
    - Add lifecycle policies for cost optimization
    - _Requirements: 12.3, 16.5_
  
  - [~] 26.5 Define CloudWatch alarms and dashboards
    - Create alarms for error rates, latency
    - Build dashboard for system health
    - _Requirements: 15.4, 15.5_
  
  - [~] 26.6 Define IAM roles and policies
    - Create roles for Lambda functions
    - Add policies for Bedrock, Transcribe, Polly access
    - Implement least privilege principle
    - _Requirements: 10.5_

- [ ] 27. Implement cost tracking and reporting
  - [~] 27.1 Create CostReporter class
    - Query AWS Cost Explorer API
    - Generate cost breakdown by service
    - _Requirements: 16.6_
  
  - [ ]* 27.2 Write property test for cost reporting
    - **Property 53: Cost Reporting**
    - **Validates: Requirements 16.6**

- [ ] 28. Implement document version management
  - [~] 28.1 Add version history tracking
    - Store version metadata in DynamoDB
    - Track timestamps and change descriptions
    - _Requirements: 12.3_
  
  - [ ]* 28.2 Write property test for version history
    - **Property 36: Document Version History**
    - **Validates: Requirements 12.3**
  
  - [~] 28.3 Implement ingestion failure handling
    - Log detailed error information
    - Trigger administrator alerts
    - _Requirements: 12.6_
  
  - [ ]* 28.4 Write property test for ingestion failure logging
    - **Property 39: Ingestion Failure Logging**
    - **Validates: Requirements 12.6**

- [ ] 29. Implement eligibility criteria validation
  - [~] 29.1 Add source validation for eligibility criteria
    - Verify all criteria exist in source documents
    - _Requirements: 11.3_
  
  - [ ]* 29.2 Write property test for criteria source validation
    - **Property 32: Eligibility Criteria Source Validation**
    - **Validates: Requirements 11.3**
  
  - [~] 29.2 Add legal query redirection
    - Detect queries requiring legal interpretation
    - Include official channel information in responses
    - _Requirements: 11.4_
  
  - [ ]* 29.3 Write property test for legal query redirection
    - **Property 33: Legal Query Redirection**
    - **Validates: Requirements 11.4**

- [ ] 30. Implement performance tracing
  - [~] 30.1 Add X-Ray tracing integration
    - Instrument all Lambda functions
    - Add custom segments for key operations
    - _Requirements: 15.6_
  
  - [ ]* 30.2 Write property test for performance tracing
    - **Property 51: Performance Degradation Tracing**
    - **Validates: Requirements 15.6**

- [~] 31. Final checkpoint - Complete system integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 32. Integration testing
  - [ ]* 32.1 Write integration test for voice-to-voice flow
    - Test complete flow from audio input to audio output
    - Test in multiple languages
    - _Requirements: 1.1, 2.1, 8.1_
  
  - [ ]* 32.2 Write integration test for scheme matching
    - Test end-to-end scheme discovery
    - Verify RAG integration
    - _Requirements: 4.1, 5.1_
  
  - [ ]* 32.3 Write integration test for document checklist generation
    - Test complete checklist generation flow
    - Verify localization
    - _Requirements: 6.1, 6.2_
  
  - [ ]* 32.4 Write integration test for guardrails
    - Test with adversarial prompts
    - Verify blocking of misinformation
    - _Requirements: 11.1, 11.3_

- [ ]* 33. End-to-end testing
  - [ ]* 33.1 Create E2E test suite with real audio samples
    - Test in all 10 supported languages
    - Verify latency requirements
    - _Requirements: 1.1, 2.1, 8.1_
  
  - [ ]* 33.2 Test session management E2E
    - Test session creation, context, timeout, resumption
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ]* 33.3 Test error handling E2E
    - Simulate various failure scenarios
    - Verify graceful degradation
    - _Requirements: 9.4, 9.5, 9.6_

- [~] 34. Documentation and deployment preparation
  - Create API documentation (OpenAPI spec)
  - Write deployment guide
  - Create operational runbook
  - Document monitoring and alerting setup
  - _Requirements: 14.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- Integration and E2E tests verify complete system behavior
- The implementation follows a bottom-up approach: data models → services → orchestration → API
- All AWS service integrations use AWS SDK v3 for TypeScript
- Infrastructure is defined using AWS CDK for reproducibility
