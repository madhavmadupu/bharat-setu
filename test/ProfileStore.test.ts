/**
 * Unit tests for ProfileStore
 */

import {
  ProfileStore,
  ProfileNotFoundError,
  ProfileStoreThrottlingError,
  ProfileValidationError,
} from '../src/data/ProfileStore';
import { UserProfile } from '../src/types';
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  ConditionalCheckFailedException,
  ProvisionedThroughputExceededException,
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

// Mock AWS SDK
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/util-dynamodb');

describe('ProfileStore', () => {
  let profileStore: ProfileStore;
  let mockClient: jest.Mocked<DynamoDBClient>;
  let mockSend: jest.Mock;

  const validProfile: UserProfile = {
    userId: 'user123',
    age: 35,
    occupation: 'farmer',
    income: 50000,
    location: 'Pune',
    state: 'Maharashtra',
    language: 'mr-IN',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    metadata: {
      hasAadhaar: true,
      hasBankAccount: true,
      hasRationCard: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSend = jest.fn();
    mockClient = {
      send: mockSend,
      destroy: jest.fn(),
    } as any;

    (DynamoDBClient as jest.MockedClass<typeof DynamoDBClient>).mockImplementation(
      () => mockClient
    );

    (marshall as jest.Mock).mockImplementation((obj) => obj);

    profileStore = new ProfileStore({
      tableName: 'TestUserProfiles',
      region: 'ap-south-1',
    });
  });

  afterEach(async () => {
    await profileStore.close();
  });

  describe('create', () => {
    it('should create a new profile successfully', async () => {
      mockSend.mockResolvedValueOnce({});

      const userId = await profileStore.create(validProfile);

      expect(userId).toBe('user123');
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(expect.any(PutItemCommand));
    });

    it('should throw ProfileValidationError for invalid profile data', async () => {
      const invalidProfile = {
        ...validProfile,
        age: -5, // Invalid age
      };

      await expect(profileStore.create(invalidProfile as UserProfile)).rejects.toThrow(
        ProfileValidationError
      );
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should throw error when profile already exists', async () => {
      mockSend.mockRejectedValueOnce(new ConditionalCheckFailedException({
        message: 'Conditional check failed',
        $metadata: {},
      }));

      await expect(profileStore.create(validProfile)).rejects.toThrow(
        'Profile already exists for user: user123'
      );
    });

    it('should throw ProfileStoreThrottlingError on throughput exceeded', async () => {
      mockSend.mockRejectedValueOnce(new ProvisionedThroughputExceededException({
        message: 'Throughput exceeded',
        $metadata: {},
      }));

      await expect(profileStore.create(validProfile)).rejects.toThrow(
        ProfileStoreThrottlingError
      );
    });
  });

  describe('get', () => {
    it('should retrieve an existing profile', async () => {
      const mockItem = {
        userId: 'user123',
        age: 35,
        occupation: 'farmer',
        income: 50000,
        location: 'Pune',
        state: 'Maharashtra',
        language: 'mr-IN',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        metadata: {
          hasAadhaar: true,
          hasBankAccount: true,
          hasRationCard: false,
        },
      };

      mockSend.mockResolvedValueOnce({
        Item: mockItem,
      });

      // Mock unmarshall
      const { unmarshall } = require('@aws-sdk/util-dynamodb');
      (unmarshall as jest.Mock).mockReturnValueOnce(mockItem);

      const profile = await profileStore.get('user123');

      expect(profile).not.toBeNull();
      expect(profile?.userId).toBe('user123');
      expect(profile?.age).toBe(35);
      expect(profile?.createdAt).toBeInstanceOf(Date);
      expect(mockSend).toHaveBeenCalledWith(expect.any(GetItemCommand));
    });

    it('should return null for non-existent profile', async () => {
      mockSend.mockResolvedValueOnce({
        Item: undefined,
      });

      const profile = await profileStore.get('nonexistent');

      expect(profile).toBeNull();
    });

    it('should throw ProfileStoreThrottlingError on throughput exceeded', async () => {
      mockSend.mockRejectedValueOnce(new ProvisionedThroughputExceededException({
        message: 'Throughput exceeded',
        $metadata: {},
      }));

      await expect(profileStore.get('user123')).rejects.toThrow(
        ProfileStoreThrottlingError
      );
    });
  });

  describe('update', () => {
    it('should update an existing profile', async () => {
      mockSend.mockResolvedValueOnce({});

      await profileStore.update('user123', {
        income: 60000,
        location: 'Mumbai',
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(expect.any(UpdateItemCommand));
    });

    it('should throw ProfileNotFoundError when profile does not exist', async () => {
      mockSend.mockRejectedValueOnce(new ConditionalCheckFailedException({
        message: 'Conditional check failed',
        $metadata: {},
      }));

      await expect(
        profileStore.update('nonexistent', { income: 60000 })
      ).rejects.toThrow(ProfileNotFoundError);
    });

    it('should throw ProfileStoreThrottlingError on throughput exceeded', async () => {
      mockSend.mockRejectedValueOnce(new ProvisionedThroughputExceededException({
        message: 'Throughput exceeded',
        $metadata: {},
      }));

      await expect(
        profileStore.update('user123', { income: 60000 })
      ).rejects.toThrow(ProfileStoreThrottlingError);
    });

    it('should not perform update when no updates provided', async () => {
      await profileStore.update('user123', {});

      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should automatically set updatedAt timestamp', async () => {
      mockSend.mockResolvedValueOnce({});

      await profileStore.update('user123', { income: 60000 });

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.input.ExpressionAttributeValues).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete a profile', async () => {
      mockSend.mockResolvedValueOnce({});

      await profileStore.delete('user123');

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteItemCommand));
    });

    it('should be idempotent (not throw error if profile does not exist)', async () => {
      mockSend.mockResolvedValueOnce({});

      await expect(profileStore.delete('nonexistent')).resolves.not.toThrow();
    });

    it('should throw ProfileStoreThrottlingError on throughput exceeded', async () => {
      mockSend.mockRejectedValueOnce(new ProvisionedThroughputExceededException({
        message: 'Throughput exceeded',
        $metadata: {},
      }));

      await expect(profileStore.delete('user123')).rejects.toThrow(
        ProfileStoreThrottlingError
      );
    });
  });

  describe('edge cases', () => {
    it('should handle profiles with minimum age', async () => {
      const youngProfile = {
        ...validProfile,
        age: 18,
      };

      mockSend.mockResolvedValueOnce({});

      await expect(profileStore.create(youngProfile)).resolves.toBe('user123');
    });

    it('should handle profiles with maximum age', async () => {
      const oldProfile = {
        ...validProfile,
        age: 120,
      };

      mockSend.mockResolvedValueOnce({});

      await expect(profileStore.create(oldProfile)).resolves.toBe('user123');
    });

    it('should handle profiles with zero income', async () => {
      const zeroIncomeProfile = {
        ...validProfile,
        income: 0,
      };

      mockSend.mockResolvedValueOnce({});

      await expect(profileStore.create(zeroIncomeProfile)).resolves.toBe('user123');
    });

    it('should reject profiles with age below minimum', async () => {
      const underageProfile = {
        ...validProfile,
        age: 17,
      };

      await expect(profileStore.create(underageProfile as UserProfile)).rejects.toThrow(
        ProfileValidationError
      );
    });

    it('should reject profiles with negative income', async () => {
      const negativeIncomeProfile = {
        ...validProfile,
        income: -1000,
      };

      await expect(
        profileStore.create(negativeIncomeProfile as UserProfile)
      ).rejects.toThrow(ProfileValidationError);
    });
  });
});
