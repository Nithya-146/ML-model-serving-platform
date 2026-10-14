export type UserRole = 'ROLE_ADMIN' | 'ROLE_DEVELOPER' | 'ROLE_VIEWER';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  token?: string;
}

export interface ModelVersion {
  id: number;
  version: string;
  status: 'ACTIVE' | 'CANARY' | 'STAGING' | 'ARCHIVED';
  artifactPath?: string;
  inputSchema?: string;
  outputSchema?: string;
  inputShape?: string;
  outputShape?: string;
  fileSizeBytes?: number;
  createdAt: string;
}

export interface ModelDetail {
  id: number;
  name: string;
  description: string;
  framework: string;
  activeVersion: string;
  status: 'READY' | 'DEPLOYING' | 'DEGRADED' | 'OFFLINE';
  createdAt: string;
  updatedAt: string;
  versions: ModelVersion[];
}

export interface TrafficRoute {
  id?: number;
  modelName: string;
  routingStrategy: 'AB_SPLIT' | 'CANARY' | 'SINGLE';
  versionWeightsJson?: string;
  weights: Record<string, number>;
  isEnabled?: boolean;
  updatedAt?: string;
}

export interface PredictResponse {
  requestId: string;
  model: string;
  version: string;
  latencyMs: number;
  predictions: Record<string, any>;
  confidence?: number;
  routedBy: string;
  cacheHit: boolean;
  timestamp: string;
}

export interface InferenceLog {
  id: number;
  requestId: string;
  modelName: string;
  version: string;
  latencyMs: number;
  statusCode: number;
  inputPayload: string;
  outputPrediction: string;
  cacheHit: boolean;
  routingReason?: string;
  clientIp?: string;
  timestamp: string;
}

export interface LiveInferenceEvent {
  eventId: string;
  modelName: string;
  version: string;
  latencyMs: number;
  statusCode: number;
  cacheHit: boolean;
  routingReason: string;
  confidence?: number;
  timestamp: string;
}

export interface MetricsSummary {
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  avgLatencyMs: number;
  requestsPerSecond: number;
  errorRatePercentage: number;
  totalRequests: number;
  activeModels: number;
  cacheHitRatePercentage: number;
  requestsPerVersion: Record<string, number>;
}
