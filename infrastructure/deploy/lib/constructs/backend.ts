import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import {
  formatExportName,
  addStandardTags,
} from '../utils/cdk-helpers';

export interface BackendConstructProps {
  environment: string;
  clockTable: dynamodb.Table;
  jwtSecret: string;
}

export class BackendConstruct extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly apiFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: BackendConstructProps) {
    super(scope, id);

    const { environment, clockTable, jwtSecret } = props;

    const lambdaFunction = this.createLambdaFunction(environment, clockTable, jwtSecret);
    const api = this.createApiGateway(environment);
    this.setupIntegration(lambdaFunction, api);
    this.createOutputs(environment, api);
    this.applyTags(environment, lambdaFunction, api);

    this.apiFunction = lambdaFunction;
    this.api = api;
  }

  private createLambdaFunction(
    environment: string,
    clockTable: dynamodb.Table,
    jwtSecret: string,
  ): lambda.Function {
    const lambdaFunction = new NodejsFunction(this, 'ApiFunction', {
      functionName: `attendance-kit-${environment}-api`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../../../apps/backend/src/lambda.ts'),
      handler: 'index.handler',
      bundling: {
        externalModules: [
          '@nestjs/microservices',
          '@nestjs/microservices/microservices-module',
          '@nestjs/websockets/socket-module',
          'class-transformer/storage',
        ],
      },
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

  private setupIntegration(
    lambdaFunction: lambda.Function,
    api: apigateway.RestApi,
  ): void {
    const integration = new apigateway.LambdaIntegration(lambdaFunction, {
      proxy: true,
    });

    api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true,
    });
  }

  private createOutputs(
    environment: string,
    api: apigateway.RestApi,
  ): void {
    // 後続で必要なOutputのみ追加
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: `API Gateway URL (${environment})`,
      exportName: formatExportName(environment, 'ApiUrl'),
    });
  }

  private applyTags(
    environment: string,
    lambdaFunction: lambda.Function,
    api: apigateway.RestApi,
  ): void {
    addStandardTags(lambdaFunction, environment);
    addStandardTags(api, environment);
  }
}
