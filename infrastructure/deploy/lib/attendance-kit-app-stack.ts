import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export interface AttendanceKitAppStackProps extends cdk.StackProps {
  environment: string; // 'dev' | 'staging' | 'prod'
  clockTableName: string;
}

export class AttendanceKitAppStack extends cdk.Stack {
  public readonly frontendBucket: s3.Bucket;
  public readonly siteBucket: s3.Bucket;
  public readonly frontendDistribution: cloudfront.Distribution;
  public readonly siteDistribution: cloudfront.Distribution;
  public readonly api: apigateway.RestApi;
  public readonly backendFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: AttendanceKitAppStackProps) {
    super(scope, id, props);

    const { environment, clockTableName } = props;

    // Get reference to existing DynamoDB table
    const clockTable = dynamodb.Table.fromTableName(
      this,
      'ClockTable',
      clockTableName
    );

    // ========================================
    // Frontend (React App)
    // ========================================

    // S3 Bucket for Frontend
    this.frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `attendance-kit-${environment}-frontend`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // CloudFront Origin Access Identity for Frontend
    const frontendOai = new cloudfront.OriginAccessIdentity(this, 'FrontendOAI', {
      comment: `OAI for attendance-kit ${environment} frontend`,
    });

    this.frontendBucket.grantRead(frontendOai);

    // CloudFront Distribution for Frontend
    this.frontendDistribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(this.frontendBucket, {
          originAccessIdentity: frontendOai,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      comment: `attendance-kit ${environment} frontend`,
    });

    // ========================================
    // Support Site (Astro + Starlight)
    // ========================================

    // S3 Bucket for Site
    this.siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: `attendance-kit-${environment}-site`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // CloudFront Origin Access Identity for Site
    const siteOai = new cloudfront.OriginAccessIdentity(this, 'SiteOAI', {
      comment: `OAI for attendance-kit ${environment} site`,
    });

    this.siteBucket.grantRead(siteOai);

    // CloudFront Distribution for Site
    this.siteDistribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(this.siteBucket, {
          originAccessIdentity: siteOai,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      comment: `attendance-kit ${environment} support site`,
    });

    // ========================================
    // Backend (NestJS on Lambda)
    // ========================================

    // Lambda Function for Backend
    this.backendFunction = new lambda.Function(this, 'BackendFunction', {
      functionName: `attendance-kit-${environment}-backend`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('../apps/backend/dist'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        NODE_ENV: environment === 'prod' ? 'production' : 'development',
        DYNAMODB_TABLE_NAME: clockTable.tableName,
        CORS_ORIGIN: `https://${this.frontendDistribution.distributionDomainName}`,
      },
      description: `Backend API for attendance-kit (${environment})`,
    });

    // Grant DynamoDB permissions to Lambda
    clockTable.grantReadWriteData(this.backendFunction);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'BackendApi', {
      restApiName: `attendance-kit-${environment}-api`,
      description: `Backend API for attendance-kit (${environment})`,
      deployOptions: {
        stageName: environment,
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: [`https://${this.frontendDistribution.distributionDomainName}`],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Lambda Integration
    const integration = new apigateway.LambdaIntegration(this.backendFunction, {
      proxy: true,
    });

    // API Routes
    const apiResource = this.api.root.addResource('api');
    const clockInResource = apiResource.addResource('clock-in');
    const clockOutResource = apiResource.addResource('clock-out');
    const recordsResource = apiResource.addResource('records');

    clockInResource.addMethod('POST', integration);
    clockOutResource.addMethod('POST', integration);
    recordsResource.addMethod('GET', integration);

    // ========================================
    // CloudFormation Outputs
    // ========================================

    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: `https://${this.frontendDistribution.distributionDomainName}`,
      description: 'Frontend CloudFront URL',
      exportName: `AttendanceKit-${environment}-FrontendUrl`,
    });

    new cdk.CfnOutput(this, 'SiteUrl', {
      value: `https://${this.siteDistribution.distributionDomainName}`,
      description: 'Support Site CloudFront URL',
      exportName: `AttendanceKit-${environment}-SiteUrl`,
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'Backend API URL',
      exportName: `AttendanceKit-${environment}-ApiUrl`,
    });

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: this.frontendBucket.bucketName,
      description: 'Frontend S3 Bucket Name',
      exportName: `AttendanceKit-${environment}-FrontendBucketName`,
    });

    new cdk.CfnOutput(this, 'SiteBucketName', {
      value: this.siteBucket.bucketName,
      description: 'Site S3 Bucket Name',
      exportName: `AttendanceKit-${environment}-SiteBucketName`,
    });

    // Tags
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('Project', 'attendance-kit');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
    cdk.Tags.of(this).add('Component', 'Application');
  }
}
