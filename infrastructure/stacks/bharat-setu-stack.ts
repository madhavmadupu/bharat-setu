import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';

export class BharatSetuStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table for User Profiles
    const profileTable = new dynamodb.Table(this, 'UserProfilesTable', {
      tableName: 'bharat-setu-user-profiles',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // S3 Bucket for Government Scheme Documents
    const documentBucket = new s3.Bucket(this, 'SchemeDocumentsBucket', {
      bucketName: `bharat-setu-documents-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          transitions: [
            {
              storageClass: s3.StorageClass.INTELLIGENT_TIERING,
              transitionAfter: cdk.Duration.days(30),
            },
          ],
        },
      ],
    });

    // IAM Role for Lambda Functions
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant permissions for AWS services
    profileTable.grantReadWriteData(lambdaRole);
    documentBucket.grantReadWrite(lambdaRole);

    // Add permissions for Amazon Bedrock
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeAgent',
        'bedrock:Retrieve',
        'bedrock:RetrieveAndGenerate',
        'bedrock:ApplyGuardrail',
      ],
      resources: ['*'],
    }));

    // Add permissions for Amazon Transcribe
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'transcribe:StartStreamTranscription',
        'transcribe:StartTranscriptionJob',
      ],
      resources: ['*'],
    }));

    // Add permissions for Amazon Polly
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'polly:SynthesizeSpeech',
      ],
      resources: ['*'],
    }));

    // Lambda Function - Orchestrator (placeholder)
    const orchestratorFunction = new lambda.Function(this, 'OrchestratorFunction', {
      functionName: 'bharat-setu-orchestrator',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Bharat-Setu API - Coming Soon' })
          };
        };
      `),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      environment: {
        PROFILE_TABLE_NAME: profileTable.tableName,
        DOCUMENT_BUCKET_NAME: documentBucket.bucketName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'BharatSetuAPI', {
      restApiName: 'Bharat-Setu API',
      description: 'Voice-first multilingual AI agent API',
      deployOptions: {
        stageName: 'v1',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // API Gateway Integration
    const lambdaIntegration = new apigateway.LambdaIntegration(orchestratorFunction);

    // Voice Query Endpoint
    const voiceResource = api.root.addResource('voice');
    const queryResource = voiceResource.addResource('query');
    queryResource.addMethod('POST', lambdaIntegration);

    // Profile Management Endpoints
    const profileResource = api.root.addResource('profile');
    profileResource.addMethod('POST', lambdaIntegration); // Create profile
    profileResource.addMethod('GET', lambdaIntegration);  // Get profile

    const profileByIdResource = profileResource.addResource('{userId}');
    profileByIdResource.addMethod('GET', lambdaIntegration); // Get specific profile

    // Scheme Discovery Endpoints
    const schemesResource = api.root.addResource('schemes');
    const eligibleResource = schemesResource.addResource('eligible');
    eligibleResource.addMethod('GET', lambdaIntegration);

    const schemeByIdResource = schemesResource.addResource('{schemeId}');
    const checklistResource = schemeByIdResource.addResource('checklist');
    checklistResource.addMethod('GET', lambdaIntegration);

    // CloudWatch Alarms
    orchestratorFunction.metricErrors({
      period: cdk.Duration.minutes(5),
    }).createAlarm(this, 'OrchestratorErrorAlarm', {
      threshold: 5,
      evaluationPeriods: 2,
      alarmDescription: 'Alert when orchestrator function error rate is high',
    });

    orchestratorFunction.metricThrottles({
      period: cdk.Duration.minutes(5),
    }).createAlarm(this, 'OrchestratorThrottleAlarm', {
      threshold: 10,
      evaluationPeriods: 2,
      alarmDescription: 'Alert when orchestrator function is being throttled',
    });

    // Stack Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
    });

    new cdk.CfnOutput(this, 'ProfileTableName', {
      value: profileTable.tableName,
      description: 'DynamoDB table name for user profiles',
    });

    new cdk.CfnOutput(this, 'DocumentBucketName', {
      value: documentBucket.bucketName,
      description: 'S3 bucket name for scheme documents',
    });
  }
}
