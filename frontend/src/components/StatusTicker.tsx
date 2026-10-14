import React, { useState, useEffect } from 'react';
import { useLiveStream } from '../context/LiveStreamContext';
import { Activity, Radio, Cpu, Clock, Zap } from 'lucide-react';

export const StatusTicker: React.FC = () => {
  const { latestEvent, connectionMode } = useLiveStream();
  const [time, setTime] = useState<string>(new Date().toUTCString().slice(17, 25));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString().slice(17, 25));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      height: '38px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      fontSize: '0.75rem',
      fontFamily: 'var(--font-mono)',
      color: 'var(--text-secondary)',
      zIndex: 50,
      userSelect: 'none'
    }}>
      {/* Left: Mission status & connection mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="pulse-dot" style={{ color: 'var(--accent-lime)' }}></span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
            MD-CLUSTER // NOMINAL
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
          <Radio size={12} style={{ color: connectionMode === 'BACKEND_SSE' ? 'var(--accent-lime)' : 'var(--accent-cyan)' }} />
          <span>STREAM: <strong style={{ color: 'var(--text-primary)' }}>{connectionMode}</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
          <Cpu size={12} />
          <span>ONNX RUNTIME: <strong style={{ color: 'var(--accent-lime)' }}>ACTIVE</strong></span>
        </div>
      </div>

      {/* Center: Live Request Ticker Stream */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '480px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        background: 'rgba(0,0,0,0.2)',
        padding: '2px 12px',
        borderRadius: '4px',
        border: '1px solid rgba(255,255,255,0.04)'
      }}>
        <Zap size={11} style={{ color: 'var(--accent-lime)', flexShrink: 0 }} />
        {latestEvent ? (
          <span style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--accent-lime)' }}>{latestEvent.modelName}</span>:
            <span style={{ color: 'var(--accent-cyan)' }}>{latestEvent.version}</span> →
            <span> {latestEvent.latencyMs}ms</span>
            <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>({latestEvent.routingReason})</span>
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>Awaiting telemetry ingress stream...</span>
        )}
      </div>

      {/* Right: Telemetry summary & UTC Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={12} style={{ color: 'var(--accent-lime)' }} />
          <span>INGRESS: <strong style={{ color: 'var(--text-primary)' }}>28.5 req/s</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} />
          <span>UTC: <strong style={{ color: 'var(--text-primary)' }}>{time}</strong></span>
        </div>
      </div>
    </div>
  );
};
