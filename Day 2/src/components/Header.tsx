import React from 'react';

export interface HeaderProps {
  activeView: 'dashboard' | 'admin' | 'login';
  onViewChange: (view: 'dashboard' | 'admin' | 'login') => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  vizState?: 'normal' | 'loading' | 'error';
  onVizStateChange?: (state: 'normal' | 'loading' | 'error') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  theme,
  onThemeToggle,
  onMobileMenuToggle,
  isMobileMenuOpen,
}) => {
  const isLight = theme === 'light';

  return (
    <header
      style={{
        backgroundColor: isLight ? '#ffffff' : '#000000',
        borderBottom: `1px solid ${isLight ? '#e4e4e7' : '#1f1f23'}`,
        padding: '6px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '52px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {activeView === 'admin' ? (
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Hamburger, GI Brand, ADMIN PANEL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={onMobileMenuToggle}
              style={{
                background: 'none',
                border: 'none',
                color: isLight ? '#09090b' : '#ffffff',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
              }}
              title="Toggle sidebar"
            >
              ☰
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#f59e0b', letterSpacing: '0.05em' }}>
                GI
              </span>
              <span style={{ fontSize: '11px', color: '#52525b' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: '#f59e0b', fontSize: '12px' }}>🛡️</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ADMIN PANEL
                </span>
              </div>
            </div>
          </div>

          {/* Right: Notification bell, Super Admin, Orange Pill, Return button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#71717a', fontSize: '14px', cursor: 'pointer' }} title="Notifications">
              🔔
            </span>
            <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Super Admin</span>
            <span
              style={{
                backgroundColor: '#f59e0b',
                color: '#000000',
                fontSize: '10.5px',
                fontWeight: 800,
                borderRadius: '9999px',
                padding: '3px 10px',
                letterSpacing: '0.02em',
              }}
            >
              Super Admin
            </span>
            <button
              onClick={() => onViewChange('dashboard')}
              style={{
                backgroundColor: '#18181b',
                color: '#e4e4e7',
                border: '1px solid #3f3f46',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '10.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: '6px',
              }}
              title="Return to Live Forecast Portal"
            >
              <span>←</span> Forecasting Portal
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Left: Official IIT Bombay Circular Emblem */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, zIndex: 10 }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                boxSizing: 'border-box',
              }}
            >
              <img
                src="/images/iitb.jpg"
                alt="IIT Bombay Emblem"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '50%',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Center: Title & Subtitle (Matching Screenshot 1:1) */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              width: 'auto',
              pointerEvents: 'none',
            }}
          >
            <h1
              style={{
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '0.02em',
                color: isLight ? '#09090b' : '#ffffff',
                margin: 0,
                whiteSpace: 'nowrap',
              }}
            >
              GI-IITB (GRID-INDIA IITB) Experimental Forecast
            </h1>
            <p
              style={{
                fontSize: '8.5px',
                fontWeight: 600,
                letterSpacing: '0.22em',
                color: isLight ? '#6b7280' : '#888891',
                margin: '2px 0 0 0',
                textTransform: 'uppercase',
              }}
            >
              NOWCASTING • INTRA • MEDIUM
            </p>
          </div>

          {/* Right: Official GRID-INDIA White Rectangle Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, zIndex: 10 }}>
            <div
              style={{
                height: '36px',
                width: '120px',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                padding: '2px 8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              <img
                src="/images/grid_india.png"
                alt="GRID-INDIA Logo"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
