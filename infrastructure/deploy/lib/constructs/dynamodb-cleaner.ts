import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Trigger } from 'aws-cdk-lib/triggers';
import * as path from 'path';

export interface DynamoDBCleanerProps {
  table: dynamodb.ITable;
}

export class DynamoDBCleaner extends Construct {
  public readonly trigger: Trigger;

  constructor(scope: Construct, id: string, props: DynamoDBCleanerProps) {
    super(scope, id);

    const { table } = props;

    const clearDataFunction = new NodejsFunction(this, 'ClearTableData', {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../lambda/clear-table-data.ts'),
      environment: {
        TABLE_NAME: table.tableName,
        DEPLOY_TIMESTAMP: new Date().toISOString(),
      },
      timeout: cdk.Duration.minutes(5),
    });

    table.grantReadWriteData(clearDataFunction);

    this.trigger = new Trigger(this, 'ClearTableTrigger', {
      handler: clearDataFunction,
      executeAfter: [table],
      executeOnHandlerChange: true,
    });
  }
}
