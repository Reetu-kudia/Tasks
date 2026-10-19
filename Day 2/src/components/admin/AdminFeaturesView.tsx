import React, { useState } from 'react';

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  category: 'CORE' | 'AI_ML' | 'SCADA' | 'REPORTING';
  description: string;
  enabled: boolean;
  requiresRestart: boolean;
}

export interface AdminFeaturesViewProps {
  theme?: 'dark' | 'light';
}

const DEFAULT_FEATURES: FeatureFlag[] = [
  { id: 'f-1', name: 'Intraday Nowcasting Engine (15-min)', key: 'NOWCASTING_15M', category: 'CORE', description: 'Continuously updates 15-minute rolling horizon predictions using satellite cloud tracking.', enabled: true, requiresRestart: false },
  { id: 'f-2', name: 'GHI Cloud Optical Depth Radiative Model', key: 'GHI_OPTICAL_DEPTH', category: 'AI_ML', description: 'Computes Global Horizontal Irradiance via cloud optical depth and atmospheric radiative transfer.', enabled: true, requiresRestart: false },
  { id: 'f-3', name: 'Real-time SCADA Discrepancy Alerting', key: 'SCADA_ALERTING', category: 'SCADA', description: 'Triggers priority alarm notifications when actual vs predicted generation breaches 15% threshold.', enabled: true, requiresRestart: false },
  { id: 'f-4', name: 'Automated Day-Ahead Schedule Submission', key: 'AUTO_SCHEDULE_SUBMIT', category: 'CORE', description: 'Auto-delivers 96-block generation schedules directly to RLDC/SLDC scheduling portals.', enabled: true, requiresRestart: true },
  { id: 'f-5', name: 'Loss of Telemetry Fallback Predictor', key: 'TELEMETRY_FALLBACK', category: 'SCADA', description: 'Synthetic generation estimator based on neighboring plants when RTU or SCADA fails.', enabled: true, requiresRestart: false },
  { id: 'f-6', name: 'Regional Aggregated Dispatch Forecasting', key: 'REGIONAL_AGG_DISPATCH', category: 'CORE', description: 'Hierarchical aggregation across pooling stations, states, and regional grid control areas.', enabled: true, requiresRestart: false },
  { id: 'f-7', name: 'Extreme Weather & Dust Ramp Warnings', key: 'EXTREME_WEATHER_RAMP', category: 'AI_ML', description: 'Predicts abrupt wind curtailment and solar soiling dust storms 6 hours in advance.', enabled: true, requiresRestart: false },
  { id: 'f-8', name: 'Multi-Model Ensemble Weighting (AI/ML)', key: 'AI_ENSEMBLE_WEIGHT', category: 'AI_ML', description: 'Dynamically balances NWP, ECMWF, GFS, and local physics-informed neural network weights.', enabled: true, requiresRestart: false },
  { id: 'f-9', name: 'ISTS Pooling Station Virtual Metering', key: 'ISTS_VIRTUAL_METER', category: 'SCADA', description: 'Virtual check-meter calculation for inter-state transmission pooling buses.', enabled: true, requiresRestart: false },
  { id: 'f-10', name: 'Automated Excel / CSV Generation Export', key: 'EXCEL_EXPORT_PIPELINE', category: 'REPORTING', description: 'Scheduled daily export of forecast vs actual generation tables for grid compliance.', enabled: true, requiresRestart: false },
];

