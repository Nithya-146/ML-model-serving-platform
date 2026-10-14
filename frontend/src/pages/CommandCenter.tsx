import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ModelDetail, MetricsSummary } from '../types';
import { useLiveStream } from '../context/LiveStreamContext';
import { RadialLatencyGauge } from '../components/RadialLatencyGauge';
import { Sparkline } from '../components/Sparkline';
import { 
  Zap, 
  Activity, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

export const CommandCenter: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [models, setModels] = useState<ModelDetail[]>([]);
  const [sparkHistory, setSparkHistory] = useState<number[]>([12, 14, 13, 16, 15, 18, 14, 13, 16, 17, 14]);
  const { liveEvents } = useLiveStream();

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      const m = await api.getMetrics();
      setMetrics(m);
      setSparkHistory(prev => [...prev.slice(1), m.requestsPerSecond]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const [m, mdl] = await Promise.all([api.getMetrics(), api.getModels()]);
    setMetrics(m);
    setModels(mdl);
  };

  const p50 = metrics?.p50LatencyMs || 12.4;
  const p95 = metrics?.p95LatencyMs || 34.8;
  const p99 = metrics?.p99LatencyMs || 68.2;
  const rps = metrics?.requestsPerSecond || 28.5;
  const errorRate = metrics?.errorRatePercentage || 0.2;
  const totalReq = metrics?.totalRequests || 148920;

  return (
    <div className="animate-fade-in" style={{ padding: '24px 32px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Mission Command Center
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Real-time telemetry, latency percentiles, and traffic distribution across ONNX models.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="status-pill status-active">
            <span className="pulse-dot"></span>
            CLUSTER SYNCED
          </span>
          <button onClick={loadData} className="btn-dock btn-secondary" style={{ padding: '6px 12px' }}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Asymmetric Bento Grid Top Section: Telemetry & Gauges */}
      <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', marginBottom: '24px' }}>
        {/* Box 1: Radial Gauges (P50, P95, P99) - Spans 6 columns */}
        <div className="bento-card" style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-lime)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                // TELEMETRY LATENCY
              </div>
              <h2 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Response Percentiles (SLA)
              </h2>
            </div>
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Target: &lt; 50ms P95
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0' }}>
            <RadialLatencyGauge
              label="P50 MEDIAN"
              value={p50}
              max={50}
              color="var(--accent-lime)"
              size={135}
            />
            <RadialLatencyGauge
              label="P95 TAIL"
              value={p95}
              max={80}
              color="var(--accent-amber)"
              size={155}
            />
            <RadialLatencyGauge
              label="P99 PEAK"
              value={p99}
              max={120}
              color="var(--accent-rose)"
              size={135}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '12px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)'
          }}>
            <span>Cache Acceleration: <strong style={{ color: 'var(--accent-lime)' }}>27.4% Hit Rate</strong></span>
            <span>Micrometer Timer: <strong style={{ color: 'var(--text-primary)' }}>Histogram Enabled</strong></span>
          </div>
        </div>

        {/* Box 2: Ingress Throughput & Sparkline - Spans 3 columns */}
        <div className="bento-card" style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-lime)', textTransform: 'uppercase' }}>
                // THROUGHPUT
              </div>
              <Activity size={16} style={{ color: 'var(--accent-lime)' }} />
            </div>
            <div className="font-mono" style={{ fontSize: '2.4rem', fontWeight: 700, margin: '8px 0 2px 0', color: 'var(--text-primary)' }}>
              {rps.toFixed(1)}
            </div>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Requests / Second
            </div>
          </div>

          <div style={{ margin: '14px 0' }}>
            <Sparkline data={sparkHistory} width={200} height={45} color="var(--accent-lime)" fill={true} />
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Lifetime Invocations: <strong style={{ color: 'var(--text-primary)' }}>{totalReq.toLocaleString()}</strong>
          </div>
        </div>

        {/* Box 3: Error Rate & Cluster Health - Spans 3 columns */}
        <div className="bento-card" style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                // SYSTEM RELIABILITY
              </div>
              <AlertTriangle size={16} style={{ color: errorRate > 1.0 ? 'var(--accent-rose)' : 'var(--accent-lime)' }} />
            </div>
            <div className="font-mono" style={{ fontSize: '2.4rem', fontWeight: 700, margin: '8px 0 2px 0', color: 'var(--text-primary)' }}>
              {errorRate.toFixed(2)}%
            </div>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Error Rate (4xx / 5xx)
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Active Models:</span>
              <strong className="font-mono" style={{ color: 'var(--accent-lime)' }}>3 / 3 Online</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Redis Token Bucket:</span>
              <strong className="font-mono" style={{ color: 'var(--accent-cyan)' }}>120 req cap</strong>
            </div>
          </div>

          <button
            onClick={() => onNavigate('traffic')}
            className="btn-dock btn-secondary"
            style={{ width: '100%', fontSize: '0.78rem', justifyContent: 'space-between' }}
          >
            <span>Open Traffic Lab</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Middle Section: Active Model Fleet & Live Telemetry Stream */}
      <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        {/* Left: Active Model Fleet Table - Spans 7 columns */}
        <div className="bento-card" style={{ gridColumn: 'span 7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-lime)', textTransform: 'uppercase' }}>
                // INFERENCE FLEET
              </div>
              <h2 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Active Serving Deployments
              </h2>
            </div>
            <button onClick={() => onNavigate('models')} className="btn-dock btn-ghost" style={{ fontSize: '0.75rem' }}>
              <span>View Registry →</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                  <th style={{ padding: '8px 10px' }}>MODEL</th>
                  <th style={{ padding: '8px 10px' }}>ACTIVE VERSION</th>
                  <th style={{ padding: '8px 10px' }}>ROUTING</th>
                  <th style={{ padding: '8px 10px' }}>STATUS</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                      <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.framework}</div>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className="font-mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {m.activeVersion}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                        ({m.versions.length} versions)
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {m.name === 'churn-predictor' && (
                        <span className="status-pill status-active" style={{ fontSize: '0.65rem' }}>
                          A/B: 80 / 20
                        </span>
                      )}
                      {m.name === 'sentiment-analyzer' && (
                        <span className="status-pill status-canary" style={{ fontSize: '0.65rem' }}>
                          CANARY: 90 / 10
                        </span>
                      )}
                      {m.name === 'fraud-detection' && (
                        <span className="status-pill" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                          DIRECT: 100%
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className="status-pill status-active" style={{ fontSize: '0.68rem' }}>
                        <span className="pulse-dot"></span>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <button
                        onClick={() => onNavigate('playground')}
                        className="btn-dock btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      >
                        <Zap size={12} style={{ color: 'var(--accent-lime)' }} />
                        Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Live Request Stream Feed - Spans 5 columns */}
        <div className="bento-card" style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                // SSE LIVE STREAM
              </div>
              <h2 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Inference Event Stream
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-dot" style={{ color: 'var(--accent-lime)' }}></span>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>STREAMING</span>
            </div>
          </div>

          {/* Event Stream List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '320px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}>
            {liveEvents.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Awaiting incoming requests...
              </div>
            ) : (
              liveEvents.slice(0, 7).map((ev, index) => (
                <div
                  key={ev.eventId || index}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={14} style={{ color: ev.statusCode === 200 ? 'var(--accent-lime)' : 'var(--accent-rose)' }} />
                    <div>
                      <div className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {ev.modelName} <span style={{ color: 'var(--accent-cyan)' }}>({ev.version})</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {ev.routingReason}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    <div style={{
                      fontWeight: 700,
                      color: ev.cacheHit ? 'var(--accent-cyan)' : 'var(--accent-lime)',
                      fontSize: '0.82rem'
                    }}>
                      {ev.latencyMs.toFixed(1)}ms {ev.cacheHit && '⚡'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
