import React from 'react';
import type { FilterState } from './ForecastFilters';

export interface KPICardsProps {
  filters: FilterState;
  appliedFilters: FilterState;
  theme?: 'dark' | 'light';
}

export const KPICards: React.FC<KPICardsProps> = ({
  appliedFilters,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  // Dynamic context calculation based on appliedFilters
  const isGJ = appliedFilters.state === 'Gujarat';
  const isMH = appliedFilters.state === 'Maharashtra';
  const isMP = appliedFilters.state === 'Madhya Pradesh';

  const gjPlants = isMH || isMP ? 0 : 1483;
  const mhPlants = isGJ || isMP ? 0 : 121;
  const mpPlants = isGJ || isMH ? 0 : 94;
  const totalPlants = gjPlants + mhPlants + mpPlants;

  const gjIC = (gjPlants * 11.6116).toFixed(1);
  const mhIC = (mhPlants * 58.3247).toFixed(1);
  const mpIC = (mpPlants * 25.4021).toFixed(1);
  const totalIC = (parseFloat(gjIC) + parseFloat(mhIC) + parseFloat(mpIC)).toFixed(1);

  const C = {
    cardBg: isLight ? '#ffffff' : '#000000',
    border: isLight ? '#e4e4e7' : '#222226',
    subCardBg: isLight ? '#f9fafb' : '#0c0c0e',
    text: isLight ? '#111827' : '#ffffff',
    muted: isLight ? '#6b7280' : '#888891',
    amber: '#f59e0b',
    purple: '#a855f7',
    purpleBg: isLight ? '#ede9fe' : '#1e1b4b',
    purpleBorder: isLight ? '#c4b5fd' : '#4338ca',
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
      {/* Top Heading: SUMMARY */}
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
          SUMMARY
        </span>
      </div>

      {/* Row of 3 Cards: FORECAST CONTEXT, UPCOMING FORECAST, WEATHER ALERT (Matching Screenshot 1:1) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 1.25fr 0.9fr',
          gap: '10px',
        }}
      >
        {/* Card 1: FORECAST CONTEXT (with target icon 🎯) */}
        <div
          style={{
            backgroundColor: C.subCardBg,
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
            padding: '9px 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ color: C.amber, fontSize: '11px' }}>🎯</span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: C.amber,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                FORECAST CONTEXT
              </span>
            </div>

            {appliedFilters.plant !== 'All Plants' ? (
              /* Single Plant Details matching Screenshot 3 */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '9px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: C.muted }}>Plant:</span>
                  <strong style={{ color: C.text, fontFamily: 'monospace', fontSize: '9px' }}>
                    {appliedFilters.plant}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: C.muted }}>Installed Capacity:</span>
                  <strong style={{ color: C.text, fontFamily: 'monospace', fontSize: '10px' }}>
                    400.0 MW
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: C.muted }}>Forecasting Type:</span>
                  <strong style={{ color: C.text }}>
                    {appliedFilters.forecastingType === 'Intra' ? 'Intraday' : appliedFilters.forecastingType}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: C.muted }}>Revision:</span>
                  <strong style={{ color: C.text }}>Till Latest</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: C.muted }}>Time Range:</span>
                  <div style={{ textAlign: 'right', fontSize: '8px', color: C.text }}>
                    Oct 18, 08:30<br />
                    <span style={{ color: C.amber }}>➔ Oct 21, 05:15</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `1px solid ${C.border}`, paddingTop: '3px', marginTop: '2px' }}>
                  <span style={{ color: C.muted }}>Run Time:</span>
                  <span style={{ color: C.muted, fontSize: '8.5px' }}>Oct 18, 08:30</span>
                </div>
              </div>
            ) : (
              /* States Table: States | Plants | IC matching Screenshot 1 */
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', marginBottom: '8px' }}>
                  <thead>
                    <tr style={{ color: C.muted, borderBottom: `1px solid ${C.border}`, textAlign: 'left' }}>
                      <th style={{ paddingBottom: '3px', fontWeight: 600 }}>States</th>
                      <th style={{ paddingBottom: '3px', fontWeight: 600, textAlign: 'center' }}>Plants</th>
                      <th style={{ paddingBottom: '3px', fontWeight: 600, textAlign: 'right' }}>IC</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ color: isLight ? '#374151' : '#d4d4d8' }}>
                      <td style={{ paddingTop: '2px' }}>GJ</td>
                      <td style={{ paddingTop: '2px', textAlign: 'center' }}>{gjPlants}</td>
                      <td style={{ paddingTop: '2px', textAlign: 'right', fontFamily: 'monospace' }}>{gjIC} MW</td>
                    </tr>
                    <tr style={{ color: isLight ? '#374151' : '#d4d4d8' }}>
                      <td>MH</td>
                      <td style={{ textAlign: 'center' }}>{mhPlants}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{mhIC} MW</td>
                    </tr>
                    <tr style={{ color: isLight ? '#374151' : '#d4d4d8' }}>
                      <td>MP</td>
                      <td style={{ textAlign: 'center' }}>{mpPlants}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{mpIC} MW</td>
                    </tr>
                    <tr style={{ color: C.text, fontWeight: 700, borderTop: `1px solid ${C.border}` }}>
                      <td style={{ paddingTop: '3px' }}>Total</td>
                      <td style={{ paddingTop: '3px', textAlign: 'center' }}>{totalPlants}</td>
                      <td style={{ paddingTop: '3px', textAlign: 'right', fontFamily: 'monospace' }}>{totalIC} MW</td>
                    </tr>
                  </tbody>
                </table>

                {/* Details below table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '8.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: C.muted }}>Forecasting Type:</span>
                    <strong style={{ color: C.text }}>{appliedFilters.forecastingType}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: C.muted }}>Revision:</span>
                    <span style={{ color: C.muted }}>Till Latest</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: C.muted }}>Time Range:</span>
                    <span style={{ color: C.muted }}>Oct 18, 00:00</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card 2: UPCOMING FORECAST (with lightning icon ⚡ & 2x2 grid) */}
        <div
          style={{
            backgroundColor: C.subCardBg,
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
            padding: '9px 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ color: C.amber, fontSize: '11px' }}>⚡</span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: C.amber,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                UPCOMING FORECAST
              </span>
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '8px', color: C.muted }}>
              Current &amp; next 3 time blocks · 15 min slots
            </p>

            {/* 2x2 Grid of time block tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {/* Tile 1: T */}
              <div
                style={{
                  backgroundColor: C.purpleBg,
                  border: `1px solid ${C.purpleBorder}`,
                  borderRadius: '5px',
                  padding: '5px 7px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: C.purple }}>T</span>
                  <span style={{ fontSize: '8px', color: C.muted }}>
                    {appliedFilters.plant !== 'All Plants' ? '00:00' : '22:45'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: C.text, marginTop: '2px', fontFamily: 'monospace' }}>
                  0.0 <span style={{ fontSize: '8px', color: C.muted }}>MW</span>
                </div>
              </div>

              {/* Tile 2: T+1 */}
              <div
                style={{
                  backgroundColor: isLight ? '#ffffff' : '#141416',
                  border: `1px solid ${C.border}`,
                  borderRadius: '5px',
                  padding: '5px 7px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: C.amber }}>T+1</span>
                  <span style={{ fontSize: '8px', color: C.muted }}>
                    {appliedFilters.plant !== 'All Plants' ? '00:15' : '23:00'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: C.text, marginTop: '2px', fontFamily: 'monospace' }}>
                  0.0 <span style={{ fontSize: '8px', color: C.muted }}>MW</span>
                </div>
              </div>

              {/* Tile 3: T+2 */}
              <div
                style={{
                  backgroundColor: isLight ? '#ffffff' : '#141416',
                  border: `1px solid ${C.border}`,
                  borderRadius: '5px',
                  padding: '5px 7px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: C.amber }}>T+2</span>
                  <span style={{ fontSize: '8px', color: C.muted }}>
                    {appliedFilters.plant !== 'All Plants' ? '00:30' : '23:15'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: C.text, marginTop: '2px', fontFamily: 'monospace' }}>
                  0.0 <span style={{ fontSize: '8px', color: C.muted }}>MW</span>
                </div>
              </div>

              {/* Tile 4: T+3 */}
              <div
                style={{
                  backgroundColor: isLight ? '#ffffff' : '#141416',
                  border: `1px solid ${C.border}`,
                  borderRadius: '5px',
                  padding: '5px 7px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: C.amber }}>T+3</span>
                  <span style={{ fontSize: '8px', color: C.muted }}>
                    {appliedFilters.plant !== 'All Plants' ? '00:45' : '23:30'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: C.text, marginTop: '2px', fontFamily: 'monospace' }}>
                  0.0 <span style={{ fontSize: '8px', color: C.muted }}>MW</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Stacked LIVE SOLAR POWER + WEATHER ALERT (Screenshot 3) or Full WEATHER ALERT (Screenshot 1) */}
        {appliedFilters.plant !== 'All Plants' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Top: LIVE SOLAR POWER */}
            <div
              style={{
                backgroundColor: C.subCardBg,
                border: `1px solid ${C.border}`,
                borderRadius: '6px',
                padding: '6px 10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                <span style={{ color: C.amber, fontSize: '10px' }}>⚡</span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  LIVE SOLAR POWER
                </span>
              </div>
              <div style={{ fontSize: '7.5px', color: C.muted, textTransform: 'uppercase' }}>
                LIVE POWER · AS OF 23:45 IST
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>
                  0.0 <span style={{ fontSize: '9px', fontWeight: 600 }}>MW</span>
                </span>
                <span style={{ fontSize: '8px', color: C.muted }}>latest actual</span>
              </div>
            </div>

            {/* Bottom: WEATHER ALERT */}
            <div
              style={{
                backgroundColor: C.subCardBg,
                border: `1px solid ${C.border}`,
                borderRadius: '6px',
                padding: '6px 10px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                <span style={{ color: C.amber, fontSize: '10px' }}>☁️</span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  WEATHER ALERT
                </span>
              </div>
              <div style={{ marginBottom: '3px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: '12px',
                    padding: '1px 7px',
                    fontSize: '7.5px',
                    fontWeight: 800,
                    color: C.amber,
                  }}
                >
                  ● COMING SOON
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '7.5px', color: C.muted, lineHeight: 1.3 }}>
                Solar and wind weather alerts will appear here.
              </p>
            </div>
          </div>
        ) : (
          /* Single Full WEATHER ALERT Card matching Screenshot 1 */
          <div
            style={{
              backgroundColor: C.subCardBg,
              border: `1px solid ${C.border}`,
              borderRadius: '6px',
              padding: '9px 12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ color: C.amber, fontSize: '11px' }}>☁️</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: C.amber,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  WEATHER ALERT
                </span>
              </div>

              {/* COMING SOON Pill */}
              <div style={{ marginBottom: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '8px',
                    fontWeight: 800,
                    color: C.amber,
                    letterSpacing: '0.06em',
                  }}
                >
                  ● COMING SOON
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '9px', color: C.muted, lineHeight: 1.4 }}>
                Solar and wind weather alerts will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
