import React, { useState, useMemo } from 'react';

export interface CoverageRecord {
  id: string;
  plantCode: string;
  plantName: string;
  region: string;
  date: string;
  expectedBlocks: number;
  actualBlocks: number;
  coveragePct: number;
  maxMw: number;
  minMw: number;
  avgMw: number;
  zeroBlocks: number;
  status: 'NORMAL' | 'MISSING DATA' | 'NO TELEMETRY' | 'DELAYED' | 'STALE SCADA' | 'COMM FAILURE' | 'PACKET DROP';
}

export interface AdminCoverageViewProps {
  theme?: 'dark' | 'light';
}

const INITIAL_COVERAGE_DATA: CoverageRecord[] = [
  { id: 'cov-1', plantCode: 'ACL_PSS3_KPS1_S', plantName: 'Adani Solar Khavda 1', region: 'GJ', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 96, coveragePct: 100.0, maxMw: 284.2, minMw: 0.0, avgMw: 92.4, zeroBlocks: 44, status: 'NORMAL' },
  { id: 'cov-2', plantCode: 'AGE24AL_PSS3_KPS1_S', plantName: 'Adani Green Energy 24A', region: 'GJ', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 32, coveragePct: 33.3, maxMw: 120.0, minMw: 0.0, avgMw: 28.1, zeroBlocks: 12, status: 'MISSING DATA' },
  { id: 'cov-3', plantCode: 'AGEL_PSS1_KPS1_S', plantName: 'Adani Green Energy 1', region: 'GJ', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 96, coveragePct: 100.0, maxMw: 310.5, minMw: 0.0, avgMw: 104.2, zeroBlocks: 42, status: 'NORMAL' },
  { id: 'cov-4', plantCode: 'AHESL_PSS1_KPS1_S', plantName: 'Adani Hybrid Energy 1', region: 'GJ', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 0, coveragePct: 0.0, maxMw: 0.0, minMw: 0.0, avgMw: 0.0, zeroBlocks: 96, status: 'NO TELEMETRY' },
  { id: 'cov-5', plantCode: 'ARERJL_PSS1_KPS1_S', plantName: 'Adani RE Rajasthan 1', region: 'ISTS', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 78, coveragePct: 81.2, maxMw: 195.4, minMw: 0.0, avgMw: 61.8, zeroBlocks: 38, status: 'DELAYED' },
  { id: 'cov-6', plantCode: 'AUGEL_PSS2_KPS1_S', plantName: 'Adani Utility Green 2', region: 'GJ', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 96, coveragePct: 100.0, maxMw: 240.0, minMw: 0.0, avgMw: 78.5, zeroBlocks: 44, status: 'NORMAL' },
  { id: 'cov-7', plantCode: 'AVAADA_PAVAGADA_S', plantName: 'Avaada Pavagada Solar', region: 'ISTS', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 96, coveragePct: 100.0, maxMw: 150.0, minMw: 0.0, avgMw: 48.2, zeroBlocks: 44, status: 'NORMAL' },
  { id: 'cov-8', plantCode: 'BHADLA_NTPC_S', plantName: 'NTPC Bhadla Solar Plant', region: 'ISTS', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 96, coveragePct: 100.0, maxMw: 260.0, minMw: 0.0, avgMw: 85.0, zeroBlocks: 42, status: 'NORMAL' },
  { id: 'cov-9', plantCode: 'CHARANKA_GPCL_S', plantName: 'Charanka Solar Park', region: 'GJ', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 54, coveragePct: 56.2, maxMw: 180.0, minMw: 0.0, avgMw: 42.0, zeroBlocks: 28, status: 'STALE SCADA' },
  { id: 'cov-10', plantCode: 'RENEW_SOLAR_MP_S', plantName: 'ReNew Solar Madhya 1', region: 'MP', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 96, coveragePct: 100.0, maxMw: 250.0, minMw: 0.0, avgMw: 81.6, zeroBlocks: 43, status: 'NORMAL' },
  { id: 'cov-11', plantCode: 'TATA_POWER_MH_S', plantName: 'Tata Power Sakri Solar', region: 'MH', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 96, coveragePct: 100.0, maxMw: 100.0, minMw: 0.0, avgMw: 33.1, zeroBlocks: 44, status: 'NORMAL' },
  { id: 'cov-12', plantCode: 'ACME_RAIPUR_CG_S', plantName: 'ACME Solar Raipur', region: 'CG', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 0, coveragePct: 0.0, maxMw: 0.0, minMw: 0.0, avgMw: 0.0, zeroBlocks: 96, status: 'COMM FAILURE' },
  { id: 'cov-13', plantCode: 'AZURE_POWER_GJ_S', plantName: 'Azure Power Gujarat', region: 'GJ', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 96, coveragePct: 100.0, maxMw: 200.0, minMw: 0.0, avgMw: 65.4, zeroBlocks: 43, status: 'NORMAL' },
  { id: 'cov-14', plantCode: 'HERO_FUTURE_WR_W', plantName: 'Hero Future Energies Wind', region: 'ISTS', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 96, coveragePct: 100.0, maxMw: 180.0, minMw: 12.0, avgMw: 98.2, zeroBlocks: 0, status: 'NORMAL' },
  { id: 'cov-15', plantCode: 'SUZLON_WIND_GJ_W', plantName: 'Suzlon Kutch Wind Farm', region: 'GJ', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 48, coveragePct: 50.0, maxMw: 120.0, minMw: 5.0, avgMw: 45.1, zeroBlocks: 8, status: 'PACKET DROP' },
  { id: 'cov-16', plantCode: 'NTPC_KOLDAM_HY_H', plantName: 'NTPC Hydro Peaking Station', region: 'ISTS', date: '19-10-2026', expectedBlocks: 96, actualBlocks: 96, coveragePct: 100.0, maxMw: 400.0, minMw: 50.0, avgMw: 220.0, zeroBlocks: 0, status: 'NORMAL' },
];

