import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ModelDetail, TrafficRoute } from '../types';
import { ParticleTrafficFlow } from '../components/ParticleTrafficFlow';
import { useAuth } from '../context/AuthContext';
import { 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Zap 
} from 'lucide-react';

export const TrafficLab: React.FC = () => {
  const { role } = useAuth();
  const [models, setModels] = useState<ModelDetail[]>([]);
  const [routes, setRoutes] = useState<TrafficRoute[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('churn-predictor');
  const [strategy, setStrategy] = useState<'AB_SPLIT' | 'CANARY' | 'SINGLE'>('AB_SPLIT');
  const [weightA, setWeightA] = useState<number>(80);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [m, r] = await Promise.all([api.getModels(), api.getRoutes()]);
    setModels(m);
    setRoutes(r);

    const currentRoute = r.find(route => route.modelName === 'churn-predictor');
    if (currentRoute) {
      setStrategy(currentRoute.routingStrategy);
      const firstWeight = Object.values(currentRoute.weights)[0] ?? 80;
      setWeightA(firstWeight);
    }
  };

  const currentModelObj = models.find(m => m.name === selectedModel);
  const versions = currentModelObj?.versions || [];
  const versionA = versions[0]?.version || 'v1.0.0';
  const versionB = versions[1]?.version || 'v2.0.0';
  const weightB = 100 - weightA;

  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
    const r = routes.find(route => route.modelName === modelName);
    if (r) {
      setStrategy(r.routingStrategy);
      const keys = Object.keys(r.weights);
      if (keys.length > 0) {
        setWeightA(r.weights[keys[0]]);
      } else {
        setWeightA(100);
      }
    } else {
      setWeightA(100);
      setStrategy('SINGLE');
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeightA(parseInt(e.target.value, 10));
  };

  const setPreset = (a: number, _b: number, strat: 'AB_SPLIT' | 'CANARY' | 'SINGLE') => {
    setWeightA(a);
    setStrategy(strat);
  };

  const handleSaveRoute = async () => {
    try {
      const weights: Record<string, number> = {
        [versionA]: weightA,
        [versionB]: weightB
      };

      await api.updateRoute(selectedModel, strategy, weights);
      setSaveStatus('SUCCESS');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('ERROR');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const canEdit = role === 'ROLE_ADMIN' || role === 'ROLE_DEVELOPER';

  return (
    <div className="animate-fade-in" style={{ padding: '24px 32px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Traffic Routing Lab
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Dynamic A/B testing and Canary deployment rollout with zero-downtime weight shifts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Target Model:
          </span>
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="dock-input"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600 }}
          >
            {models.map(m => (
              <option key={m.name} value={m.name} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                {m.name} ({m.versions.length} versions)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        {/* Left Column: Particle Traffic Flow Visualizer - Spans 7 columns */}
        <div className="bento-card" style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-lime)', textTransform: 'uppercase' }}>
                  // LIVE TOPOLOGY STREAM
                </div>
                <h2 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Real-time Packet Flow ({selectedModel})
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="status-pill status-active" style={{ fontSize: '0.65rem' }}>
                  {versionA}: {weightA}%
                </span>
                <span className="status-pill status-canary" style={{ fontSize: '0.65rem' }}>
                  {versionB}: {weightB}%
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Particles visually demonstrate real-time packet distribution between versions as incoming requests hit the model endpoint.
            </p>

            {/* Custom Interactive Particle Canvas */}
            <ParticleTrafficFlow
              modelName={selectedModel}
              strategy={strategy}
              versionA={versionA}
              weightA={weightA}
              versionB={versionB}
              weightB={weightB}
              height={260}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '12px',
            marginTop: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Ingress Rate: <strong style={{ color: 'var(--text-primary)' }}>28.5 rps</strong>
            </span>
            <span style={{ color: 'var(--accent-lime)' }}>
              v1 Target: ~{(28.5 * (weightA / 100)).toFixed(1)} rps
            </span>
            <span style={{ color: 'var(--accent-cyan)' }}>
              v2 Target: ~{(28.5 * (weightB / 100)).toFixed(1)} rps
            </span>
          </div>
        </div>

        {/* Right Column: Weight Shift Controls & Preset Selector - Spans 5 columns */}
        <div className="bento-card" style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                  // CONTROL PLANE
                </div>
                <h2 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Traffic Split Configuration
                </h2>
              </div>
              <Sliders size={18} style={{ color: 'var(--accent-lime)' }} />
            </div>

            {/* Strategy Selector Tabs */}
            <div style={{ marginBottom: '18px' }}>
              <label className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                ROUTING STRATEGY
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { id: 'AB_SPLIT', label: 'A/B Split' },
                  { id: 'CANARY', label: 'Canary Rollout' },
                  { id: 'SINGLE', label: 'Single Active' }
                ].map(s => {
                  const active = strategy === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStrategy(s.id as any)}
                      className="font-mono"
                      style={{
                        padding: '8px 0',
                        fontSize: '0.72rem',
                        fontWeight: active ? 700 : 500,
                        borderRadius: 'var(--radius-md)',
                        border: active ? '1px solid var(--accent-lime)' : '1px solid var(--border-subtle)',
                        background: active ? 'var(--accent-lime-dim)' : 'var(--bg-tertiary)',
                        color: active ? 'var(--accent-lime)' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Interactive Slider */}
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-lime)', fontWeight: 700 }}>
                    {versionA}
                  </span>
                  <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {weightA}%
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    {versionB}
                  </span>
                  <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {weightB}%
                  </div>
                </div>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={weightA}
                onChange={handleSliderChange}
                disabled={!canEdit}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-lime)',
                  cursor: canEdit ? 'pointer' : 'not-allowed',
                  height: '6px'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>0% v1</span>
                <span>50% EQUAL</span>
                <span>100% v1</span>
              </div>
            </div>

            {/* Fast Preset Buttons */}
            <div style={{ marginBottom: '20px' }}>
              <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Quick Rollout Presets:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button onClick={() => setPreset(80, 20, 'AB_SPLIT')} className="btn-dock btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                  80 / 20 A/B
                </button>
                <button onClick={() => setPreset(50, 50, 'AB_SPLIT')} className="btn-dock btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                  50 / 50 Equal
                </button>
                <button onClick={() => setPreset(90, 10, 'CANARY')} className="btn-dock btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                  90 / 10 Canary
                </button>
                <button onClick={() => setPreset(100, 0, 'SINGLE')} className="btn-dock btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                  100% v1 Only
                </button>
                <button onClick={() => setPreset(0, 100, 'SINGLE')} className="btn-dock btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                  100% v2 (Promote)
                </button>
              </div>
            </div>
          </div>

          {/* Action / Save Bar */}
          <div>
            {saveStatus === 'SUCCESS' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'var(--accent-lime-dim)',
                color: 'var(--accent-lime)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                marginBottom: '10px'
              }}>
                <CheckCircle2 size={16} />
                <span>Routing rule deployed live to Spring Boot router!</span>
              </div>
            )}

            {saveStatus === 'ERROR' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(244, 63, 94, 0.15)',
                color: 'var(--accent-rose)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                marginBottom: '10px'
              }}>
                <AlertCircle size={16} />
                <span>Failed to update traffic route. Check permissions.</span>
              </div>
            )}

            <button
              onClick={handleSaveRoute}
              disabled={!canEdit}
              className="btn-dock btn-lime"
              style={{ width: '100%', padding: '12px', fontSize: '0.88rem' }}
            >
              <Zap size={16} />
              <span>Deploy Route Shift ({weightA}% / {weightB}%)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