export const AdminFeaturesView: React.FC<AdminFeaturesViewProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [features, setFeatures] = useState<FeatureFlag[]>(DEFAULT_FEATURES);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
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

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextVal = !f.enabled;
          showToast(`Feature "${f.name}" ${nextVal ? 'ENABLED' : 'DISABLED'}`);
          return { ...f, enabled: nextVal };
        }
        return f;
      })
    );
  };

  const confirmMaintenanceToggle = () => {
    setMaintenanceMode(!maintenanceMode);
    setShowMaintenanceModal(false);
    showToast(
      !maintenanceMode
        ? '⚠️ MAINTENANCE MODE ACTIVATED — Non-admin sessions restricted'
        : '✅ Maintenance mode deactivated — System fully operational'
    );
  };

  const enabledCount = features.filter((f) => f.enabled).length;

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

      {/* Title & Maintenance Mode Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.text, margin: 0 }}>
            Features &amp; Maintenance Settings
          </h2>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>
            <span>{enabledCount} of {features.length} features active · </span>
            <span style={{ color: maintenanceMode ? '#ef4444' : '#10b981', fontWeight: 700 }}>
              {maintenanceMode ? 'SYSTEM IN MAINTENANCE MODE' : 'SYSTEM OPERATIONAL'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowMaintenanceModal(true)}
          style={{
            backgroundColor: maintenanceMode ? '#10b981' : 'rgba(239, 68, 68, 0.15)',
            color: maintenanceMode ? '#000000' : '#ef4444',
            border: `1px solid ${maintenanceMode ? '#10b981' : '#ef4444'}`,
            borderRadius: '6px',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>{maintenanceMode ? '🟢 Deactivate Maintenance' : '⚠️ Toggle Maintenance Mode'}</span>
        </button>
      </div>

      {/* Maintenance Mode Warning Notice */}
      <div
        style={{
          backgroundColor: maintenanceMode ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.08)',
          border: `1px solid ${maintenanceMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.25)'}`,
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '20px' }}>{maintenanceMode ? '🛑' : '⚠️'}</span>
        <div style={{ fontSize: '11px', lineHeight: 1.5 }}>
          <strong style={{ color: maintenanceMode ? '#ef4444' : '#f59e0b' }}>
            {maintenanceMode
              ? 'Maintenance Mode is currently ACTIVE.'
              : 'Maintenance Mode is currently DISABLED.'}
          </strong>{' '}
          <span style={{ color: C.muted }}>
            {maintenanceMode
              ? 'All external SLDC connections and non-super-admin sessions are temporarily suspended.'
              : 'Enabling it will display a maintenance notice to standard users while allowing administrative debugging.'}
          </span>
        </div>
      </div>

      {/* Features Grid */}
      <div
        style={{
          backgroundColor: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: '8px',
          padding: '16px',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '12px' }}>
          Configurable Pipeline &amp; Algorithmic Feature Gates
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '12px' }}>
          {features.map((feat) => (
            <div
              key={feat.id}
              style={{
                backgroundColor: C.panelBg,
                border: `1px solid ${C.border}`,
                borderRadius: '6px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>
                    {feat.name}
                  </span>
                  {/* Switch */}
                  <label style={{ position: 'relative', display: 'inline-block', width: '34px', height: '18px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={feat.enabled}
                      onChange={() => toggleFeature(feat.id)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        inset: 0,
                        backgroundColor: feat.enabled ? '#10b981' : '#3f3f46',
                        transition: '0.2s',
                        borderRadius: '18px',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          height: '14px',
                          width: '14px',
                          left: feat.enabled ? '17px' : '2px',
                          bottom: '2px',
                          backgroundColor: '#ffffff',
                          transition: '0.2s',
                          borderRadius: '50%',
                        }}
                      />
                    </span>
                  </label>
                </div>

                <div style={{ fontSize: '10px', color: '#71717a', fontFamily: 'monospace', marginBottom: '6px' }}>
                  KEY: {feat.key}
                </div>

                <p style={{ fontSize: '11px', color: C.muted, margin: 0, lineHeight: 1.4 }}>
                  {feat.description}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', borderTop: `1px solid ${C.border}`, paddingTop: '8px' }}>
                <span style={{ color: '#a855f7', fontWeight: 700 }}>
                  CATEGORY: {feat.category}
                </span>
                <span style={{ color: feat.enabled ? '#10b981' : '#71717a', fontWeight: 700 }}>
                  {feat.enabled ? '● ONLINE' : '○ DISABLED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

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
                {maintenanceMode ? 'Deactivate Maintenance Mode?' : 'Activate System Maintenance?'}
              </h3>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                style={{ background: 'none', border: 'none', color: '#71717a', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              {maintenanceMode
                ? 'Deactivating maintenance mode will restore public access to live grid forecasting streams and SLDC portals.'
                : 'Activating maintenance mode will immediately terminate non-admin websockets and show a temporary maintenance notification to external grid operators.'}
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
                onClick={confirmMaintenanceToggle}
                style={{
                  backgroundColor: maintenanceMode ? '#10b981' : '#ef4444',
                  color: maintenanceMode ? '#000000' : '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {maintenanceMode ? 'Confirm Deactivation' : 'Confirm Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

