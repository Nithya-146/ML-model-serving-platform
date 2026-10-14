import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Layers, 
  GitFork, 
  Terminal, 
  ScrollText, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Box, 
  UserCircle 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, role, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'command', label: 'Command Center', icon: LayoutDashboard, badge: 'LIVE' },
    { id: 'models', label: 'Model Registry', icon: Layers, badge: '3' },
    { id: 'traffic', label: 'Traffic Lab', icon: GitFork, badge: 'A/B' },
    { id: 'playground', label: 'Playground', icon: Terminal, badge: null },
    { id: 'logs', label: 'Logs & Alerts', icon: ScrollText, badge: null },
  ];

  const handleRoleToggle = (newRole: UserRole) => {
    switchRole(newRole);
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 16px',
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Top Branding */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', paddingLeft: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--accent-lime)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#050709',
            boxShadow: '0 0 16px rgba(204, 255, 0, 0.4)'
          }}>
            <Box size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
              Model<span style={{ color: 'var(--accent-lime)' }}>Dock</span>
            </div>
            <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Mission Control v1.0
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'var(--accent-lime-dim)' : 'transparent',
                  color: isActive ? 'var(--accent-lime)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(204, 255, 0, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="font-mono" style={{
                    fontSize: '0.68rem',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: isActive ? 'var(--accent-lime)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#000000' : 'var(--text-muted)',
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Role Switcher & Theme */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
        {/* Role Inspector & Quick Switcher */}
        <div style={{
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCircle size={14} style={{ color: 'var(--accent-lime)' }} />
              <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {user?.username || 'engineer'}
              </span>
            </div>
            <span className="status-pill status-active" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
              {role.replace('ROLE_', '')}
            </span>
          </div>

          <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Simulate Role Access:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {(['ROLE_ADMIN', 'ROLE_DEVELOPER', 'ROLE_VIEWER'] as UserRole[]).map((r) => {
              const active = role === r;
              const short = r.replace('ROLE_', '').slice(0, 3);
              return (
                <button
                  key={r}
                  onClick={() => handleRoleToggle(r)}
                  className="font-mono"
                  style={{
                    padding: '3px 0',
                    fontSize: '0.65rem',
                    borderRadius: '4px',
                    border: active ? '1px solid var(--accent-lime)' : '1px solid var(--border-subtle)',
                    background: active ? 'var(--accent-lime-dim)' : 'transparent',
                    color: active ? 'var(--accent-lime)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: active ? 700 : 500
                  }}
                >
                  {short}
                </button>
              );
            })}
          </div>
        </div>

        {/* Theme and Mode Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={toggleTheme}
            className="btn-dock btn-ghost"
            style={{ padding: '6px 10px', fontSize: '0.75rem', gap: '6px' }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Graphite'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent-lime)' }} />
            <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              JWT SECURE
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
