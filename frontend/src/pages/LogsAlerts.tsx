import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { InferenceLog, ModelDetail } from '../types';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  X, 
  RefreshCw 
} from 'lucide-react';

export const LogsAlerts: React.FC = () => {
  const [logs, setLogs] = useState<InferenceLog[]>([]);
  const [models, setModels] = useState<ModelDetail[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectLog, setInspectLog] = useState<InferenceLog | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [l, m] = await Promise.all([
      api.getLogs(),
      api.getModels()
    ]);
    setLogs(l);
    setModels(m);
  };

  const handleFilterApply = async () => {
    const filterObj: any = {};
    if (selectedModel) filterObj.model = selectedModel;
    if (selectedVersion) filterObj.version = selectedVersion;
    if (statusFilter) filterObj.status = parseInt(statusFilter, 10);
    const filtered = await api.getLogs(filterObj);
    setLogs(filtered);
  };

  const displayedLogs = logs.filter(log => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = log.requestId.toLowerCase().includes(q);
      const matchInput = log.inputPayload.toLowerCase().includes(q);
      const matchOutput = log.outputPrediction.toLowerCase().includes(q);
      if (!matchId && !matchInput && !matchOutput) return false;
    }
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '24px 32px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Inference Logs & Alerts
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Filterable request history, latency tracing, and telemetry payload inspection.
          </p>
        </div>

        <button onClick={loadData} className="btn-dock btn-secondary" style={{ padding: '6px 12px' }}>
          <RefreshCw size={14} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bento-card" style={{ padding: '14px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Model Filter */}
          <div>
            <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              MODEL
            </label>
            <select
              value={selectedModel}
              onChange={(e) => { setSelectedModel(e.target.value); setSelectedVersion(''); }}
              className="dock-input"
              style={{ width: '180px', padding: '6px 10px', fontSize: '0.78rem' }}
            >
              <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Models</option>
              {models.map(m => (
                <option key={m.name} value={m.name} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              STATUS
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="dock-input"
              style={{ width: '130px', padding: '6px 10px', fontSize: '0.78rem' }}
            >
              <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Status</option>
              <option value="200" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>200 OK</option>
              <option value="400" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>400 Bad Request</option>
              <option value="500" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>500 Error</option>
            </select>
          </div>

          {/* Search Input */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              SEARCH PAYLOAD / REQUEST ID
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by ID, keyword, or payload JSON..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="dock-input"
                style={{ paddingLeft: '32px', fontSize: '0.78rem' }}
              />
            </div>
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button onClick={handleFilterApply} className="btn-dock btn-lime" style={{ padding: '7px 16px', fontSize: '0.78rem' }}>
              <Filter size={14} />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bento-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{
                background: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem'
              }}>
                <th style={{ padding: '12px 16px' }}>STATUS</th>
                <th style={{ padding: '12px 16px' }}>REQUEST ID</th>
                <th style={{ padding: '12px 16px' }}>MODEL & VERSION</th>
                <th style={{ padding: '12px 16px' }}>LATENCY</th>
                <th style={{ padding: '12px 16px' }}>ROUTED BY</th>
                <th style={{ padding: '12px 16px' }}>TIMESTAMP</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No inference request logs matched current filter.
                  </td>
                </tr>
              ) : (
                displayedLogs.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Status Code */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.statusCode === 200 ? (
                          <CheckCircle2 size={14} style={{ color: 'var(--accent-lime)' }} />
                        ) : (
                          <XCircle size={14} style={{ color: 'var(--accent-rose)' }} />
                        )}
                        <span className="font-mono" style={{
                          fontWeight: 700,
                          color: item.statusCode === 200 ? 'var(--accent-lime)' : 'var(--accent-rose)',
                          fontSize: '0.78rem'
                        }}>
                          {item.statusCode}
                        </span>
                      </div>
                    </td>

                    {/* Request ID */}
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
                      {item.requestId}
                    </td>

                    {/* Model & Version */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.modelName}</div>
                      <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                        {item.version}
                      </span>
                    </td>

                    {/* Latency with Speed Indicator */}
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                      <span style={{
                        fontWeight: 700,
                        color: item.latencyMs < 12 ? 'var(--accent-lime)' : (item.latencyMs < 40 ? 'var(--accent-cyan)' : 'var(--accent-amber)')
                      }}>
                        {item.latencyMs.toFixed(1)} ms
                      </span>
                      {item.cacheHit && (
                        <span style={{ marginLeft: 6, fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>
                          ⚡ CACHE
                        </span>
                      )}
                    </td>

                    {/* Routing Reason */}
                    <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.routingReason || 'DIRECT'}
                    </td>

                    {/* Timestamp */}
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>

                    {/* Inspect Button */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => setInspectLog(item)}
                        className="btn-dock btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      >
                        <Eye size={12} />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Inspection Drawer Modal */}
      {inspectLog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="bento-card" style={{ width: '680px', maxWidth: '92vw', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  Inference Trace Details
                </h3>
                <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  UUID: {inspectLog.requestId}
                </div>
              </div>
              <button onClick={() => setInspectLog(null)} className="btn-dock btn-ghost" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Quick Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>MODEL:</span>
                <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inspectLog.modelName}</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>VERSION:</span>
                <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-lime)' }}>{inspectLog.version}</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>LATENCY:</span>
                <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{inspectLog.latencyMs} ms</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>CACHE STATUS:</span>
                <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: inspectLog.cacheHit ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
                  {inspectLog.cacheHit ? 'HIT (0.8ms)' : 'MISS (COMPUTE)'}
                </div>
              </div>
            </div>

            {/* JSON Inputs & Outputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Input Payload:
                </span>
                <pre style={{
                  background: 'rgba(0,0,0,0.4)',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#bae6fd',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}>
                  {inspectLog.inputPayload}
                </pre>
              </div>

              <div>
                <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Output Prediction:
                </span>
                <pre style={{
                  background: 'rgba(0,0,0,0.4)',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#bbf7d0',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}>
                  {inspectLog.outputPrediction}
                </pre>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setInspectLog(null)} className="btn-dock btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
