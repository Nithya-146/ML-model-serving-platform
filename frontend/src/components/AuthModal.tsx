import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { ShieldCheck, ArrowRight, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ROLE_DEVELOPER');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegister) {
        await register(username, email, password, role);
      } else {
        await login(username, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleQuickLogin = async (usr: string, pass: string) => {
    try {
      await login(usr, pass);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200
    }}>
      <div className="bento-card" style={{ width: '440px', maxWidth: '92vw', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              backgroundColor: 'var(--accent-lime)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#050709'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {isRegister ? 'Register Engineer' : 'Mission Control Login'}
              </h3>
              <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                JWT ROLE-BASED ACCESS CONTROL
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-dock btn-ghost" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Quick Demo Credentials Buttons */}
        <div style={{
          background: 'var(--bg-tertiary)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '18px'
        }}>
          <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Quick 1-Click Role Login:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="btn-dock btn-secondary font-mono"
              style={{ padding: '6px 0', fontSize: '0.72rem' }}
            >
              ADMIN
            </button>
            <button
              onClick={() => handleQuickLogin('developer', 'dev123')}
              className="btn-dock btn-secondary font-mono"
              style={{ padding: '6px 0', fontSize: '0.72rem' }}
            >
              DEVELOPER
            </button>
            <button
              onClick={() => handleQuickLogin('viewer', 'viewer123')}
              className="btn-dock btn-secondary font-mono"
              style={{ padding: '6px 0', fontSize: '0.72rem' }}
            >
              VIEWER
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '4px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            marginBottom: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              USERNAME
            </label>
            <input
              type="text"
              required
              placeholder="Username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="dock-input"
            />
          </div>

          {isRegister && (
            <div>
              <label className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                EMAIL
              </label>
              <input
                type="email"
                required
                placeholder="name@modeldock.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dock-input"
              />
            </div>
          )}

          <div>
            <label className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="dock-input"
            />
          </div>

          {isRegister && (
            <div>
              <label className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                ASSIGNED ROLE
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="dock-input"
              >
                <option value="ROLE_ADMIN">ROLE_ADMIN (Full control)</option>
                <option value="ROLE_DEVELOPER">ROLE_DEVELOPER (Deploy, routes, testing)</option>
                <option value="ROLE_VIEWER">ROLE_VIEWER (Telemetry read-only)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-dock btn-lime" style={{ marginTop: '8px', padding: '10px' }}>
            <span>{isRegister ? 'Create Account' : 'Authenticate Token'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            className="btn-dock btn-ghost font-mono"
            style={{ fontSize: '0.72rem' }}
          >
            {isRegister ? 'Already have credentials? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};
