import React from 'react';

export interface AdminStats {
  users: number;
  plants: number;
  regions: number;
  activeFeatures: number;
}

export interface AdminSummaryCardsProps {
  stats: AdminStats | null;
  stateMode?: 'normal' | 'loading' | 'empty' | 'error';
  theme?: 'dark' | 'light';
  onRetry?: () => void;
}

export const AdminSummaryCards: React.FC<AdminSummaryCardsProps> = ({
  stats,
  stateMode = 'normal',
  theme = 'dark',
  onRetry,
}) => {
  const isLight = theme === 'light';

  const C = {
    cardBg: isLight ? '#ffffff' : '#111114',
    border: isLight ? '#e5e7eb' : '#222226',
    text: isLight ? '#111827' : '#f4f4f5',
    muted: isLight ? '#6b7280' : '#71717a',
    amber: '#f59e0b',
    green: '#10b981',
    violet: '#8b5cf6',
    blue: '#38bdf8',
  };

  // State: Loading Skeleton
  if (stateMode === 'loading') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              padding: '16px 18px',
              minHeight: '85px',
            }}
          >
            <div style={{ width: '60px', height: '10px', backgroundColor: isLight ? '#e5e7eb' : '#27272a', borderRadius: '4px', marginBottom: '10px' }} />
            <div style={{ width: '80px', height: '24px', backgroundColor: isLight ? '#e5e7eb' : '#27272a', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    );
  }

  // State: Error Fallback
  if (stateMode === 'error') {
    return (
      <div
        role="alert"
        style={{
          backgroundColor: isLight ? '#fef2f2' : '#1c1012',
          border: '1px solid #ef4444',
          borderRadius: '10px',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div>
          <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700 }}>Telemetry Sync Failure</span>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#a1a1aa' }}>
            Unable to query simulated admin KPI metrics from telemetry cluster.
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // State: Empty
  const defaultStats: AdminStats = stats || {
    users: 0,
    plants: 0,
    regions: 0,
    activeFeatures: 0,
  };

  const cards = [
    { label: 'USERS', value: stateMode === 'empty' ? '—' : defaultStats.users, color: '#f59e0b', icon: '👥' },
    { label: 'PLANTS', value: stateMode === 'empty' ? '—' : defaultStats.plants.toLocaleString(), color: '#10b981', icon: '⚡' },
    { label: 'REGIONS', value: stateMode === 'empty' ? '—' : defaultStats.regions, color: '#8b5cf6', icon: '🗺️' },
    { label: 'ACTIVE FEATURES', value: stateMode === 'empty' ? '—' : (defaultStats.activeFeatures || 10), color: '#38bdf8', icon: '📈' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px', width: '100%' }}>
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            backgroundColor: isLight ? '#ffffff' : '#0c0c0e',
            border: `1px solid ${isLight ? '#e4e4e7' : '#1f1f23'}`,
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              backgroundColor: `${c.color}18`,
              border: `1px solid ${c.color}35`,
              borderRadius: '8px',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            {c.icon}
          </div>
          <div>
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: 800,
                color: '#71717a',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '2px',
              }}
            >
              {c.label}
            </span>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
              {c.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

