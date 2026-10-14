import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LiveInferenceEvent } from '../types';

interface LiveStreamContextType {
  liveEvents: LiveInferenceEvent[];
  latestEvent: LiveInferenceEvent | null;
  connectionMode: 'BACKEND_SSE' | 'SIMULATION';
  isLiveConnected: boolean;
}

const LiveStreamContext = createContext<LiveStreamContextType | undefined>(undefined);

export const LiveStreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liveEvents, setLiveEvents] = useState<LiveInferenceEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<LiveInferenceEvent | null>(null);
  const [connectionMode, setConnectionMode] = useState<'BACKEND_SSE' | 'SIMULATION'>('SIMULATION');
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let sseActive = false;

    try {
      eventSource = new EventSource('http://localhost:8080/api/stream/events');

      eventSource.addEventListener('INFERENCE_EVENT', (event) => {
        try {
          const parsed: LiveInferenceEvent = JSON.parse(event.data);
          sseActive = true;
          setConnectionMode('BACKEND_SSE');
          setIsLiveConnected(true);
          setLatestEvent(parsed);
          setLiveEvents(prev => [parsed, ...prev.slice(0, 19)]);
        } catch {}
      });

      eventSource.onerror = () => {
        if (!sseActive) {
          eventSource?.close();
        }
      };
    } catch {
      // EventSource not supported or backend down
    }

    // Simulation pulse timer if backend is offline or idle
    const simInterval = setInterval(() => {
      if (connectionMode === 'BACKEND_SSE' && sseActive) return;

      const models = ['churn-predictor', 'sentiment-analyzer', 'fraud-detection'];
      const chosenModel = models[Math.floor(Math.random() * models.length)];
      let version = 'v1.0.0';
      let routingReason = 'DIRECT (100%)';

      if (chosenModel === 'churn-predictor') {
        const isV2 = Math.random() < 0.25;
        version = isV2 ? 'v2.0.0' : 'v1.0.0';
        routingReason = isV2 ? 'AB_SPLIT (20%)' : 'AB_SPLIT (80%)';
      } else if (chosenModel === 'sentiment-analyzer') {
        const isCanary = Math.random() < 0.15;
        version = isCanary ? 'v1.1.0' : 'v1.0.0';
        routingReason = isCanary ? 'CANARY (10%)' : 'CANARY (90%)';
      }

      const isCache = Math.random() < 0.22;
      const baseLat = version.includes('v2') ? 8.5 : (version.includes('1.1') ? 19.5 : 13.5);
      const latency = isCache ? 0.82 : Math.round((baseLat + (Math.random() - 0.5) * 5) * 10) / 10;

      const simEvent: LiveInferenceEvent = {
        eventId: `ev-${Math.random().toString(36).substring(2, 8)}`,
        modelName: chosenModel,
        version,
        latencyMs: latency,
        statusCode: Math.random() < 0.02 ? 500 : 200,
        cacheHit: isCache,
        routingReason: isCache ? `${routingReason} [CACHE]` : routingReason,
        confidence: Math.round((Math.random() * 0.15 + 0.84) * 100) / 100,
        timestamp: new Date().toISOString()
      };

      setLatestEvent(simEvent);
      setLiveEvents(prev => [simEvent, ...prev.slice(0, 19)]);
    }, 2800);

    return () => {
      eventSource?.close();
      clearInterval(simInterval);
    };
  }, [connectionMode]);

  return (
    <LiveStreamContext.Provider value={{
      liveEvents,
      latestEvent,
      connectionMode,
      isLiveConnected
    }}>
      {children}
    </LiveStreamContext.Provider>
  );
};

export const useLiveStream = () => {
  const context = useContext(LiveStreamContext);
  if (!context) throw new Error('useLiveStream must be used within a LiveStreamProvider');
  return context;
};
