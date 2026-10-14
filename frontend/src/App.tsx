import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LiveStreamProvider } from './context/LiveStreamContext';
import { Sidebar } from './components/Sidebar';
import { StatusTicker } from './components/StatusTicker';
import { AuthModal } from './components/AuthModal';
import { CommandCenter } from './pages/CommandCenter';
import { ModelRegistry } from './pages/ModelRegistry';
import { TrafficLab } from './pages/TrafficLab';
import { Playground } from './pages/Playground';
import { LogsAlerts } from './pages/LogsAlerts';
import { LogIn, UserCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('command');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const { user, isAuthenticated } = useAuth();

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Persistent Left Rail Navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Viewport Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Status Ticker Bar */}
        <StatusTicker />

        {/* Global Navigation Action Header */}
        <div style={{
          height: '46px',
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>VIEWPORT //</span>
            <span className="font-display" style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
              {currentTab === 'command' && 'Command Center'}
              {currentTab === 'models' && 'Model Registry'}
              {currentTab === 'traffic' && 'Traffic Lab (A/B & Canary)'}
              {currentTab === 'playground' && 'Interactive Inference Playground'}
              {currentTab === 'logs' && 'Inference Logs & Alerts'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Signed in as <strong style={{ color: 'var(--accent-lime)' }}>{user?.username}</strong>
                </span>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-dock btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                >
                  <UserCheck size={12} style={{ color: 'var(--accent-lime)' }} />
                  <span>Account</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-dock btn-lime"
                style={{ padding: '4px 12px', fontSize: '0.72rem' }}
              >
                <LogIn size={12} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Page Content Scroll Area */}
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          {currentTab === 'command' && <CommandCenter onNavigate={setCurrentTab} />}
          {currentTab === 'models' && <ModelRegistry />}
          {currentTab === 'traffic' && <TrafficLab />}
          {currentTab === 'playground' && <Playground />}
          {currentTab === 'logs' && <LogsAlerts />}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LiveStreamProvider>
          <AppContent />
        </LiveStreamProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
