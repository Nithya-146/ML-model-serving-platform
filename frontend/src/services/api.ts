import type { ModelDetail, TrafficRoute, InferenceLog, MetricsSummary, PredictResponse, User } from '../types';
import { initialMockModels, initialMockRoutes, initialMockLogs, initialMockMetrics } from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

let authToken: string | null = localStorage.getItem('modeldock_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('modeldock_token', token);
  } else {
    localStorage.removeItem('modeldock_token');
  }
};

const getHeaders = (isMultipart = false) => {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

// In-memory local state for standalone simulation
let localModels: ModelDetail[] = [...initialMockModels];
let localRoutes: TrafficRoute[] = [...initialMockRoutes];
let localLogs: InferenceLog[] = [...initialMockLogs];
let localMetrics: MetricsSummary = { ...initialMockMetrics };

export const api = {
  // Auth
  async login(username: string, password: string): Promise<User> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        setAuthToken(data.token);
        return {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
          token: data.token
        };
      }
    } catch {
      // Backend unavailable, fallback to mock user
    }

    // Mock Login
    let role: User['role'] = 'ROLE_DEVELOPER';
    if (username.toLowerCase().includes('admin')) role = 'ROLE_ADMIN';
    if (username.toLowerCase().includes('viewer')) role = 'ROLE_VIEWER';

    const mockUser: User = {
      id: Math.floor(Math.random() * 1000) + 1,
      username: username || 'engineer',
      email: `${username || 'engineer'}@modeldock.io`,
      role,
      token: 'mock-jwt-token-modeldock-' + Date.now()
    };
    setAuthToken(mockUser.token!);
    return mockUser;
  },

  async register(username: string, email: string, password: string, role = 'ROLE_DEVELOPER'): Promise<User> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      });
      if (res.ok) {
        const data = await res.json();
        setAuthToken(data.token);
        return {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
          token: data.token
        };
      }
    } catch {
      // Fallback
    }

    const mockUser: User = {
      id: Math.floor(Math.random() * 1000) + 1,
      username,
      email,
      role: role as any,
      token: 'mock-jwt-token-modeldock-' + Date.now()
    };
    setAuthToken(mockUser.token!);
    return mockUser;
  },

  // Models
  async getModels(): Promise<ModelDetail[]> {
    try {
      const res = await fetch(`${API_BASE}/api/models`, { headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return localModels;
  },

  async createModel(payload: any): Promise<ModelDetail> {
    try {
      const res = await fetch(`${API_BASE}/api/models`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const newModel: ModelDetail = {
      id: localModels.length + 1,
      name: payload.name,
      description: payload.description || 'Newly deployed ONNX model pipeline.',
      framework: payload.framework || 'ONNX',
      activeVersion: payload.version || 'v1.0.0',
      status: 'READY',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [
        {
          id: Date.now(),
          version: payload.version || 'v1.0.0',
          status: 'ACTIVE',
          inputShape: payload.inputShape || '[-1, 4]',
          outputShape: payload.outputShape || '[-1, 1]',
          createdAt: new Date().toISOString(),
          inputSchema: payload.inputSchema ? JSON.stringify(payload.inputSchema, null, 2) : undefined,
          outputSchema: payload.outputSchema ? JSON.stringify(payload.outputSchema, null, 2) : undefined
        }
      ]
    };
    localModels.unshift(newModel);
    localRoutes.push({
      id: Date.now(),
      modelName: payload.name,
      routingStrategy: 'SINGLE',
      weights: { [payload.version || 'v1.0.0']: 100 },
      isEnabled: true,
      updatedAt: new Date().toISOString()
    });
    return newModel;
  },

  // Traffic Routes
  async getRoutes(): Promise<TrafficRoute[]> {
    try {
      const res = await fetch(`${API_BASE}/api/traffic/routes`, { headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return localRoutes;
  },

  async updateRoute(modelName: string, strategy: string, weights: Record<string, number>): Promise<TrafficRoute> {
    try {
      const res = await fetch(`${API_BASE}/api/traffic/routes/${modelName}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ strategy, weights })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const idx = localRoutes.findIndex(r => r.modelName === modelName);
    const updated: TrafficRoute = {
      id: idx >= 0 ? localRoutes[idx].id : Date.now(),
      modelName,
      routingStrategy: strategy as any,
      weights,
      isEnabled: true,
      updatedAt: new Date().toISOString()
    };
    if (idx >= 0) {
      localRoutes[idx] = updated;
    } else {
      localRoutes.push(updated);
    }
    return updated;
  },

  // Predictions (Playground & Test)
  async predictRouted(modelName: string, inputs: Record<string, any>): Promise<PredictResponse> {
    try {
      const res = await fetch(`${API_BASE}/predict/${modelName}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ inputs })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    // Local simulation calculation
    const route = localRoutes.find(r => r.modelName === modelName);
    let chosenVersion = 'v1.0.0';
    let routingReason = 'DIRECT';

    if (route && route.weights) {
      const entries = Object.entries(route.weights);
      const rand = Math.random() * 100;
      let cum = 0;
      for (const [v, w] of entries) {
        cum += w;
        if (rand < cum) {
          chosenVersion = v;
          routingReason = `${route.routingStrategy} (${w}%)`;
          break;
        }
      }
    }

    const latency = chosenVersion.includes('v2') ? 8.4 + Math.random() * 5.2 : 14.1 + Math.random() * 8.5;
    const isCache = Math.random() < 0.2;
    const finalLatency = isCache ? 0.8 : Math.round(latency * 100) / 100;

    let predictions: any = { probability: 0.28, label: 'LOW_RISK' };
    if (modelName === 'churn-predictor') {
      const p = Math.round((Math.random() * 0.85 + 0.05) * 1000) / 1000;
      predictions = { churn_probability: p, churn_risk: p > 0.6 ? 'HIGH' : (p > 0.35 ? 'MEDIUM' : 'LOW') };
    } else if (modelName === 'sentiment-analyzer') {
      const sentiments = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];
      const s = sentiments[Math.floor(Math.random() * sentiments.length)];
      predictions = { sentiment: s, confidence: 0.94, polarity: s === 'POSITIVE' ? 0.88 : (s === 'NEGATIVE' ? -0.82 : 0.05) };
    } else if (modelName === 'fraud-detection') {
      const isFraud = Math.random() < 0.08;
      predictions = { is_fraud: isFraud, risk_score: isFraud ? 0.92 : 0.04 };
    }

    const response: PredictResponse = {
      requestId: `req-${Math.random().toString(36).substring(2, 9)}`,
      model: modelName,
      version: chosenVersion,
      latencyMs: finalLatency,
      predictions,
      confidence: 0.92,
      routedBy: routingReason + (isCache ? ' [CACHE]' : ''),
      cacheHit: isCache,
      timestamp: new Date().toISOString()
    };

    // Append to local logs
    localLogs.unshift({
      id: Date.now(),
      requestId: response.requestId,
      modelName,
      version: chosenVersion,
      latencyMs: response.latencyMs,
      statusCode: 200,
      inputPayload: JSON.stringify(inputs),
      outputPrediction: JSON.stringify(predictions),
      cacheHit: isCache,
      routingReason: response.routedBy,
      clientIp: '127.0.0.1',
      timestamp: response.timestamp
    });
    if (localLogs.length > 200) localLogs.pop();

    return response;
  },

  async predictVersion(modelName: string, version: string, inputs: Record<string, any>): Promise<PredictResponse> {
    try {
      const res = await fetch(`${API_BASE}/predict/${modelName}/${version}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ inputs })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const latency = version.includes('v2') ? 8.2 + Math.random() * 4.5 : 13.9 + Math.random() * 6.5;
    return {
      requestId: `req-direct-${Math.random().toString(36).substring(2, 8)}`,
      model: modelName,
      version,
      latencyMs: Math.round(latency * 100) / 100,
      predictions: { status: 'OPTIMAL', score: 0.89 },
      confidence: 0.91,
      routedBy: `DIRECT (${version})`,
      cacheHit: false,
      timestamp: new Date().toISOString()
    };
  },

  // Logs
  async getLogs(filter?: { model?: string; version?: string; status?: number }): Promise<InferenceLog[]> {
    try {
      let query = new URLSearchParams();
      if (filter?.model) query.set('model', filter.model);
      if (filter?.version) query.set('version', filter.version);
      if (filter?.status) query.set('status', filter.status.toString());
      
      const res = await fetch(`${API_BASE}/api/logs?${query.toString()}`, { headers: getHeaders() });
      if (res.ok) {
        const page = await res.json();
        return page.content || [];
      }
    } catch {
      // fallback
    }

    return localLogs.filter(log => {
      if (filter?.model && log.modelName !== filter.model) return false;
      if (filter?.version && log.version !== filter.version) return false;
      if (filter?.status && log.statusCode !== filter.status) return false;
      return true;
    });
  },

  // Metrics
  async getMetrics(): Promise<MetricsSummary> {
    try {
      const res = await fetch(`${API_BASE}/api/metrics/summary`, { headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    // Add gentle live noise to simulated telemetry for dynamic mission control feeling
    const delta = (Math.random() - 0.5) * 1.5;
    localMetrics.requestsPerSecond = Math.max(12, Math.round((28.5 + delta) * 10) / 10);
    localMetrics.p50LatencyMs = Math.round((12.4 + (Math.random() - 0.5) * 0.8) * 10) / 10;
    localMetrics.p95LatencyMs = Math.round((34.8 + (Math.random() - 0.5) * 1.8) * 10) / 10;
    localMetrics.p99LatencyMs = Math.round((68.2 + (Math.random() - 0.5) * 3.2) * 10) / 10;
    localMetrics.totalRequests += Math.floor(Math.random() * 5) + 1;

    return localMetrics;
  }
};
