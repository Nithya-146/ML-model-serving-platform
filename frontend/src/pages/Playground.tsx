import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ModelDetail, PredictResponse } from '../types';
import { 
  Play, 
  Terminal, 
  Copy, 
  Check, 
  Cpu, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const Playground: React.FC = () => {
  const [models, setModels] = useState<ModelDetail[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('churn-predictor');
  const [targetType, setTargetType] = useState<'ROUTED' | 'DIRECT'>('ROUTED');
  const [directVersion, setDirectVersion] = useState<string>('v1.0.0');
  const [inputJson, setInputJson] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<PredictResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    const list = await api.getModels();
    setModels(list);
    if (list.length > 0) {
      applyDefaultTemplate(list[0].name);
    }
  };

  const getTemplateForModel = (modelName: string): string => {
    if (modelName === 'churn-predictor') {
      return JSON.stringify({
        tenure: 18,
        monthly_charges: 74.50,
        total_charges: 1341.0,
        contract_type: 'month-to-month'
      }, null, 2);
    } else if (modelName === 'sentiment-analyzer') {
      return JSON.stringify({
        text: 'The ONNX model response time is blazingly fast and rock solid in production!',
        language: 'en'
      }, null, 2);
    } else if (modelName === 'fraud-detection') {
      return JSON.stringify({
        amount: 2450.00,
        country_risk: 0.72,
        velocity_score: 5,
        device_trust: 0.15
      }, null, 2);
    }
    return JSON.stringify({ feature1: 1.2, feature2: 3.4 }, null, 2);
  };

  const applyDefaultTemplate = (modelName: string) => {
    setInputJson(getTemplateForModel(modelName));
    setResponse(null);
    setErrorMsg(null);
  };

  const handleModelChange = (name: string) => {
    setSelectedModel(name);
    const m = models.find(x => x.name === name);
    if (m && m.versions.length > 0) {
      setDirectVersion(m.versions[0].version);
    }
    applyDefaultTemplate(name);
  };

  const handleRunInference = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    let parsedInputs: Record<string, any>;
    try {
      parsedInputs = JSON.parse(inputJson);
    } catch {
      setErrorMsg('Invalid JSON payload syntax. Please check braces and quotes.');
      setIsLoading(false);
      return;
    }

    try {
      let res: PredictResponse;
      if (targetType === 'ROUTED') {
        res = await api.predictRouted(selectedModel, parsedInputs);
      } else {
        res = await api.predictVersion(selectedModel, directVersion, parsedInputs);
      }
      setResponse(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Inference execution failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentModelObj = models.find(m => m.name === selectedModel);

  const curlCommand = targetType === 'ROUTED'
    ? `curl -X POST http://localhost:8080/predict/${selectedModel} \\\n  -H "Content-Type: application/json" \\\n  -d '${inputJson.replace(/\n/g, '').replace(/\s+/g, ' ')}'`
    : `curl -X POST http://localhost:8080/predict/${selectedModel}/${directVersion} \\\n  -H "Content-Type: application/json" \\\n  -d '${inputJson.replace(/\n/g, '').replace(/\s+/g, ' ')}'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 32px' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Interactive Inference Playground
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Execute real-time predictions against ONNX models, verify schema validation, and inspect the answering version.
          </p>
        </div>

        <button onClick={() => applyDefaultTemplate(selectedModel)} className="btn-dock btn-secondary" style={{ padding: '6px 12px' }}>
          <RotateCcw size={14} />
          <span>Reset Template</span>
        </button>
      </div>

      {/* Target Routing Bar */}
      <div className="bento-card" style={{ padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
              MODEL TARGET
            </label>
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="dock-input"
              style={{ width: '220px', padding: '6px 10px', fontSize: '0.82rem', fontWeight: 600 }}
            >
              {models.map(m => (
                <option key={m.name} value={m.name} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
              INVOCATION ROUTE
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setTargetType('ROUTED')}
                className="font-mono"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: targetType === 'ROUTED' ? '1px solid var(--accent-lime)' : '1px solid var(--border-subtle)',
                  background: targetType === 'ROUTED' ? 'var(--accent-lime-dim)' : 'var(--bg-tertiary)',
                  color: targetType === 'ROUTED' ? 'var(--accent-lime)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: targetType === 'ROUTED' ? 700 : 500
                }}
              >
                Traffic-Routed (A/B & Canary)
              </button>

              <button
                onClick={() => setTargetType('DIRECT')}
                className="font-mono"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: targetType === 'DIRECT' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  background: targetType === 'DIRECT' ? 'var(--accent-cyan-dim)' : 'var(--bg-tertiary)',
                  color: targetType === 'DIRECT' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: targetType === 'DIRECT' ? 700 : 500
                }}
              >
                Direct Version Target
              </button>
            </div>
          </div>

          {targetType === 'DIRECT' && currentModelObj && (
            <div>
              <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                SPECIFIC VERSION
              </label>
              <select
                value={directVersion}
                onChange={(e) => setDirectVersion(e.target.value)}
                className="dock-input"
                style={{ width: '130px', padding: '6px 10px', fontSize: '0.82rem', fontWeight: 600 }}
              >
                {currentModelObj.versions.map(v => (
                  <option key={v.version} value={v.version} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {v.version} ({v.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleRunInference}
          disabled={isLoading}
          className="btn-dock btn-lime"
          style={{ padding: '10px 20px', fontSize: '0.88rem' }}
        >
          <Play size={16} fill="currentColor" />
          <span>{isLoading ? 'Executing ONNX...' : 'Run Prediction'}</span>
        </button>
      </div>

      {/* Main 2-Column Grid: JSON Editor (Left) & Live Prediction Inspection (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column: Input Payload Editor */}
        <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} style={{ color: 'var(--accent-lime)' }} />
              <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                Input JSON Payload
              </span>
            </div>
            <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              POST /predict/{selectedModel}
            </span>
          </div>

          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            className="dock-input font-mono"
            style={{
              flex: 1,
              resize: 'none',
              padding: '14px',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              background: 'rgba(0, 0, 0, 0.4)',
              color: '#f8fafc'
            }}
          />

          {errorMsg && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: '4px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)'
            }}>
              {errorMsg}
            </div>
          )}

          {/* cURL Snippet Bar */}
          <div style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-tertiary)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)'
          }}>
            <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '340px' }}>
              cURL: curl -X POST /predict/{selectedModel}...
            </span>
            <button onClick={handleCopyCurl} className="btn-dock btn-ghost" style={{ padding: '2px 8px', fontSize: '0.7rem', gap: '4px' }}>
              {copied ? <Check size={12} style={{ color: 'var(--accent-lime)' }} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Prediction Output Inspector */}
        <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', height: '480px', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span className="font-display" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  Inference Benchmark & Output
                </span>
              </div>

              {response && (
                <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  ID: {response.requestId}
                </span>
              )}
            </div>

            {response ? (
              <div>
                {/* Benchmark Highlights */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  {/* Answering Version */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ANSWERED BY</div>
                    <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-lime)' }}>
                      {response.version}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{response.routedBy}</div>
                  </div>

                  {/* Execution Latency */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>EXECUTION TIME</div>
                    <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      {response.latencyMs} ms
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                      {response.cacheHit ? '⚡ Redis Cache' : 'Core ONNX Tensor'}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>CONFIDENCE</div>
                    <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {((response.confidence ?? 0.92) * 100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-lime)' }}>SLA Optimal</div>
                  </div>
                </div>

                {/* Formatted JSON Output Display */}
                <div>
                  <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Prediction Response Payload:
                  </div>
                  <pre style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    padding: '14px',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: '#a7f3d0',
                    lineHeight: 1.5,
                    maxHeight: '230px',
                    overflowY: 'auto',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    {JSON.stringify(response.predictions, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div style={{
                height: '340px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '20px'
              }}>
                <Cpu size={36} style={{ color: 'var(--border-subtle)', marginBottom: '12px' }} />
                <div className="font-display" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Awaiting Execution
                </div>
                <p style={{ fontSize: '0.78rem', maxWidth: '280px', marginTop: '4px' }}>
                  Click &ldquo;Run Prediction&rdquo; to send payload to the ModelDock inference cluster.
                </p>
              </div>
            )}
          </div>

          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '10px',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Token Bucket: <strong style={{ color: 'var(--accent-lime)' }}>Active (30 ref/s)</strong></span>
            <span>Micrometer Gauge: <strong style={{ color: 'var(--text-primary)' }}>Tracking</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
