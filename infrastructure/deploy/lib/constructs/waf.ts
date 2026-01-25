import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import {
  formatExportName,
  addStandardTags,
} from '../utils/cdk-helpers';

export interface WafConstructProps {
  environment: string;
}

/**
 * CloudFront用のAWS WAF v2 Web ACL Construct
 *
 * 最低限の構成としてAWSマネージドルール (AWSManagedRulesCommonRuleSet) のみ使用
 * CloudFrontに関連付けるにはスコープが`CLOUDFRONT`である必要があり、
 * us-east-1リージョンで作成する必要がある
 */
export class WafConstruct extends Construct {
  public readonly webAcl: wafv2.CfnWebACL;

  constructor(scope: Construct, id: string, props: WafConstructProps) {
    super(scope, id);

    const { environment } = props;

    const webAcl = this.createWebAcl(environment);
    this.createOutputs(environment, webAcl);
    this.applyTags(environment, webAcl);

    this.webAcl = webAcl;
  }

  private createWebAcl(environment: string): wafv2.CfnWebACL {
    return new wafv2.CfnWebACL(this, 'WebAcl', {
      name: `attendance-kit-${environment}-waf`,
      defaultAction: { allow: {} },
      scope: 'CLOUDFRONT',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `attendance-kit-${environment}-waf`,
        sampledRequestsEnabled: true,
      },
      rules: this.createManagedRules(environment),
    });
  }

  private createManagedRules(environment: string): wafv2.CfnWebACL.RuleProperty[] {
    return [
      {
        // AWSマネージドルール: 一般的なWebアプリケーション攻撃を防御
        name: 'AWSManagedRulesCommonRuleSet',
        priority: 1,
        statement: {
          managedRuleGroupStatement: {
            vendorName: 'AWS',
            name: 'AWSManagedRulesCommonRuleSet',
          },
        },
        overrideAction: { none: {} },
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: `attendance-kit-${environment}-common-rules`,
          sampledRequestsEnabled: true,
        },
      },
    ];
  }

  private createOutputs(
    environment: string,
    webAcl: wafv2.CfnWebACL,
  ): void {
    new cdk.CfnOutput(this, 'WebAclArn', {
      value: webAcl.attrArn,
      description: `WAF Web ACL ARN (${environment})`,
      exportName: formatExportName(environment, 'WebAclArn'),
    });
  }

  private applyTags(
    environment: string,
    webAcl: wafv2.CfnWebACL,
  ): void {
    addStandardTags(webAcl, environment);
  }
}
