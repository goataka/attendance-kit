import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// Constants
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
export const TABLE_NAME =
  process.env.DYNAMODB_TABLE_NAME || 'attendance-kit-test-clock';
export const IS_LOCAL = process.env.E2E_ENV !== 'deployed';

// DynamoDB client configuration (LocalStackまたはAWS)
const dynamoConfig = IS_LOCAL
  ? {
      region: 'ap-northeast-1',
      endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:4566',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    }
  : {
      region: process.env.AWS_REGION || 'ap-northeast-1',
    };

export const dynamoClient = new DynamoDBClient(dynamoConfig);
