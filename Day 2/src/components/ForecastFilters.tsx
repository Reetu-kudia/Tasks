import React from 'react';

export interface FilterState {
  generationType: 'Solar' | 'Wind' | 'Hydro';
  region: string;
  category: 'State' | 'ISTS';
  state: string;
  poolingStation?: string;
  plant: string;
  forecastingType: 'Nowcasting' | 'Intra' | 'Medium';
  runDate: string;
  revision: 'Latest' | 'Rev 0' | 'Rev 1' | 'Rev 2';
}

export interface ForecastFiltersProps {
  filters: FilterState;
  appliedFilters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onApply: () => void;
  onReset?: () => void;
  onGoToAdmin: () => void;
  onThemeToggle: () => void;
  onLogout: () => void;
  theme?: 'dark' | 'light';
}

export const ForecastFilters: React.FC<ForecastFiltersProps> = ({
  filters,
  appliedFilters,
  onChange,
  onApply,
  onGoToAdmin,
  onThemeToggle,
  onLogout,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  const C = {
    cardBg: isLight ? '#ffffff' : '#000000',
    border: isLight ? '#e4e4e7' : '#222226',
    inputBg: isLight ? '#f9fafb' : '#0f0f12',
    inputBorder: isLight ? '#d1d5db' : '#27272a',
    text: isLight ? '#111827' : '#ffffff',
    muted: isLight ? '#6b7280' : '#888891',
    label: isLight ? '#4b5563' : '#a1a1aa',
    summaryBg: isLight ? '#f9fafb' : '#08080a',
    amber: '#f59e0b',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: C.inputBg,
    border: `1px solid ${C.inputBorder}`,
    borderRadius: '6px',
    padding: '4px 8px',
    color: C.text,
    fontSize: '11px',
    outline: 'none',
    cursor: 'pointer',
    height: '28px',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '9.5px',
    fontWeight: 700,
    color: C.label,
    marginBottom: '3px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <div
      style={{
        backgroundColor: C.cardBg,
        border: `1px solid ${C.border}`,
        borderRadius: '8px',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* Top Header: CONTROLS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: C.text,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          CONTROLS
        </span>
      </div>

      {/* Row 1: Generation Type, Region, State / ISTS Category (Matching Screenshot 1:1) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.4fr 1.2fr',
          gap: '8px',
        }}
      >
        <div>
          <label style={labelStyle}>Generation Type</label>
          <select
            value={filters.generationType}
            onChange={(e) => onChange({ generationType: e.target.value as FilterState['generationType'] })}
            style={selectStyle}
          >
            <option value="Solar">Solar</option>
            <option value="Wind">Wind</option>
            <option value="Hydro">Hydro</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Region</label>
          <select
            value={filters.region}
            onChange={(e) => onChange({ region: e.target.value })}
            style={selectStyle}
          >
            <option value="All Grids">All Grids</option>
            <option value="Western Region">Western Region</option>
            <option value="Southern Region">Southern Region</option>
            <option value="Northern Region">Northern Region</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>State / ISTS Category</label>
          <select
            value={filters.category}
            onChange={(e) => {
              const newCat = e.target.value as 'State' | 'ISTS';
              if (newCat === 'ISTS') {
                onChange({
                  category: 'ISTS',
                  poolingStation: 'All Pooling Stations',
                  plant: 'AGE24AL_PSS3_KPS1_S',
                  forecastingType: 'Intra',
                });
              } else {
                onChange({
                  category: 'State',
                  state: 'All States',
                  plant: 'All Plants',
                  forecastingType: 'Nowcasting',
                });
              }
            }}
            style={selectStyle}
          >
            <option value="State">State</option>
            <option value="ISTS">ISTS</option>
          </select>
        </div>
      </div>

      {/* Row 2: Dynamic (Pooling Station or State), Plant, Run date, Forecasting Type, Revision */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1.3fr 1.3fr 1.1fr 1.1fr',
          gap: '6px',
        }}
      >
        {filters.category === 'ISTS' ? (
          <div>
            <label style={labelStyle}>Pooling Station</label>
            <select
              value={filters.poolingStation || 'All Pooling Stations'}
              onChange={(e) => onChange({ poolingStation: e.target.value })}
              style={selectStyle}
            >
              <option value="All Pooling Stations">All Pooling Stations</option>
              <option value="Khavda PSS-1">Khavda PSS-1</option>
              <option value="Fatehgarh PSS-2">Fatehgarh PSS-2</option>
              <option value="Bhadla PSS">Bhadla PSS</option>
              <option value="Nagda PSS">Nagda PSS</option>
            </select>
          </div>
        ) : (
          <div>
            <label style={labelStyle}>State</label>
            <select
              value={filters.state}
              onChange={(e) => onChange({ state: e.target.value })}
              style={selectStyle}
            >
              <option value="All States">All States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Rajasthan">Rajasthan</option>
            </select>
          </div>
        )}

        <div>
          <label style={labelStyle}>Plant</label>
          <select
            value={filters.plant}
            onChange={(e) => onChange({ plant: e.target.value })}
            style={selectStyle}
          >
            {filters.category === 'ISTS' ? (
              <>
                <option value="AGE24AL_PSS3_KPS1_S">AGE24AL_PSS3___</option>
                <option value="All Plants">All Plants</option>
                <option value="CHARANKA_SOLAR_PARK">CHARANKA_SOLAR_PARK</option>
                <option value="BHADLA_SOLAR_PARK">BHADLA_SOLAR_PARK</option>
                <option value="220_33KV_BAKTAPUR">220_33KV_BAKTAPUR</option>
              </>
            ) : (
              <>
                <option value="All Plants">All Plants (1698)</option>
                <option value="AGE24AL_PSS3_KPS1_S">AGE24AL_PSS3___</option>
                <option value="220_33KV_BAKTAPUR">220_33KV_BAKTAPUR</option>
                <option value="400KV_NAGDA">400KV_NAGDA</option>
                <option value="33_KV_LASOOR">33_KV_LASOOR</option>
                <option value="ABReL_SPV2_(Malotra)">ABReL_SPV2_(Malotra)</option>
                <option value="BHADLA_SOLAR_PARK">BHADLA_SOLAR_PARK</option>
                <option value="CHARANKA_SOLAR_PARK">CHARANKA_SOLAR_PARK</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Run date</label>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={filters.runDate}
              onChange={(e) => onChange({ runDate: e.target.value })}
              style={{
                ...selectStyle,
                paddingLeft: '6px',
                fontSize: '10.5px',
                colorScheme: isLight ? 'light' : 'dark',
              }}
            />
          </div>
          <span style={{ fontSize: '8px', color: '#eab308', display: 'block', marginTop: '1px' }}>
            {filters.category === 'ISTS'
              ? '2026 08 25 — 2026 10 18-56 dates'
              : '2025-08-29 → 2026-10-18: 51 dates'}
          </span>
        </div>

        <div>
          <label style={labelStyle}>Forecasting Type</label>
          <select
            value={filters.forecastingType}
            onChange={(e) => onChange({ forecastingType: e.target.value as FilterState['forecastingType'] })}
            style={selectStyle}
          >
            <option value="Nowcasting">Nowcasting</option>
            <option value="Intra">Intra</option>
            <option value="Medium">Medium</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Revision</label>
          <select
            value={filters.revision}
            onChange={(e) => onChange({ revision: e.target.value as FilterState['revision'] })}
            style={selectStyle}
          >
            <option value="Latest">Latest ({filters.runDate})</option>
            <option value="Rev 0">Rev 0</option>
            <option value="Rev 1">Rev 1</option>
            <option value="Rev 2">Rev 2</option>
          </select>
        </div>
      </div>

      {/* SELECTION SUMMARY Box with Apply to Dashboard button & Auto-refresh (Matching Screenshot 1 & 3) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: C.summaryBg,
          border: `1px solid ${C.inputBorder}`,
          borderRadius: '6px',
          padding: '7px 10px',
        }}
      >
        {/* Left: 4 columns x 2 rows Key-Value Grid */}
        <div style={{ flex: '1 1 auto' }}>
          <div
            style={{
              fontSize: '8.5px',
              fontWeight: 800,
              color: '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '3px',
            }}
          >
            SELECTION SUMMARY
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2px 8px',
              fontSize: '9.5px',
            }}
          >
            <div>
              <span style={{ color: '#71717a', fontSize: '8px' }}>GENERATION: </span>
              <strong style={{ color: C.text }}>{appliedFilters.generationType}</strong>
            </div>
            <div>
              <span style={{ color: '#71717a', fontSize: '8px' }}>MODEL: </span>
              <strong style={{ color: C.text }}>{appliedFilters.forecastingType}</strong>
            </div>
            <div>
              <span style={{ color: '#71717a', fontSize: '8px' }}>GRID: </span>
              <strong style={{ color: C.text }}>{appliedFilters.region}</strong>
            </div>
            <div>
              <span style={{ color: '#71717a', fontSize: '8px' }}>CATEGORY: </span>
              <strong style={{ color: C.text }}>{appliedFilters.category}</strong>
            </div>

            <div>
              <span style={{ color: '#71717a', fontSize: '8px' }}>REGION: </span>
              <strong style={{ color: C.text }}>
                {appliedFilters.category === 'ISTS' ? '—' : appliedFilters.state}
              </strong>
            </div>
            <div>
              <span style={{ color: '#71717a', fontSize: '8px' }}>RUN DATE: </span>
              <strong style={{ color: C.text }}>{appliedFilters.runDate}</strong>
            </div>
            <div>
              <span style={{ color: '#71717a', fontSize: '8px' }}>REVISION: </span>
              <strong style={{ color: C.text }}>{appliedFilters.revision}</strong>
            </div>
            <div>
              <span style={{ color: '#71717a', fontSize: '8px' }}>
                {appliedFilters.category === 'ISTS' ? 'STATION: ' : 'PLANT: '}
              </span>
              <strong style={{ color: C.text }}>
                {appliedFilters.category === 'ISTS'
                  ? (appliedFilters.poolingStation || 'All Pooling Stations')
                  : appliedFilters.plant}
              </strong>
            </div>
          </div>
        </div>

        {/* Right: Apply to Dashboard Button & Auto-refresh */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onApply}
            style={{
              backgroundColor: '#ea580c',
              backgroundImage: 'linear-gradient(to right, #ea580c, #f59e0b)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 16px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)',
              transition: 'opacity 0.15s ease',
            }}
          >
            Apply to Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', color: '#71717a' }}>
            <span>Auto-refresh</span>
            <div
              style={{
                width: '26px',
                height: '14px',
                backgroundColor: '#27272a',
                borderRadius: '8px',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: '2px',
                }}
              />
            </div>
            <span style={{ color: '#a1a1aa', fontWeight: 600 }}>10m</span>
          </div>
        </div>
      </div>

      {/* Action Row: Admin Panel, Theme, Logout (Matching Screenshot 1:1) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr',
          gap: '8px',
          paddingTop: '2px',
        }}
      >
        <button
          type="button"
          onClick={onGoToAdmin}
          style={{
            backgroundColor: isLight ? '#f4f4f5' : 'rgba(99, 102, 241, 0.12)',
            border: `1px solid ${isLight ? '#c4b5fd' : '#4338ca'}`,
            color: isLight ? '#4338ca' : '#c7d2fe',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '10.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Admin Panel</span>
          <span style={{ fontSize: '11px' }}>🛡️</span>
        </button>

        <button
          type="button"
          onClick={onThemeToggle}
          style={{
            backgroundColor: isLight ? '#f4f4f5' : '#141416',
            border: `1px solid ${C.inputBorder}`,
            color: C.text,
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '10.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Theme</span>
          <span style={{ fontSize: '11px' }}>☀️</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          style={{
            backgroundColor: '#dc2626',
            border: 'none',
            color: '#ffffff',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '10.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.35)',
          }}
        >
          <span>Logout</span>
          <span style={{ fontSize: '11px' }}>➔</span>
        </button>
      </div>
    </div>
  );
};
