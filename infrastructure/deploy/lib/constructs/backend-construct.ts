import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface BackendConstructProps {
  environment: string;
  clockTable: dynamodb.ITable;
  frontendUrl: string;
}

export class BackendConstruct extends Construct {
  public readonly function: lambda.Function;
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: BackendConstructProps) {
    super(scope, id);

    const { environment, clockTable, frontendUrl } = props;

    // Lambda Function for Backend
    this.function = new lambda.Function(this, 'Function', {
      functionName: `attendance-kit-${environment}-backend`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('../apps/backend/dist'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        NODE_ENV: environment === 'prod' ? 'production' : 'development',
        DYNAMODB_TABLE_NAME: clockTable.tableName,
        CORS_ORIGIN: frontendUrl,
      },
      description: `Backend API for attendance-kit (${environment})`,
    });

    // Grant DynamoDB permissions to Lambda
    clockTable.grantReadWriteData(this.function);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: `attendance-kit-${environment}-api`,
      description: `Backend API for attendance-kit (${environment})`,
      deployOptions: {
        stageName: environment,
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: [frontendUrl],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Lambda Integration
    const integration = new apigateway.LambdaIntegration(this.function, {
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

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'Backend API URL',
      exportName: `AttendanceKit-${environment}-ApiUrl`,
    });
  }
}
