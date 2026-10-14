import type { ModelDetail, TrafficRoute, InferenceLog, MetricsSummary } from '../types';

export const initialMockModels: ModelDetail[] = [
  {
    id: 1,
    name: 'churn-predictor',
    description: 'Customer attrition risk scoring engine based on account tenure, contract terms, and billing dynamics.',
    framework: 'ONNX v1.18',
    activeVersion: 'v1.0.0',
    status: 'READY',
    createdAt: '2026-10-10T12:00:00Z',
    updatedAt: '2026-10-14T11:45:00Z',
    versions: [
      {
        id: 101,
        version: 'v1.0.0',
        status: 'ACTIVE',
        artifactPath: '/artifacts/churn_v1.onnx',
        inputShape: '[-1, 4]',
        outputShape: '[-1, 1]',
        fileSizeBytes: 1450000,
        createdAt: '2026-10-10T12:00:00Z',
        inputSchema: JSON.stringify({
          type: 'object',
          properties: {
            tenure: { type: 'number', description: 'Months as customer' },
            monthly_charges: { type: 'number', description: 'Monthly billing amount in USD' },
            total_charges: { type: 'number', description: 'Lifetime charges' },
            contract_type: { type: 'string', enum: ['month-to-month', 'one-year', 'two-year'] }
          },
          required: ['tenure', 'monthly_charges']
        }, null, 2),
        outputSchema: JSON.stringify({
          type: 'object',
          properties: {
            churn_probability: { type: 'number', minimum: 0, maximum: 1 },
            churn_risk: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] }
          }
        }, null, 2)
      },
      {
        id: 102,
        version: 'v2.0.0',
        status: 'ACTIVE',
        artifactPath: '/artifacts/churn_v2_boost.onnx',
        inputShape: '[-1, 4]',
        outputShape: '[-1, 1]',
        fileSizeBytes: 2100000,
        createdAt: '2026-10-13T14:30:00Z',
        inputSchema: JSON.stringify({
          type: 'object',
          properties: {
            tenure: { type: 'number', description: 'Months as customer' },
            monthly_charges: { type: 'number', description: 'Monthly billing amount in USD' },
            total_charges: { type: 'number', description: 'Lifetime charges' },
            contract_type: { type: 'string', enum: ['month-to-month', 'one-year', 'two-year'] }
          },
          required: ['tenure', 'monthly_charges']
        }, null, 2),
        outputSchema: JSON.stringify({
          type: 'object',
          properties: {
            churn_probability: { type: 'number', minimum: 0, maximum: 1 },
            churn_risk: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] }
          }
        }, null, 2)
      }
    ]
  },
  {
    id: 2,
    name: 'sentiment-analyzer',
    description: 'Real-time NLP sentiment polarity scoring and emotion categorization for user feedback streams.',
    framework: 'ONNX v1.18',
    activeVersion: 'v1.0.0',
    status: 'READY',
    createdAt: '2026-10-11T09:15:00Z',
    updatedAt: '2026-10-14T08:20:00Z',
    versions: [
      {
        id: 201,
        version: 'v1.0.0',
        status: 'ACTIVE',
        artifactPath: '/artifacts/sentiment_v1_fasttext.onnx',
        inputShape: '[-1, 128]',
        outputShape: '[-1, 3]',
        fileSizeBytes: 38000000,
        createdAt: '2026-10-11T09:15:00Z',
        inputSchema: JSON.stringify({
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Input customer feedback text' },
            language: { type: 'string', default: 'en' }
          },
          required: ['text']
        }, null, 2),
        outputSchema: JSON.stringify({
          type: 'object',
          properties: {
            sentiment: { type: 'string', enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'] },
            confidence: { type: 'number' }
          }
        }, null, 2)
      },
      {
        id: 202,
        version: 'v1.1.0',
        status: 'CANARY',
        artifactPath: '/artifacts/sentiment_v1_1_distilbert.onnx',
        inputShape: '[-1, 128]',
        outputShape: '[-1, 3]',
        fileSizeBytes: 41500000,
        createdAt: '2026-10-14T08:20:00Z',
        inputSchema: JSON.stringify({
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Input customer feedback text' },
            language: { type: 'string', default: 'en' }
          },
          required: ['text']
        }, null, 2),
        outputSchema: JSON.stringify({
          type: 'object',
          properties: {
            sentiment: { type: 'string', enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'] },
            confidence: { type: 'number' }
          }
        }, null, 2)
      }
    ]
  },
  {
    id: 3,
    name: 'fraud-detection',
    description: 'High-throughput transactional anomaly and risk fraud classifier with sub-10ms response target.',
    framework: 'ONNX v1.18',
    activeVersion: 'v1.0.0',
    status: 'READY',
    createdAt: '2026-10-08T15:00:00Z',
    updatedAt: '2026-10-12T17:10:00Z',
    versions: [
      {
        id: 301,
        version: 'v1.0.0',
        status: 'ACTIVE',
        artifactPath: '/artifacts/fraud_v1_nn.onnx',
        inputShape: '[-1, 8]',
        outputShape: '[-1, 2]',
        fileSizeBytes: 8900000,
        createdAt: '2026-10-08T15:00:00Z',
        inputSchema: JSON.stringify({
          type: 'object',
          properties: {
            amount: { type: 'number', description: 'Transaction amount in USD' },
            country_risk: { type: 'number', description: 'Normalized country risk index 0-1' },
            velocity_score: { type: 'number', description: '24h card velocity count' },
            device_trust: { type: 'number', description: 'Fingerprint trust score 0-1' }
          },
          required: ['amount', 'country_risk']
        }, null, 2),
        outputSchema: JSON.stringify({
          type: 'object',
          properties: {
            is_fraud: { type: 'boolean' },
            risk_score: { type: 'number' }
          }
        }, null, 2)
      }
    ]
  }
];

