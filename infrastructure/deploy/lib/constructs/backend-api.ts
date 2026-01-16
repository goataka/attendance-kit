import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import {
  formatExportName,
  addStandardTags,
} from '../utils/cdk-helpers';

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

    this.apiFunction = this.createLambdaFunction(environment, clockTable, jwtSecret);
    this.api = this.createApiGateway(environment);
    this.setupIntegration();
    this.createOutputs(environment);
    this.applyTags(environment);
  }

  private createLambdaFunction(
    environment: string,
    clockTable: dynamodb.Table,
    jwtSecret: string,
  ): lambda.Function {
    const lambdaFunction = new lambda.Function(this, 'ApiFunction', {
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
        DYNAMODB_TABLE_NAME: clockTable.tableName,
        JWT_SECRET: jwtSecret,
      },
      description: `Attendance Kit Backend API (${environment})`,
    });

    clockTable.grantReadWriteData(lambdaFunction);
    return lambdaFunction;
  }

  private createApiGateway(environment: string): apigateway.RestApi {
    return new apigateway.RestApi(this, 'Api', {
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
  }

  private setupIntegration(): void {
    const integration = new apigateway.LambdaIntegration(this.apiFunction, {
      proxy: true,
    });

    this.api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true,
    });
  }

  private createOutputs(environment: string): void {
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: `API Gateway URL (${environment})`,
      exportName: formatExportName(environment, 'ApiUrl'),
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: `API Gateway ID (${environment})`,
      exportName: formatExportName(environment, 'ApiId'),
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: this.apiFunction.functionName,
      description: `Lambda function name (${environment})`,
      exportName: formatExportName(environment, 'LambdaFunctionName'),
    });

    new cdk.CfnOutput(this, 'LambdaFunctionArn', {
      value: this.apiFunction.functionArn,
      description: `Lambda function ARN (${environment})`,
      exportName: formatExportName(environment, 'LambdaFunctionArn'),
    });
  }

  private applyTags(environment: string): void {
    addStandardTags(this.apiFunction, environment);
    addStandardTags(this.api, environment);
  }
}
