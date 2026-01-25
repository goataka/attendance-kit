import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WafConstruct } from '../lib/constructs/waf';

describe('WafConstruct', () => {
  let app: App;
  let stack: Stack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack');
    new WafConstruct(stack, 'TestWaf', {
      environment: 'dev',
    });
    template = Template.fromStack(stack);
  });

  test('WebACL has correct scope (CLOUDFRONT)', () => {
    template.hasResourceProperties('AWS::WAFv2::WebACL', {
      Scope: 'CLOUDFRONT',
    });
  });

  test('WebACL has correct name', () => {
    template.hasResourceProperties('AWS::WAFv2::WebACL', {
      Name: 'attendance-kit-dev-waf',
    });
  });

  test('WebACL has default allow action', () => {
    template.hasResourceProperties('AWS::WAFv2::WebACL', {
      DefaultAction: {
        Allow: {},
      },
    });
  });

  test('WebACL has AWSManagedRulesCommonRuleSet', () => {
    template.hasResourceProperties('AWS::WAFv2::WebACL', {
      Rules: [
        {
          Name: 'AWSManagedRulesCommonRuleSet',
          Priority: 1,
          Statement: {
            ManagedRuleGroupStatement: {
              VendorName: 'AWS',
              Name: 'AWSManagedRulesCommonRuleSet',
            },
          },
          OverrideAction: {
            None: {},
          },
        },
      ],
    });
  });

  test('WebACL has CloudWatch metrics enabled', () => {
    template.hasResourceProperties('AWS::WAFv2::WebACL', {
      VisibilityConfig: {
        CloudWatchMetricsEnabled: true,
        MetricName: 'attendance-kit-dev-waf',
        SampledRequestsEnabled: true,
      },
    });
  });

  test('Stack outputs include WebAclArn', () => {
    // Output名にはCDKが生成するハッシュが付与される
    const outputs = template.findOutputs('*');
    const outputKeys = Object.keys(outputs);
    const webAclArnOutput = outputKeys.find(key => key.startsWith('TestWafWebAclArn'));
    expect(webAclArnOutput).toBeDefined();
  });
});

describe('WafConstruct - Staging Environment', () => {
  let app: App;
  let stack: Stack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack');
    new WafConstruct(stack, 'TestWaf', {
      environment: 'staging',
    });
    template = Template.fromStack(stack);
  });

  test('Staging environment creates correct WAF name', () => {
    template.hasResourceProperties('AWS::WAFv2::WebACL', {
      Name: 'attendance-kit-staging-waf',
    });
  });
});
