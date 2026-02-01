export const getTestConfig = () => {
  const isLocalStack = process.env.USE_LOCALSTACK === 'true';

  return {
    dynamodb: {
      endpoint: isLocalStack ? 'http://localhost:4566' : undefined,
      region: process.env.AWS_REGION || 'ap-northeast-1',
      credentials: isLocalStack
        ? {
            accessKeyId: 'test',
            secretAccessKey: 'test',
          }
        : undefined,
    },
    tableName: process.env.DYNAMODB_TABLE_NAME || 'attendance-kit-test-clock',
  };
};