export const initialMockRoutes: TrafficRoute[] = [
  {
    id: 1,
    modelName: 'churn-predictor',
    routingStrategy: 'AB_SPLIT',
    weights: { 'v1.0.0': 80, 'v2.0.0': 20 },
    isEnabled: true,
    updatedAt: '2026-10-14T11:45:00Z'
  },
  {
    id: 2,
    modelName: 'sentiment-analyzer',
    routingStrategy: 'CANARY',
    weights: { 'v1.0.0': 90, 'v1.1.0': 10 },
    isEnabled: true,
    updatedAt: '2026-10-14T08:20:00Z'
  },
  {
    id: 3,
    modelName: 'fraud-detection',
    routingStrategy: 'SINGLE',
    weights: { 'v1.0.0': 100 },
    isEnabled: true,
    updatedAt: '2026-10-12T17:10:00Z'
  }
];

export const initialMockLogs: InferenceLog[] = [
  {
    id: 1001,
    requestId: 'req-8f4b238a-11e2',
    modelName: 'churn-predictor',
    version: 'v2.0.0',
    latencyMs: 9.8,
    statusCode: 200,
    inputPayload: '{"tenure": 24, "monthly_charges": 65.50, "total_charges": 1572.0, "contract_type": "one-year"}',
    outputPrediction: '{"churn_probability": 0.142, "churn_risk": "LOW"}',
    cacheHit: false,
    routingReason: 'AB_SPLIT (20%)',
    clientIp: '192.168.1.42',
    timestamp: new Date(Date.now() - 4000).toISOString()
  },
  {
    id: 1002,
    requestId: 'req-9c221a4f-01ab',
    modelName: 'churn-predictor',
    version: 'v1.0.0',
    latencyMs: 14.5,
    statusCode: 200,
    inputPayload: '{"tenure": 3, "monthly_charges": 89.90, "total_charges": 269.7, "contract_type": "month-to-month"}',
    outputPrediction: '{"churn_probability": 0.724, "churn_risk": "HIGH"}',
    cacheHit: false,
    routingReason: 'AB_SPLIT (80%)',
    clientIp: '192.168.1.18',
    timestamp: new Date(Date.now() - 12000).toISOString()
  },
  {
    id: 1003,
    requestId: 'req-3a11b89c-44de',
    modelName: 'sentiment-analyzer',
    version: 'v1.1.0',
    latencyMs: 22.1,
    statusCode: 200,
    inputPayload: '{"text": "The model serving latency is unbelievably fast and rock solid!"}',
    outputPrediction: '{"sentiment": "POSITIVE", "confidence": 0.96, "polarity": 0.92}',
    cacheHit: false,
    routingReason: 'CANARY (10%)',
    clientIp: '10.0.4.15',
    timestamp: new Date(Date.now() - 25000).toISOString()
  },
  {
    id: 1004,
    requestId: 'req-77fbc811-99ee',
    modelName: 'fraud-detection',
    version: 'v1.0.0',
    latencyMs: 0.85,
    statusCode: 200,
    inputPayload: '{"amount": 45.00, "country_risk": 0.05, "velocity_score": 1, "device_trust": 0.98}',
    outputPrediction: '{"is_fraud": false, "risk_score": 0.04}',
    cacheHit: true,
    routingReason: 'SINGLE (100%) [CACHE]',
    clientIp: '172.16.0.8',
    timestamp: new Date(Date.now() - 48000).toISOString()
  },
  {
    id: 1005,
    requestId: 'req-1200fa44-ee32',
    modelName: 'fraud-detection',
    version: 'v1.0.0',
    latencyMs: 8.2,
    statusCode: 200,
    inputPayload: '{"amount": 3200.00, "country_risk": 0.85, "velocity_score": 7, "device_trust": 0.12}',
    outputPrediction: '{"is_fraud": true, "risk_score": 0.94}',
    cacheHit: false,
    routingReason: 'SINGLE (100%)',
    clientIp: '198.51.100.22',
    timestamp: new Date(Date.now() - 72000).toISOString()
  }
];

export const initialMockMetrics: MetricsSummary = {
  p50LatencyMs: 12.4,
  p95LatencyMs: 34.8,
  p99LatencyMs: 68.2,
  avgLatencyMs: 16.7,
  requestsPerSecond: 28.5,
  errorRatePercentage: 0.2,
  totalRequests: 148920,
  activeModels: 3,
  cacheHitRatePercentage: 27.4,
  requestsPerVersion: {
    'churn-predictor:v1.0.0': 78400,
    'churn-predictor:v2.0.0': 19600,
    'sentiment-analyzer:v1.0.0': 32400,
    'sentiment-analyzer:v1.1.0': 3600,
    'fraud-detection:v1.0.0': 14920
  }
};