export const AdminCoverageView: React.FC<AdminCoverageViewProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  // Filters state matching Screenshot 5
  const [fromDate, setFromDate] = useState('06-10-2026');
  const [toDate, setToDate] = useState('19-10-2026');
  const [fromTime, setFromTime] = useState('00:00');
  const [toTime, setToTime] = useState('23:45');
  const [regionFilter, setRegionFilter] = useState('All');
  const [plantFilter, setPlantFilter] = useState('All plants (coverage overview)');
  const [onlyShowIssues, setOnlyShowIssues] = useState(false);
  const [selectedInspectPlant, setSelectedInspectPlant] = useState<CoverageRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const C = {
    cardBg: isLight ? '#ffffff' : '#0c0c0e',
    panelBg: isLight ? '#f9fafb' : '#111114',
    border: isLight ? '#e5e7eb' : '#1f1f23',
    text: isLight ? '#111827' : '#f4f4f5',
    muted: isLight ? '#6b7280' : '#888891',
    inputBg: isLight ? '#ffffff' : '#18181b',
    headerBg: isLight ? '#f3f4f6' : '#141417',
    hoverBg: isLight ? '#f9fafb' : '#16161a',
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  const filteredData = useMemo(() => {
    return INITIAL_COVERAGE_DATA.filter((row) => {
      if (onlyShowIssues && row.status === 'NORMAL') {
        return false;
      }
      if (regionFilter !== 'All' && row.region !== regionFilter) {
        return false;
      }
      if (plantFilter !== 'All plants (coverage overview)' && row.plantCode !== plantFilter) {
        return false;
      }
      return true;
    });
  }, [onlyShowIssues, regionFilter, plantFilter]);

  const getStatusBadge = (status: CoverageRecord['status']) => {
    switch (status) {
      case 'NORMAL':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'DELAYED':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      case 'MISSING DATA':
      case 'NO TELEMETRY':
      case 'COMM FAILURE':
      case 'PACKET DROP':
      case 'STALE SCADA':
      default:
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Title & Refresh Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.01em' }}>
            Live Actuals Coverage
          </h2>
          <div style={{ fontSize: '12px', marginTop: '3px' }}>
            <span style={{ color: C.muted }}>854 plant-days in range · </span>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>604 with issues</span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          style={{
            backgroundColor: isLight ? '#f3f4f6' : '#18181b',
            color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <span style={{ display: 'inline-block', transform: isRefreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.4s ease' }}>
            🔄
          </span>
          Refresh
        </button>
      </div>

      {/* Dense Filter Bar (Screenshot 5 exact controls) */}
      <div
        style={{
          backgroundColor: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: '8px',
          padding: '12px 14px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px 16px',
        }}
      >
        {/* From Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>From</label>
          <input
            type="text"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              backgroundColor: C.inputBg,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: '5px',
              padding: '4px 8px',
              fontSize: '11px',
              fontFamily: 'monospace',
              width: '95px',
            }}
          />
        </div>

        {/* To Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>To</label>
          <input
            type="text"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              backgroundColor: C.inputBg,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: '5px',
              padding: '4px 8px',
              fontSize: '11px',
              fontFamily: 'monospace',
              width: '95px',
            }}
          />
        </div>

        {/* From Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>From Time</label>
          <input
            type="text"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            style={{
              backgroundColor: C.inputBg,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: '5px',
              padding: '4px 8px',
              fontSize: '11px',
              fontFamily: 'monospace',
              width: '65px',
            }}
          />
        </div>

        {/* To Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>To Time</label>
          <input
            type="text"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            style={{
              backgroundColor: C.inputBg,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: '5px',
              padding: '4px 8px',
              fontSize: '11px',
              fontFamily: 'monospace',
              width: '65px',
            }}
          />
        </div>

        {/* Region */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>Region</label>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            style={{
              backgroundColor: C.inputBg,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: '5px',
              padding: '4px 8px',
              fontSize: '11px',
              minWidth: '70px',
            }}
          >
            <option value="All">All</option>
            <option value="GJ">GJ</option>
            <option value="MH">MH</option>
            <option value="MP">MP</option>
            <option value="CG">CG</option>
            <option value="ISTS">ISTS</option>
          </select>
        </div>

        {/* Plant */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>Plant</label>
          <select
            value={plantFilter}
            onChange={(e) => setPlantFilter(e.target.value)}
            style={{
              backgroundColor: C.inputBg,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: '5px',
              padding: '4px 8px',
              fontSize: '11px',
              minWidth: '220px',
            }}
          >
            <option value="All plants (coverage overview)">All plants (coverage overview)</option>
            {INITIAL_COVERAGE_DATA.map((row) => (
              <option key={row.id} value={row.plantCode}>
                {row.plantCode} — {row.plantName}
              </option>
            ))}
          </select>
        </div>

        {/* Checkbox: Only show issues */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#f59e0b', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={onlyShowIssues}
              onChange={(e) => setOnlyShowIssues(e.target.checked)}
              style={{ accentColor: '#f59e0b', cursor: 'pointer' }}
            />
            Only show issues
          </label>
        </div>
      </div>

      {/* 11-Column Monitoring Table (Screenshot 5) */}
      <div
        style={{
          backgroundColor: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: '8px',
          overflowX: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left', whiteSpace: 'nowrap' }}>
          <thead>
            <tr
              style={{
                backgroundColor: C.headerBg,
                borderBottom: `1px solid ${C.border}`,
                color: C.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              <th style={{ padding: '9px 12px' }}>PLANT CODE</th>
              <th style={{ padding: '9px 12px' }}>DATE</th>
              <th style={{ padding: '9px 12px', textAlign: 'right' }}>EXPECTED BLOCKS</th>
              <th style={{ padding: '9px 12px', textAlign: 'right' }}>ACTUAL BLOCKS</th>
              <th style={{ padding: '9px 12px', textAlign: 'center' }}>COVERAGE %</th>
              <th style={{ padding: '9px 12px', textAlign: 'right' }}>MAX MW</th>
              <th style={{ padding: '9px 12px', textAlign: 'right' }}>MIN MW</th>
              <th style={{ padding: '9px 12px', textAlign: 'right' }}>AVG MW</th>
              <th style={{ padding: '9px 12px', textAlign: 'right' }}>ZERO BLOCKS</th>
              <th style={{ padding: '9px 12px', textAlign: 'center' }}>STATUS</th>
              <th style={{ padding: '9px 12px', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ padding: '32px 0', textAlign: 'center', color: C.muted }}>
                  No telemetry records match the current filter selection.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => {
                const badge = getStatusBadge(row.status);
                const isZeroCov = row.coveragePct === 0;
                const isFullCov = row.coveragePct === 100;

                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      color: C.text,
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Plant Code */}
                    <td style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'monospace', color: '#f59e0b' }}>
                      {row.plantCode}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '8px 12px', color: C.muted, fontFamily: 'monospace' }}>
                      {row.date}
                    </td>

                    {/* Expected Blocks */}
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>
                      {row.expectedBlocks}
                    </td>

                    {/* Actual Blocks */}
                    <td
                      style={{
                        padding: '8px 12px',
                        textAlign: 'right',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: isZeroCov ? '#ef4444' : isFullCov ? '#10b981' : '#f59e0b',
                      }}
                    >
                      {row.actualBlocks}
                    </td>

                    {/* Coverage % */}
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          backgroundColor: isZeroCov
                            ? 'rgba(239, 68, 68, 0.15)'
                            : isFullCov
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                          color: isZeroCov ? '#ef4444' : isFullCov ? '#10b981' : '#f59e0b',
                        }}
                      >
                        {row.coveragePct.toFixed(1)}%
                      </span>
                    </td>

                    {/* Max MW */}
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>
                      {row.maxMw.toFixed(1)}
                    </td>

                    {/* Min MW */}
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>
                      {row.minMw.toFixed(1)}
                    </td>

                    {/* Avg MW */}
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>
                      {row.avgMw.toFixed(1)}
                    </td>

                    {/* Zero Blocks */}
                    <td
                      style={{
                        padding: '8px 12px',
                        textAlign: 'right',
                        fontFamily: 'monospace',
                        color: row.zeroBlocks > 50 ? '#ef4444' : C.text,
                      }}
                    >
                      {row.zeroBlocks}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedInspectPlant(row)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inspection Modal */}
      {selectedInspectPlant && (
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
          onClick={() => setSelectedInspectPlant(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#121215',
              border: '1px solid #27272a',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '520px',
              padding: '20px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f4f4f5' }}>
                  Telemetry Block Inspector
                </h3>
                <span style={{ fontSize: '11px', color: '#f59e0b', fontFamily: 'monospace' }}>
                  {selectedInspectPlant.plantCode} — {selectedInspectPlant.plantName}
                </span>
              </div>
              <button
                onClick={() => setSelectedInspectPlant(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#71717a',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px', fontSize: '11px' }}>
              <div style={{ padding: '8px', backgroundColor: '#18181b', borderRadius: '6px' }}>
                <span style={{ color: '#71717a' }}>Report Date:</span>
                <div style={{ fontWeight: 700, color: '#f4f4f5', fontFamily: 'monospace' }}>{selectedInspectPlant.date}</div>
              </div>
              <div style={{ padding: '8px', backgroundColor: '#18181b', borderRadius: '6px' }}>
                <span style={{ color: '#71717a' }}>Region / Area:</span>
                <div style={{ fontWeight: 700, color: '#f4f4f5' }}>{selectedInspectPlant.region} SLDC / ISTS</div>
              </div>
              <div style={{ padding: '8px', backgroundColor: '#18181b', borderRadius: '6px' }}>
                <span style={{ color: '#71717a' }}>Expected vs Ingested:</span>
                <div style={{ fontWeight: 700, color: '#f4f4f5', fontFamily: 'monospace' }}>
                  {selectedInspectPlant.actualBlocks} / {selectedInspectPlant.expectedBlocks} blocks ({selectedInspectPlant.coveragePct.toFixed(1)}%)
                </div>
              </div>
              <div style={{ padding: '8px', backgroundColor: '#18181b', borderRadius: '6px' }}>
                <span style={{ color: '#71717a' }}>Telemetry Status:</span>
                <div style={{ fontWeight: 700, color: getStatusBadge(selectedInspectPlant.status).text }}>
                  {selectedInspectPlant.status}
                </div>
              </div>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#18181b', borderRadius: '6px', border: '1px solid #27272a', marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', marginBottom: '6px' }}>
                Simulated 96-Block Heatmap
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: '2px', height: '16px' }}>
                {Array.from({ length: 48 }).map((_, i) => {
                  const isFilled = i < Math.round((selectedInspectPlant.actualBlocks / 96) * 48);
                  return (
                    <div
                      key={i}
                      title={`Time block ${i * 2 + 1}`}
                      style={{
                        backgroundColor: isFilled ? '#10b981' : '#ef4444',
                        borderRadius: '1px',
                        opacity: isFilled ? 0.9 : 0.4,
                      }}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#71717a', marginTop: '4px' }}>
                <span>00:00</span>
                <span>12:00</span>
                <span>23:45</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedInspectPlant(null)}
              style={{
                width: '100%',
                backgroundColor: '#10b981',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

