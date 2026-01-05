import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

export interface SiteConstructProps {
  environment: string;
}

export class SiteConstruct extends Construct {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: SiteConstructProps) {
    super(scope, id);

    const { environment } = props;

    // S3 Bucket for Site
    this.bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: `attendance-kit-${environment}-site`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // CloudFront Origin Access Identity
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: `OAI for attendance-kit ${environment} site`,
    });

    this.bucket.grantRead(oai);

    // CloudFront Distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket, {
          originAccessIdentity: oai,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      comment: `attendance-kit ${environment} support site`,
    });

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'Site S3 Bucket Name',
      exportName: `AttendanceKit-${environment}-SiteBucketName`,
    });

    new cdk.CfnOutput(this, 'Url', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'Support Site CloudFront URL',
      exportName: `AttendanceKit-${environment}-SiteUrl`,
    });
  }
}
