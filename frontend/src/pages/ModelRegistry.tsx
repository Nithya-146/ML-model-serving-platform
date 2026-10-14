import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ModelDetail } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  UploadCloud, 
  CheckCircle, 
  FileCode, 
  Cpu, 
  Plus, 
  X
} from 'lucide-react';

export const ModelRegistry: React.FC = () => {
  const { role } = useAuth();
  const [models, setModels] = useState<ModelDetail[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelDetail | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Model Form State
  const [name, setName] = useState('');
  const [version, setVersion] = useState('v1.0.0');
  const [description, setDescription] = useState('');
  const [inputShape, setInputShape] = useState('[-1, 4]');
  const [outputShape, setOutputShape] = useState('[-1, 1]');
  const [inputFeatures, setInputFeatures] = useState('feature1, feature2, feature3, feature4');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    const list = await api.getModels();
    setModels(list);
    if (list.length > 0 && !selectedModel) {
      setSelectedModel(list[0]);
    }
  };

  const handleCreateNewModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const features = inputFeatures.split(',').map(s => s.trim()).filter(Boolean);
    const properties: Record<string, any> = {};
    features.forEach(f => {
      properties[f] = { type: 'number', description: `${f} value` };
    });

    const inputSchemaObj = {
      type: 'object',
      properties,
      required: features.slice(0, 2)
    };

    const outputSchemaObj = {
      type: 'object',
      properties: {
        prediction: { type: 'number' },
        confidence: { type: 'number' }
      }
    };

    await api.createModel({
      name,
      description,
      framework: 'ONNX',
      version,
      inputShape,
      outputShape,
      inputSchema: inputSchemaObj,
      outputSchema: outputSchemaObj
    });

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setShowUploadModal(false);
      loadModels();
      setName('');
      setDescription('');
    }, 1200);
  };

  const canUpload = role === 'ROLE_ADMIN' || role === 'ROLE_DEVELOPER';

  return (
    <div className="animate-fade-in" style={{ padding: '24px 32px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Model Registry & Versioning
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Artifact repository, ONNX runtime signatures, input/output tensor schemas, and version lineage.
          </p>
        </div>

        <div>
          {canUpload ? (
            <button onClick={() => setShowUploadModal(true)} className="btn-dock btn-lime">
              <Plus size={16} />
              <span>Deploy New Model</span>
            </button>
          ) : (
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Viewer mode: upload restricted)
            </span>
          )}
        </div>
      </div>

      {/* Main Layout: Model Selector Sidebar + Detailed Version Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        {/* Left Column: Registered Models List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-lime)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            // REGISTERED MODELS ({models.length})
          </div>

          {models.map((m) => {
            const isSelected = selectedModel?.name === m.name;
            return (
              <div
                key={m.name}
                onClick={() => setSelectedModel(m)}
                className="bento-card"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--accent-lime)' : 'var(--border-subtle)',
                  background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 0 16px rgba(204, 255, 0, 0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="font-display" style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                    {m.name}
                  </span>
                  <span className="status-pill status-active" style={{ fontSize: '0.65rem' }}>
                    {m.status}
                  </span>
                </div>

                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                  {m.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{m.framework}</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>{m.versions.length} versions deployed</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Version Timeline & Schema Inspector */}
        {selectedModel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Model Overview Banner */}
            <div className="bento-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Cpu size={22} style={{ color: 'var(--accent-lime)' }} />
                  <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                    {selectedModel.name}
                  </h2>
                </div>
                <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Active Serving Target: <strong style={{ color: 'var(--accent-lime)' }}>{selectedModel.activeVersion}</strong>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {selectedModel.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FRAMEWORK</div>
                  <div className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedModel.framework}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>TOTAL VERSIONS</div>
                  <div className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{selectedModel.versions.length}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>INGRESS ENDPOINT</div>
                  <div className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-lime)' }}>/predict/{selectedModel.name}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>LAST SYNCED</div>
                  <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{new Date(selectedModel.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Version Timeline */}
            <div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-lime)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.06em' }}>
                // VERSION LINEAGE & SCHEMA SIGNATURES
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedModel.versions.map((ver, idx) => (
                  <div key={ver.version} className="bento-card" style={{ position: 'relative' }}>
                    {/* Top Row: Version Header & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="font-mono" style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: ver.status === 'CANARY' ? 'var(--accent-cyan)' : 'var(--accent-lime)'
                        }}>
                          {ver.version}
                        </span>

                        <span className={`status-pill ${ver.status === 'CANARY' ? 'status-canary' : 'status-active'}`}>
                          {ver.status}
                        </span>

                        {idx === 0 && (
                          <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            (Current Production Target)
                          </span>
                        )}
                      </div>

                      <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Uploaded: {new Date(ver.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>INPUT TENSOR SHAPE:</span>
                        <div className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ver.inputShape || '[-1, 4]'}</div>
                      </div>
                      <div style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>OUTPUT TENSOR SHAPE:</span>
                        <div className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ver.outputShape || '[-1, 1]'}</div>
                      </div>
                      <div style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ARTIFACT SIZE:</span>
                        <div className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                          {ver.fileSizeBytes ? `${(ver.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB` : '1.45 MB'}
                        </div>
                      </div>
                    </div>

                    {/* Schema Inspector */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <FileCode size={13} style={{ color: 'var(--accent-lime)' }} />
                          <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Input Schema Definition</span>
                        </div>
                        <pre style={{
                          background: 'rgba(0, 0, 0, 0.4)',
                          padding: '10px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#bbf7d0',
                          overflowX: 'auto',
                          maxHeight: '130px',
                          border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                          {ver.inputSchema || '{"type": "object", "properties": {"features": {"type": "array"}}}'}
                        </pre>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <FileCode size={13} style={{ color: 'var(--accent-cyan)' }} />
                          <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Output Schema Definition</span>
                        </div>
                        <pre style={{
                          background: 'rgba(0, 0, 0, 0.4)',
                          padding: '10px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#bae6fd',
                          overflowX: 'auto',
                          maxHeight: '130px',
                          border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                          {ver.outputSchema || '{"type": "object", "properties": {"prediction": {"type": "number"}}}'}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload & Model Deploy Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="bento-card" style={{ width: '540px', maxWidth: '90vw', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  Deploy ONNX Model
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Register model metadata, tensor shapes, and input schemas to the ModelDock cluster.
                </p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="btn-dock btn-ghost" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {uploadSuccess ? (
              <div style={{ padding: '30px', textAlign: 'center' }}>
                <CheckCircle size={36} style={{ color: 'var(--accent-lime)', margin: '0 auto 12px auto' }} />
                <h4 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  Model Pipeline Registered Successfully!
                </h4>
                <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Routes and schemas compiled into registry.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateNewModel} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    MODEL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. recommendation-engine"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="dock-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      INITIAL VERSION *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="v1.0.0"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="dock-input"
                    />
                  </div>
                  <div>
                    <label className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      FRAMEWORK
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="ONNX v1.18"
                      className="dock-input"
                      style={{ opacity: 0.8 }}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the model task, training objective, and intended domain..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="dock-input"
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      INPUT TENSOR SHAPE
                    </label>
                    <input
                      type="text"
                      value={inputShape}
                      onChange={(e) => setInputShape(e.target.value)}
                      className="dock-input"
                    />
                  </div>
                  <div>
                    <label className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      OUTPUT TENSOR SHAPE
                    </label>
                    <input
                      type="text"
                      value={outputShape}
                      onChange={(e) => setOutputShape(e.target.value)}
                      className="dock-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    INPUT FEATURES (COMMA-SEPARATED)
                  </label>
                  <input
                    type="text"
                    value={inputFeatures}
                    onChange={(e) => setInputFeatures(e.target.value)}
                    className="dock-input"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowUploadModal(false)} className="btn-dock btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-dock btn-lime">
                    <UploadCloud size={16} />
                    <span>Deploy Model</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
