import React, { useState, useMemo } from 'react';
import type { FilterState } from './ForecastFilters';

export interface DataRecord {
  plant: string;
  dateTime: string;
  rev: string;
  ghiPred: number;
  solarPred: number | null;
}

export interface DataTableProps {
  appliedFilters: FilterState;
  theme?: 'dark' | 'light';
  stateMode?: 'normal' | 'loading' | 'error';
  onRetry?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  appliedFilters,
  theme = 'dark',
  stateMode = 'normal',
  onRetry,
}) => {
  const isLight = theme === 'light';
  const [downloadToast, setDownloadToast] = useState<string>('');

  // Table local filter states (Screenshot 2)
  const [genType, setGenType] = useState('Solar');
  const [region, setRegion] = useState('All Grids');
  const [category, setCategory] = useState('State');
  const [state, setState] = useState('All');
  const [plant, setPlant] = useState('All Plants');
  const [fromDate, setFromDate] = useState('2026-10-18');
  const [toDate, setToDate] = useState('2026-10-18');
  const [mode, setMode] = useState('Nowcasting');
  const [rev, setRev] = useState('All');

  // Pagination states (Screenshot 2: 1-20 of 280 Rows, Rows: 20, Page 1/14)
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Generate 280 15-minute time block records for 18-10-2026
  const allRows: DataRecord[] = useMemo(() => {
    const records: DataRecord[] = [];
    const plantName = plant !== 'All Plants' ? plant : '1698 plants';

    // 280 intervals representing multi-revision & 96-block daytime series
    for (let i = 0; i < 280; i++) {
      const totalMinutes = (i * 15) % 1440;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      const dateTime = `18-10-2026 ${timeStr}`;

      // Sun curve model
      let ghi = 0.0;
      let pred: number | null = null;
      if (hours >= 6 && hours <= 18) {
        const peakDist = 1 - Math.abs(hours + minutes / 60 - 12.5) / 6.5;
        if (peakDist > 0) {
          ghi = parseFloat((Math.sin(peakDist * (Math.PI / 2)) * 980).toFixed(2));
          pred = parseFloat((ghi * 2.05).toFixed(2));
        }
      }

      records.push({
        plant: plantName,
        dateTime,
        rev: rev === 'All' ? 'latest' : rev,
        ghiPred: ghi,
        solarPred: pred,
      });
    }
    return records;
  }, [plant, rev]);

  const totalPages = Math.ceil(allRows.length / rowsPerPage);
  const pagedRows = allRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleDownloadExcel = () => {
    setDownloadToast('✓ Export initiated: GI_IITB_Forecast_Telemetry_20261018.xlsx (280 records exported)');
    setTimeout(() => setDownloadToast(''), 4000);
  };

  const C = {
    cardBg: isLight ? '#ffffff' : '#000000',
    border: isLight ? '#e4e4e7' : '#1f1f23',
    rowBg: isLight ? '#ffffff' : '#0a0a0c',
    altBg: isLight ? '#f9fafb' : '#111114',
    text: isLight ? '#111827' : '#ffffff',
    muted: isLight ? '#6b7280' : '#888891',
    amber: '#f59e0b',
    yellow: '#eab308',
    green: '#10b981',
    cyan: '#38bdf8',
    inputBg: isLight ? '#f4f4f5' : '#111114',
    inputBorder: isLight ? '#d1d5db' : '#27272a',
  };

  const selectStyle: React.CSSProperties = {
    backgroundColor: C.inputBg,
    border: `1px solid ${C.inputBorder}`,
    borderRadius: '4px',
    color: C.text,
    fontSize: '11px',
    padding: '4px 8px',
    outline: 'none',
    cursor: 'pointer',
    height: '28px',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '9px',
    fontWeight: 700,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '3px',
    display: 'block',
  };

  if (stateMode === 'loading') {
    return (
      <div style={{ backgroundColor: C.cardBg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
        <span style={{ fontSize: '11px', color: C.muted }}>Loading Detailed Records Table...</span>
      </div>
    );
  }

  if (stateMode === 'error') {
    return (
      <div style={{ backgroundColor: C.cardBg, border: '1px solid #ef4444', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700, margin: '0 0 10px 0' }}>Data Records Connection Disrupted</p>
        <button onClick={onRetry} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: C.cardBg,
        border: `1px solid ${C.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Yellow Available Range Strip (Matching Screenshot 2:1) */}
      <div
        style={{
          padding: '6px 14px',
          backgroundColor: isLight ? '#fef3c7' : '#050507',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span
          style={{
            fontSize: '9.5px',
            fontWeight: 800,
            color: C.yellow,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: 'monospace',
          }}
        >
          AVAILABLE RANGE: 2025-08-29 → 2026-10-18
        </span>
      </div>

      {/* 2. Secondary Filter Toolbar (Matching Screenshot 2:1) */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: `1px solid ${C.border}`,
          backgroundColor: isLight ? '#fafafa' : '#0a0a0c',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <label style={labelStyle}>GENERATION TYPE</label>
          <select value={genType} onChange={(e) => setGenType(e.target.value)} style={{ ...selectStyle, minWidth: '90px' }}>
            <option value="Solar">Solar</option>
            <option value="Wind">Wind</option>
            <option value="Hydro">Hydro</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>REGION</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)} style={{ ...selectStyle, minWidth: '100px' }}>
            <option value="All Grids">All Grids</option>
            <option value="Western Region">Western Region</option>
            <option value="Southern Region">Southern Region</option>
            <option value="Northern Region">Northern Region</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>STATE / ISTS CATEGORY</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...selectStyle, minWidth: '95px' }}>
            <option value="State">State</option>
            <option value="ISTS">ISTS</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>STATE</label>
          <select value={state} onChange={(e) => setState(e.target.value)} style={{ ...selectStyle, minWidth: '85px' }}>
            <option value="All">All</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>PLANT</label>
          <select value={plant} onChange={(e) => setPlant(e.target.value)} style={{ ...selectStyle, minWidth: '120px' }}>
            <option value="All Plants">All Plants</option>
            <option value="220_33KV_BAKTAPUR">220_33KV_BAKTAPUR</option>
            <option value="400KV_NAGDA">400KV_NAGDA</option>
            <option value="33_KV_LASOOR">33_KV_LASOOR</option>
            <option value="ABReL_SPV2_(Malotra)">ABReL_SPV2_(Malotra)</option>
            <option value="BHADLA_SOLAR_PARK">BHADLA_SOLAR_PARK</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>PERIOD, FORECASTING TYPE &amp; REVISION</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ ...selectStyle, padding: '2px 6px', fontSize: '10.5px', colorScheme: isLight ? 'light' : 'dark' }}
            />
            <span style={{ color: C.muted, fontSize: '10px' }}>—</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ ...selectStyle, padding: '2px 6px', fontSize: '10.5px', colorScheme: isLight ? 'light' : 'dark' }}
            />
            <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ ...selectStyle, minWidth: '95px' }}>
              <option value="Nowcasting">Nowcasting</option>
              <option value="Intra">Intra</option>
              <option value="Medium">Medium</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ fontSize: '9px', color: C.muted, fontWeight: 700 }}>REV</span>
              <select value={rev} onChange={(e) => setRev(e.target.value)} style={{ ...selectStyle, minWidth: '60px' }}>
                <option value="All">All</option>
                <option value="latest">Latest</option>
                <option value="0">Rev 0</option>
                <option value="1">Rev 1</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. EXPORT Green Button (Matching Screenshot 2:1) */}
        <div style={{ marginLeft: 'auto' }}>
          <label style={labelStyle}>EXPORT</label>
          <button
            type="button"
            onClick={handleDownloadExcel}
            style={{
              backgroundColor: '#10b981',
              color: '#000000',
              border: 'none',
              borderRadius: '5px',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
            }}
          >
            <span>📥</span> Download Excel ({allRows.length})
          </button>
        </div>
      </div>

      {/* Export Toast Notice */}
      {downloadToast && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', borderBottom: '1px solid #10b981', padding: '6px 14px', color: '#10b981', fontSize: '11px', fontWeight: 700 }}>
          {downloadToast}
        </div>
      )}

      {/* 4. Semantic Table: PLANT, DATE & TIME (IST), REV, GHI PRED, SOLAR PRED (Matching Screenshot 2:1) */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                backgroundColor: isLight ? '#f4f4f5' : '#08080a',
                borderBottom: `1px solid ${C.border}`,
                color: C.muted,
                fontSize: '9.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              <th style={{ padding: '8px 14px', fontWeight: 700 }}>PLANT</th>
              <th style={{ padding: '8px 14px', fontWeight: 700 }}>DATE &amp; TIME (IST)</th>
              <th style={{ padding: '8px 14px', fontWeight: 700 }}>REV</th>
              <th style={{ padding: '8px 14px', fontWeight: 700 }}>GHI PRED</th>
              <th style={{ padding: '8px 14px', fontWeight: 700 }}>SOLAR PRED</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row, idx) => {
              const isAlt = idx % 2 === 1;
              return (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: isAlt ? C.altBg : C.rowBg,
                    borderBottom: `1px solid ${isLight ? '#f1f5f9' : '#17171a'}`,
                    color: C.text,
                  }}
                >
                  <td style={{ padding: '7px 14px', fontWeight: 600 }}>{row.plant}</td>
                  <td style={{ padding: '7px 14px', fontFamily: 'monospace', color: C.muted }}>{row.dateTime}</td>
                  <td style={{ padding: '7px 14px', fontFamily: 'monospace', color: C.amber, fontWeight: 700 }}>{row.rev}</td>
                  <td style={{ padding: '7px 14px', fontFamily: 'monospace', color: C.muted }}>{row.ghiPred.toFixed(2)}</td>
                  <td style={{ padding: '7px 14px', fontFamily: 'monospace', color: row.solarPred !== null ? C.cyan : C.muted, fontWeight: 600 }}>
                    {row.solarPred !== null ? row.solarPred.toFixed(2) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 5. Pagination Bar (Matching Screenshot 2:1: 1-20 of 280 Rows: [20 v]   < 1/14 >) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          borderTop: `1px solid ${C.border}`,
          backgroundColor: isLight ? '#fafafa' : '#08080a',
          fontSize: '11px',
          color: C.muted,
        }}
      >
        {/* Left: Row Count & Page Size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>
            {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, allRows.length)} of {allRows.length}
          </span>
          <span style={{ color: C.muted }}>Rows:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            style={{
              backgroundColor: C.inputBg,
              border: `1px solid ${C.inputBorder}`,
              borderRadius: '4px',
              color: C.text,
              fontSize: '10.5px',
              padding: '2px 6px',
              cursor: 'pointer',
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Right: Prev / Next Buttons & Page indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              backgroundColor: C.inputBg,
              border: `1px solid ${C.inputBorder}`,
              color: page === 1 ? '#52525b' : C.text,
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            ‹
          </button>
          <span style={{ fontFamily: 'monospace', fontSize: '10.5px' }}>
            {page}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              backgroundColor: C.inputBg,
              border: `1px solid ${C.inputBorder}`,
              color: page === totalPages ? '#52525b' : C.text,
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};
