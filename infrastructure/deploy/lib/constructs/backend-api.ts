import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

export interface BackendApiConstructProps {
  environment: string;
  clockTable: dynamodb.Table;
  jwtSecret: string;
}

export class BackendApiConstruct extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly apiFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: BackendApiConstructProps) {
    super(scope, id);

    const { environment, clockTable, jwtSecret } = props;

    // Lambda function for the NestJS backend
    this.apiFunction = new lambda.Function(this, 'ApiFunction', {
      functionName: `attendance-kit-${environment}-api`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../apps/backend/dist'),
      ),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        NODE_ENV: environment,
        AWS_REGION: cdk.Stack.of(this).region,
        DYNAMODB_TABLE_NAME: clockTable.tableName,
        JWT_SECRET: jwtSecret,
      },
      description: `Attendance Kit Backend API (${environment})`,
    });

    // Grant DynamoDB permissions to Lambda
    clockTable.grantReadWriteData(this.apiFunction);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: `attendance-kit-${environment}-api`,
      description: `Attendance Kit REST API (${environment})`,
      deployOptions: {
        stageName: environment,
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    // Lambda integration
    const integration = new apigateway.LambdaIntegration(this.apiFunction, {
      proxy: true,
    });

    // Add API proxy resource
    this.api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true,
    });

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: `API Gateway URL (${environment})`,
      exportName: `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}-ApiUrl`,
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: `API Gateway ID (${environment})`,
      exportName: `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}-ApiId`,
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: this.apiFunction.functionName,
      description: `Lambda function name (${environment})`,
      exportName: `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}-LambdaFunctionName`,
    });

    new cdk.CfnOutput(this, 'LambdaFunctionArn', {
      value: this.apiFunction.functionArn,
      description: `Lambda function ARN (${environment})`,
      exportName: `AttendanceKit-${environment.charAt(0).toUpperCase() + environment.slice(1)}-LambdaFunctionArn`,
    });

    // Tags
    cdk.Tags.of(this.apiFunction).add('Environment', environment);
    cdk.Tags.of(this.apiFunction).add('Project', 'attendance-kit');
    cdk.Tags.of(this.apiFunction).add('ManagedBy', 'CDK');
    cdk.Tags.of(this.api).add('Environment', environment);
    cdk.Tags.of(this.api).add('Project', 'attendance-kit');
    cdk.Tags.of(this.api).add('ManagedBy', 'CDK');
  }
}
