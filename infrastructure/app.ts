#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BharatSetuStack } from './stacks/bharat-setu-stack';

const app = new cdk.App();

new BharatSetuStack(app, 'BharatSetuStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-south-1', // Mumbai region for data localization
  },
  description: 'Bharat-Setu: Voice-first multilingual AI agent for government scheme discovery',
});

app.synth();
