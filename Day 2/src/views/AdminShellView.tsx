import React, { useState } from 'react';
import type { AdminSubSection } from '../components/Sidebar';
import { AdminSummaryCards, type AdminStats } from '../components/admin/AdminSummaryCards';
import { AdminPlantsTable } from '../components/admin/AdminPlantsTable';
import { AdminUsersView } from '../components/admin/AdminUsersView';
import { AdminRegionsView } from '../components/admin/AdminRegionsView';
import { AdminCoverageView } from '../components/admin/AdminCoverageView';
import { AdminFeaturesView } from '../components/admin/AdminFeaturesView';

export interface AdminShellViewProps {
  activeSection: AdminSubSection;
  onSectionChange?: (section: AdminSubSection) => void;
  onGoToDashboard: () => void;
  theme?: 'dark' | 'light';
}

const MOCK_ADMIN_STATS: AdminStats = {
  users: 5,
  plants: 1768,
  regions: 23,
  activeFeatures: 10,
};

export const AdminShellView: React.FC<AdminShellViewProps> = ({
  activeSection,
  onSectionChange = () => {},
  onGoToDashboard,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [statsState, setStatsState] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal');
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const C = {
    cardBg: isLight ? '#ffffff' : '#0c0c0e',
    panelBg: isLight ? '#f9fafb' : '#111114',
    border: isLight ? '#e5e7eb' : '#1f1f23',
    text: isLight ? '#111827' : '#f4f4f5',
    muted: isLight ? '#6b7280' : '#888891',
    inputBg: isLight ? '#ffffff' : '#18181b',
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleMaintenance = () => {
    setIsMaintenanceActive(!isMaintenanceActive);
    setShowMaintenanceModal(false);
    showToast(
      !isMaintenanceActive
        ? '⚠️ MAINTENANCE MODE ACTIVATED'
        : '✅ Maintenance mode deactivated'
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#18181b',
            color: '#10b981',
            border: '1px solid #10b981',
            borderRadius: '6px',
            padding: '10px 16px',
            fontSize: '12px',
            fontWeight: 700,
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* SECTION: OVERVIEW (Screenshot 1) */}
      {activeSection === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Title & Subtitle (Screenshot 1) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.01em' }}>
                Admin Dashboard
              </h2>
              <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>
                Full system control — all regions, features, and users
              </div>
            </div>

            {/* State Switcher for Training Verification */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: isLight ? '#f1f5f9' : '#141417', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: C.muted, marginRight: '4px' }}>TRAINING FIXTURE STATE:</span>
              {(['normal', 'loading', 'empty', 'error'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setStatsState(mode)}
                  style={{
                    backgroundColor: statsState === mode ? '#f59e0b' : 'transparent',
                    color: statsState === mode ? '#000000' : C.muted,
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '9px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* 4 KPI Summary Cards (Screenshot 1) */}
          <AdminSummaryCards
            stats={MOCK_ADMIN_STATS}
            stateMode={statsState}
            theme={theme}
            onRetry={() => setStatsState('normal')}
          />

          {/* Super Admin Quick Actions Panel (Screenshot 1) */}
          <div
            style={{
              backgroundColor: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              SUPER ADMIN QUICK ACTIONS
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <button
                onClick={() => onSectionChange('features')}
                style={{
                  backgroundColor: isLight ? '#f3f4f6' : '#18181b',
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                ⚙️ Manage Features
              </button>

              <button
                onClick={() => setShowMaintenanceModal(true)}
                style={{
                  backgroundColor: isMaintenanceActive ? 'rgba(239, 68, 68, 0.15)' : (isLight ? '#f3f4f6' : '#18181b'),
                  color: isMaintenanceActive ? '#ef4444' : C.text,
                  border: `1px solid ${isMaintenanceActive ? '#ef4444' : C.border}`,
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                ⚠️ Toggle Maintenance
              </button>

              <button
                onClick={() => onSectionChange('users')}
                style={{
                  backgroundColor: isLight ? '#f3f4f6' : '#18181b',
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                👤 Create Admin User
              </button>
            </div>

            {/* Alert Box (Screenshot 1) */}
            <div
              style={{
                backgroundColor: isMaintenanceActive ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${isMaintenanceActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.25)'}`,
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '11px',
                color: isMaintenanceActive ? '#ef4444' : '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{isMaintenanceActive ? '🛑' : '⚠️'}</span>
              <span>
                <strong>Maintenance Mode is currently {isMaintenanceActive ? 'ENABLED' : 'DISABLED'}.</strong>{' '}
                {isMaintenanceActive
                  ? 'All public forecasts and non-admin queries are suspended.'
                  : 'Enabling it will block access to non-admin users.'}
              </span>
            </div>
          </div>

          {/* Quick Plants Overview Table (Screenshot 1 lower view) */}
          <AdminPlantsTable theme={theme} />
        </div>
      )}

      {/* SECTION: USERS (Screenshot 2) */}
      {activeSection === 'users' && <AdminUsersView theme={theme} />}

      {/* SECTION: PLANTS (Screenshot 3) */}
      {activeSection === 'plants' && <AdminPlantsTable theme={theme} />}

      {/* SECTION: REGIONS (Screenshot 4) */}
      {activeSection === 'regions' && <AdminRegionsView theme={theme} />}

      {/* SECTION: LIVE ACTUALS COVERAGE (Screenshot 5) */}
      {activeSection === 'coverage' && <AdminCoverageView theme={theme} />}

      {/* SECTION: FEATURES & MAINTENANCE */}
      {activeSection === 'features' && <AdminFeaturesView theme={theme} />}

      {/* Maintenance Confirmation Modal */}
      {showMaintenanceModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
          onClick={() => setShowMaintenanceModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#121215',
              border: '1px solid #27272a',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '440px',
              padding: '20px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f4f4f5' }}>
                {isMaintenanceActive ? 'Deactivate Maintenance Mode?' : 'Activate System Maintenance?'}
              </h3>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                style={{ background: 'none', border: 'none', color: '#71717a', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              {isMaintenanceActive
                ? 'Deactivating maintenance mode will restore public access to live grid forecasting streams and SLDC portals.'
                : 'Activating maintenance mode will immediately block access for non-admin users and display a maintenance notice.'}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                style={{
                  backgroundColor: '#27272a',
                  color: '#f4f4f5',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleToggleMaintenance}
                style={{
                  backgroundColor: isMaintenanceActive ? '#10b981' : '#ef4444',
                  color: isMaintenanceActive ? '#000000' : '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isMaintenanceActive ? 'Confirm Deactivation' : 'Confirm Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
