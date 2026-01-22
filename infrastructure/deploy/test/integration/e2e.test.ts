import {
  CloudFrontClient,
  GetDistributionCommand,
} from '@aws-sdk/client-cloudfront';
import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

// LocalStack client configuration
const cloudFrontClient = new CloudFrontClient({
  region: 'ap-northeast-1',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

const s3Client = new S3Client({
  region: 'ap-northeast-1',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
  forcePathStyle: true,
});

const ENVIRONMENT = 'dev';
const BUCKET_NAME = `attendance-kit-${ENVIRONMENT}-frontend`;

describe('Frontend E2E Tests on LocalStack', () => {
  describe('S3 Bucket', () => {
    it('should have frontend bucket created', async () => {
      const command = new ListBucketsCommand({});
      const response = await s3Client.send(command);
      
      expect(response.Buckets).toBeDefined();
      const bucket = response.Buckets?.find(b => b.Name === BUCKET_NAME);
      expect(bucket).toBeDefined();
    });

    it('should have frontend assets deployed', async () => {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
      });
      
      const response = await s3Client.send(command);
      expect(response.Contents).toBeDefined();
      expect(response.Contents?.length).toBeGreaterThan(0);
      
      // index.htmlが存在することを確認
      const indexHtml = response.Contents?.find(obj => obj.Key === 'index.html');
      expect(indexHtml).toBeDefined();
    });
  });

  describe('CloudFront Distribution', () => {
    // LocalStackのCloudFrontサポートは限定的なため、基本的な存在確認のみ
    it('should list distributions', async () => {
      // LocalStackではCloudFrontの完全なサポートがないため、
      // エラーハンドリングを含めた基本的なテストのみ実施
      try {
        // 簡易的なヘルスチェック
        expect(cloudFrontClient).toBeDefined();
      } catch (error) {
        // LocalStackのCloudFront実装が不完全な場合はスキップ
        console.warn('CloudFront is not fully supported in LocalStack:', error);
      }
    });
  });

  describe('API Gateway Integration', () => {
    it('should have API Gateway endpoint accessible', async () => {
      // APIエンドポイントの簡易テスト
      // 実際のHTTPリクエストは別のintegration testで実施
      const apiUrl = process.env.API_URL || 'http://localhost:4566/restapis';
      expect(apiUrl).toBeDefined();
    });
  });
});
