/**
 * ProfileStore: DynamoDB-backed storage for user profiles
 * 
 * Implements CRUD operations for user profiles with:
 * - AWS SDK v3 DynamoDB client
 * - Error handling for throttling and not found cases
 * - Encryption at rest (handled by DynamoDB configuration)
 * 
 * Requirements: 3.2, 3.3, 3.4
 */

import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  ConditionalCheckFailedException,
  ProvisionedThroughputExceededException,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { UserProfile, UserProfileSchema } from '../types';

/**
 * Configuration for ProfileStore
 */
export interface ProfileStoreConfig {
  tableName: string;
  region?: string;
  endpoint?: string; // For local testing with DynamoDB Local
}

/**
 * Error thrown when a profile is not found
 */
export class ProfileNotFoundError extends Error {
  constructor(userId: string) {
    super(`Profile not found for user: ${userId}`);
    this.name = 'ProfileNotFoundError';
  }
}

/**
 * Error thrown when DynamoDB is throttling requests
 */
export class ProfileStoreThrottlingError extends Error {
  constructor(message: string, public readonly retryAfterMs: number = 1000) {
    super(message);
    this.name = 'ProfileStoreThrottlingError';
  }
}

/**
 * Error thrown when profile validation fails
 */
export class ProfileValidationError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'ProfileValidationError';
  }
}

/**
 * ProfileStore class for managing user profiles in DynamoDB
 */
export class ProfileStore {
  private readonly client: DynamoDBClient;
  private readonly tableName: string;

  /**
   * Creates a new ProfileStore instance
   * 
   * @param config - Configuration for the ProfileStore
   */
  constructor(config: ProfileStoreConfig) {
    this.tableName = config.tableName;
    
    const clientConfig: any = {
      region: config.region || process.env.AWS_REGION || 'ap-south-1',
    };

    // Support for local DynamoDB testing
    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
    }

