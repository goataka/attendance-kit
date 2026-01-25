import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import {
  formatExportName,
  addStandardTags,
} from '../utils/cdk-helpers';

export interface FrontendConstructProps {
  environment: string;
  api: apigateway.RestApi;
}

export class FrontendConstruct extends Construct {
  public readonly distribution: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: FrontendConstructProps) {
    super(scope, id);

    const { environment, api } = props;

    const bucket = this.createS3Bucket(environment);
    const oai = this.createOriginAccessIdentity(environment);
    this.grantBucketReadToOAI(bucket, oai);
    const distribution = this.createCloudFrontDistribution(environment, bucket, oai, api);
    this.deployFrontendAssets(environment, bucket, distribution);
    this.createOutputs(environment, distribution);
    this.applyTags(environment, bucket, distribution);

    this.bucket = bucket;
    this.distribution = distribution;
  }

  private createS3Bucket(environment: string): s3.Bucket {
    return new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `attendance-kit-${environment}-frontend`,
      versioned: false,
      // PublicReadAccessはOAI経由のみ許可
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }

  private createOriginAccessIdentity(environment: string): cloudfront.OriginAccessIdentity {
    return new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: `OAI for attendance-kit ${environment} frontend`,
    });
  }

  private grantBucketReadToOAI(
    bucket: s3.Bucket,
    oai: cloudfront.OriginAccessIdentity
  ): void {
    bucket.grantRead(oai);
  }

  private createCloudFrontDistribution(
    environment: string,
    bucket: s3.Bucket,
    oai: cloudfront.OriginAccessIdentity,
    api: apigateway.RestApi
  ): cloudfront.Distribution {
    return new cloudfront.Distribution(this, 'Distribution', {
      comment: `Attendance Kit Frontend Distribution (${environment})`,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessIdentity(bucket, {
          originAccessIdentity: oai,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.RestApiOrigin(api),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
    });
  }

  private deployFrontendAssets(
    environment: string,
    bucket: s3.Bucket,
    distribution: cloudfront.Distribution
  ): void {
    new s3deploy.BucketDeployment(this, 'DeployFrontend', {
      sources: [
        s3deploy.Source.asset(
          path.join(__dirname, '../../../../apps/frontend/dist')
        ),
      ],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });
  }

  private createOutputs(
    environment: string,
    distribution: cloudfront.Distribution
  ): void {
    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: `CloudFront distribution URL (${environment})`,
      exportName: formatExportName(environment, 'CloudFrontUrl'),
    });
  }

  private applyTags(
    environment: string,
    bucket: s3.Bucket,
    distribution: cloudfront.Distribution
  ): void {
    addStandardTags(bucket, environment);
    addStandardTags(distribution, environment);
  }
}