    this.client = new DynamoDBClient(clientConfig);
  }

  /**
   * Creates a new user profile
   * 
   * @param profile - The user profile to create
   * @returns The userId of the created profile
   * @throws ProfileValidationError if the profile data is invalid
   * @throws ProfileStoreThrottlingError if DynamoDB is throttling requests
   * @throws Error for other DynamoDB errors
   * 
   * @example
   * ```typescript
   * const profileStore = new ProfileStore({ tableName: 'UserProfiles' });
   * const userId = await profileStore.create({
   *   userId: 'user123',
   *   age: 35,
   *   occupation: 'farmer',
   *   income: 50000,
   *   location: 'Pune',
   *   state: 'Maharashtra',
   *   language: 'mr-IN',
   *   createdAt: new Date(),
   *   updatedAt: new Date(),
   *   metadata: {
   *     hasAadhaar: true,
   *     hasBankAccount: true,
   *     hasRationCard: false,
   *   },
   * });
   * ```
   */
  async create(profile: UserProfile): Promise<string> {
    // Validate profile data
    const validationResult = UserProfileSchema.safeParse(profile);
    if (!validationResult.success) {
      throw new ProfileValidationError(
        'Invalid profile data',
        validationResult.error.format()
      );
    }

    // Convert dates to ISO strings for DynamoDB storage
    const profileForStorage = {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };

    try {
      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(profileForStorage, {
          removeUndefinedValues: true,
          convertClassInstanceToMap: true,
        }),
        // Prevent overwriting existing profiles
        ConditionExpression: 'attribute_not_exists(userId)',
      });

      await this.client.send(command);
      return profile.userId;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new Error(`Profile already exists for user: ${profile.userId}`);
      }
      
      if (error instanceof ProvisionedThroughputExceededException) {
        throw new ProfileStoreThrottlingError(
          'DynamoDB throughput exceeded. Please retry after a delay.',
          1000
        );
      }

      throw error;
    }
  }

  /**
   * Retrieves a user profile by userId
   * 
   * @param userId - The unique identifier of the user
   * @returns The user profile, or null if not found
   * @throws ProfileStoreThrottlingError if DynamoDB is throttling requests
   * @throws Error for other DynamoDB errors
   * 
   * @example
   * ```typescript
   * const profile = await profileStore.get('user123');
   * if (profile) {
   *   console.log(`User ${profile.userId} is ${profile.age} years old`);
   * }
   * ```
   */
  async get(userId: string): Promise<UserProfile | null> {
    try {
      const command = new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({ userId }),
        ConsistentRead: true, // Ensure we get the latest data
      });

      const response = await this.client.send(command);

      if (!response.Item) {
        return null;
      }

      const item = unmarshall(response.Item);

      // Convert ISO strings back to Date objects
      const profile: UserProfile = {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      } as UserProfile;

      // Validate the retrieved profile
      const validationResult = UserProfileSchema.safeParse(profile);
      if (!validationResult.success) {
        throw new ProfileValidationError(
          `Retrieved profile data is invalid for user: ${userId}`,
          validationResult.error.format()
        );
      }

      return profile;
    } catch (error) {
      if (error instanceof ProvisionedThroughputExceededException) {
        throw new ProfileStoreThrottlingError(
          'DynamoDB throughput exceeded. Please retry after a delay.',
          1000
        );
      }

      if (error instanceof ProfileValidationError) {
        throw error;
      }

      throw error;
    }
  }

  /**
   * Updates an existing user profile
   * 
   * @param userId - The unique identifier of the user
   * @param updates - Partial profile data to update
   * @throws ProfileNotFoundError if the profile doesn't exist
   * @throws ProfileValidationError if the update data is invalid
   * @throws ProfileStoreThrottlingError if DynamoDB is throttling requests
   * @throws Error for other DynamoDB errors
   * 
   * @example
   * ```typescript
   * await profileStore.update('user123', {
   *   income: 60000,
   *   location: 'Mumbai',
   *   updatedAt: new Date(),
   * });
   * ```
   */
  async update(userId: string, updates: Partial<UserProfile>): Promise<void> {
    // Remove userId from updates (it's the key and can't be updated)
    const { userId: _, ...updateData } = updates;

    // If no updates provided, return early
    if (Object.keys(updateData).length === 0) {
      return;
    }

    // Ensure updatedAt is set
    const updatesWithTimestamp = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    let index = 0;
    for (const [key, value] of Object.entries(updatesWithTimestamp)) {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;
      
      updateExpressions.push(`${attrName} = ${attrValue}`);
      expressionAttributeNames[attrName] = key;
      
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        expressionAttributeValues[attrValue] = value.toISOString();
      } else {
        expressionAttributeValues[attrValue] = value;
      }
      
      index++;
    }

    if (updateExpressions.length === 0) {
      return; // No updates to perform
    }

    try {
      const command = new UpdateItemCommand({
        TableName: this.tableName,
        Key: marshall({ userId }),
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: marshall(expressionAttributeValues, {
          removeUndefinedValues: true,
        }),
        // Ensure the profile exists before updating
        ConditionExpression: 'attribute_exists(userId)',
      });

      await this.client.send(command);
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new ProfileNotFoundError(userId);
      }

      if (error instanceof ProvisionedThroughputExceededException) {
        throw new ProfileStoreThrottlingError(
          'DynamoDB throughput exceeded. Please retry after a delay.',
          1000
        );
      }

      throw error;
    }
  }

  /**
   * Deletes a user profile
   * 
   * @param userId - The unique identifier of the user
   * @throws ProfileStoreThrottlingError if DynamoDB is throttling requests
   * @throws Error for other DynamoDB errors
   * 
   * Note: This method does not throw an error if the profile doesn't exist.
   * This is intentional to make deletion idempotent.
   * 
   * @example
   * ```typescript
   * await profileStore.delete('user123');
   * ```
   */
  async delete(userId: string): Promise<void> {
    try {
      const command = new DeleteItemCommand({
        TableName: this.tableName,
        Key: marshall({ userId }),
      });

      await this.client.send(command);
    } catch (error) {
      if (error instanceof ProvisionedThroughputExceededException) {
        throw new ProfileStoreThrottlingError(
          'DynamoDB throughput exceeded. Please retry after a delay.',
          1000
        );
      }

      throw error;
    }
  }

  /**
   * Closes the DynamoDB client connection
   * 
   * Call this method when you're done using the ProfileStore
   * to clean up resources.
   */
  async close(): Promise<void> {
    this.client.destroy();
  }
}
