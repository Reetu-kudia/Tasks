import React, { useState } from 'react';

export interface ChartInterval {
  time: string;
  ghi: number; // W/m²
  predicted: number; // MW
  actual: number | null; // MW
}

export interface ForecastChartsProps {
  generationType: 'Solar' | 'Wind' | 'Hydro';
  forecastingType?: 'Nowcasting' | 'Intra' | 'Medium';
  theme?: 'dark' | 'light';
  stateMode?: 'normal' | 'loading' | 'error';
  onRetry?: () => void;
}

// 24 Full Hours (00:00 to 23:00) matching Screenshot 1 exactly
const FULL_DAY_HOURLY: ChartInterval[] = [
  { time: '00:00', ghi: 0, predicted: 0, actual: 0 },
  { time: '01:00', ghi: 0, predicted: 0, actual: 0 },
  { time: '02:00', ghi: 0, predicted: 0, actual: 0 },
  { time: '03:00', ghi: 0, predicted: 0, actual: 0 },
  { time: '04:00', ghi: 0, predicted: 0, actual: 0 },
  { time: '05:00', ghi: 0, predicted: 0, actual: 0 },
  { time: '06:00', ghi: 0, predicted: 0, actual: 0 },
  { time: '07:00', ghi: 85, predicted: 45, actual: 40 },
  { time: '08:00', ghi: 380, predicted: 680, actual: 660 },
  { time: '09:00', ghi: 680, predicted: 1280, actual: 1250 },
  { time: '10:00', ghi: 870, predicted: 1680, actual: 1650 },
  { time: '11:00', ghi: 960, predicted: 1940, actual: 1920 },
  { time: '12:00', ghi: 980, predicted: 1980, actual: 1970 },
  { time: '13:00', ghi: 940, predicted: 1890, actual: 1870 },
  { time: '14:00', ghi: 820, predicted: 1620, actual: 1600 },
  { time: '15:00', ghi: 640, predicted: 1220, actual: 1200 },
  { time: '16:00', ghi: 390, predicted: 720, actual: 700 },
  { time: '17:00', ghi: 120, predicted: 180, actual: 160 },
  { time: '18:00', ghi: 10, predicted: 15, actual: 10 },
  { time: '19:00', ghi: 0, predicted: 0, actual: 0 },
  { time: '20:00', ghi: 0, predicted: 0, actual: 0 },
  { time: '21:00', ghi: 0, predicted: 0, actual: 0 },
  { time: '22:00', ghi: 0, predicted: 0, actual: 0 },
  { time: '23:00', ghi: 0, predicted: 0, actual: 0 },
];

function createSmoothPath(points: [number, number][]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;

  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : points.length - 1];

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return path;
}

export const ForecastCharts: React.FC<ForecastChartsProps> = ({
  generationType,
  forecastingType = 'Nowcasting',
  theme = 'dark',
  stateMode = 'normal',
  onRetry,
}) => {
  const isLight = theme === 'light';
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [isCorrected, setIsCorrected] = useState(false);

  const isIntra = forecastingType === 'Intra';

  const C = {
    cardBg: isLight ? '#ffffff' : '#000000',
    border: isLight ? '#e4e4e7' : '#222226',
    gridLine: isLight ? '#e5e7eb' : '#1a1a1d',
    text: isLight ? '#111827' : '#ffffff',
    muted: isLight ? '#6b7280' : '#71717a',
    amber: '#f59e0b',
    cyan: '#38bdf8',
    green: '#10b981',
  };

  if (stateMode === 'loading') {
    return (
      <div
        style={{
          backgroundColor: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: '8px',
          padding: '24px',
          minHeight: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            width: '24px',
            height: '24px',
            border: '2px solid #f59e0b',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ fontSize: '11px', color: C.muted }}>Loading GHI &amp; Solar Power Dual Curves...</span>
      </div>
    );
  }

  if (stateMode === 'error') {
    return (
      <div
        style={{
          backgroundColor: C.cardBg,
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          minHeight: '380px',
        }}
      >
        <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>
          Dual Chart Stream Offline
        </div>
        <button
          onClick={onRetry}
          style={{
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 14px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Retry Load
        </button>
      </div>
    );
  }

  // Measurements matching Screenshots 1 & 3
  const svgWidth = 720;
  const svgHeight = 160;
  const padL = 48;
  const padR = 20;
  const padT = 16;
  const padB = 28;

  const chartW = svgWidth - padL - padR;
  const chartH = svgHeight - padT - padB;

  const maxGhi = 1000;
  const maxPower = isIntra ? 380 : 2000;

  const getX = (i: number) => padL + (i / (FULL_DAY_HOURLY.length - 1)) * chartW;
  const getYGhi = (v: number) => padT + chartH - (v / maxGhi) * chartH;
  const getYPower = (v: number) => padT + chartH - (v / maxPower) * chartH;

  const ghiPoints: [number, number][] = FULL_DAY_HOURLY.map((d, i) => [getX(i), getYGhi(d.ghi)]);
  const predPoints: [number, number][] = FULL_DAY_HOURLY.map((d, i) => [getX(i), getYPower(d.predicted)]);
  const actualPoints: [number, number][] = FULL_DAY_HOURLY.filter((d) => d.actual !== null).map((d, i) => [
    getX(i),
    getYPower(d.actual!),
  ]);

  const ghiPath = createSmoothPath(ghiPoints);
  const predPath = createSmoothPath(predPoints);
  const actualPath = createSmoothPath(actualPoints);

  const baselineY = padT + chartH;
  const ghiArea = `${ghiPath} L ${getX(FULL_DAY_HOURLY.length - 1)} ${baselineY} L ${getX(0)} ${baselineY} Z`;
  const predArea = `${predPath} L ${getX(FULL_DAY_HOURLY.length - 1)} ${baselineY} L ${getX(0)} ${baselineY} Z`;

  const hoveredData = hoverIdx !== null ? FULL_DAY_HOURLY[hoverIdx] : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. TOP GRAPH: GHI (W/m²)                                   */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: '8px',
          padding: '8px 12px 6px 12px',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: C.amber,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            GHI (W/m²)
          </span>

          {/* Original / Corrected Toggle Pill matching Screenshot 3 */}
          {isIntra && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                background: '#0c0c0e',
                border: '1px solid #27272a',
                borderRadius: '4px',
                padding: '1px',
              }}
            >
              <button
                type="button"
                onClick={() => setIsCorrected(false)}
                style={{
                  background: !isCorrected ? '#3f3f46' : 'transparent',
                  border: 'none',
                  color: !isCorrected ? '#ffffff' : '#71717a',
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => setIsCorrected(true)}
                style={{
                  background: isCorrected ? '#3f3f46' : 'transparent',
                  border: 'none',
                  color: isCorrected ? '#ffffff' : '#71717a',
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                Corrected
              </button>
            </div>
          )}
        </div>

        <div style={{ position: 'relative', width: '100%' }}>
          {isIntra ? (
            /* Multi-Day Horizon (Oct 18 12:00 -> Oct 21 00:00) 3 Peaks matching Screenshot 3 */
            <svg viewBox="0 0 720 155" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="ghiGrad3DayReact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={isCorrected ? 0.5 : 0.4} />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines (1000.00, 750.00, 500.00, 250.00, 0.00) */}
              <line x1="48" y1="15" x2="700" y2="15" stroke={C.gridLine} strokeWidth="1" />
              <text x="42" y="18" textAnchor="end" fill={C.muted} fontSize="7.5" fontFamily="monospace">1000.00</text>
              <line x1="48" y1="41" x2="700" y2="41" stroke={C.gridLine} strokeWidth="1" />
              <text x="42" y="44" textAnchor="end" fill={C.muted} fontSize="7.5" fontFamily="monospace">750.00</text>
              <line x1="48" y1="67" x2="700" y2="67" stroke={C.gridLine} strokeWidth="1" />
              <text x="42" y="70" textAnchor="end" fill={C.muted} fontSize="7.5" fontFamily="monospace">500.00</text>
              <line x1="48" y1="93" x2="700" y2="93" stroke={C.gridLine} strokeWidth="1" />
              <text x="42" y="96" textAnchor="end" fill={C.muted} fontSize="7.5" fontFamily="monospace">250.00</text>
              <line x1="48" y1="120" x2="700" y2="120" stroke="#27272a" strokeWidth="1" />
              <text x="42" y="123" textAnchor="end" fill={C.muted} fontSize="7.5" fontFamily="monospace">0.00</text>

              {/* 3 Bell Peaks */}
              <path
                d="M 48 120 L 60 120 C 75 110, 95 40, 115 38 C 135 40, 155 110, 175 120 L 290 120 C 310 110, 330 32, 350 30 C 370 32, 395 110, 415 120 L 510 120 C 530 110, 550 34, 570 32 C 590 34, 615 110, 635 120 L 700 120 L 700 120 L 48 120 Z"
                fill="url(#ghiGrad3DayReact)"
              />
              <path
                d="M 48 120 L 60 120 C 75 110, 95 40, 115 38 C 135 40, 155 110, 175 120 L 290 120 C 310 110, 330 32, 350 30 C 370 32, 395 110, 415 120 L 510 120 C 530 110, 550 34, 570 32 C 590 34, 615 110, 635 120 L 700 120"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Multi-Day X Labels at 45deg */}
              <g fontSize="7.5" fill={C.muted} fontFamily="monospace" textAnchor="end">
                <text x="115" y="132" transform="rotate(-45 115 132)">Oct 18 12:00</text>
                <text x="230" y="132" transform="rotate(-45 230 132)">Oct 19 00:00</text>
                <text x="350" y="132" transform="rotate(-45 350 132)">Oct 19 12:00</text>
                <text x="460" y="132" transform="rotate(-45 460 132)">Oct 20 00:00</text>
                <text x="570" y="132" transform="rotate(-45 570 132)">Oct 20 12:00</text>
                <text x="680" y="132" transform="rotate(-45 680 132)">Oct 21 00:00</text>
              </g>
            </svg>
          ) : (
            /* 24h Single Day Curve (00:00 to 23:00) matching Screenshot 1 */
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <defs>
                <linearGradient id="ghiGradReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines (0, 250, 500, 750, 1000) */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                const y = padT + chartH * (1 - ratio);
                const val = (ratio * maxGhi).toFixed(2);
                return (
                  <g key={ratio}>
                    <line x1={padL} y1={y} x2={svgWidth - padR} y2={y} stroke={C.gridLine} strokeWidth="1" />
                    <text x={padL - 8} y={y + 3} textAnchor="end" fill={C.muted} fontSize="8" fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                );
              })}

              <path d={ghiArea} fill="url(#ghiGradReal)" />
              <path d={ghiPath} fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

              {FULL_DAY_HOURLY.map((d, i) => {
                const x = getX(i);
                return (
                  <text
                    key={d.time}
                    x={x}
                    y={svgHeight - 6}
                    textAnchor="end"
                    fill={C.muted}
                    fontSize="7.5"
                    fontFamily="monospace"
                    transform={`rotate(-45 ${x} ${svgHeight - 6})`}
                  >
                    {d.time}
                  </text>
                );
              })}

              {FULL_DAY_HOURLY.map((_, i) => (
                <rect
                  key={i}
                  x={getX(i) - chartW / FULL_DAY_HOURLY.length / 2}
                  y={padT}
                  width={chartW / FULL_DAY_HOURLY.length}
                  height={chartH}
                  fill="transparent"
                  style={{ cursor: 'crosshair' }}
                  onMouseEnter={() => setHoverIdx(i)}
                />
              ))}

              {hoverIdx !== null && (
                <g>
                  <line
                    x1={getX(hoverIdx)}
                    y1={padT}
                    x2={getX(hoverIdx)}
                    y2={padT + chartH}
                    stroke="#ffffff"
                    strokeDasharray="2,2"
                    strokeWidth="1"
                  />
                  <circle
                    cx={getX(hoverIdx)}
                    cy={getYGhi(FULL_DAY_HOURLY[hoverIdx].ghi)}
                    r="3.5"
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              )}
            </svg>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <span style={{ color: C.muted, fontSize: '9px', fontWeight: 600 }}>ghi_pred</span>
          {hoveredData && !isIntra && (
            <span style={{ marginLeft: '12px', fontSize: '9.5px', color: '#f59e0b', fontWeight: 700 }}>
              {hoveredData.time}: {hoveredData.ghi.toFixed(2)} W/m²
            </span>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. BOTTOM GRAPH: SOLAR POWER (MW)                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: '8px',
          padding: '8px 12px 6px 12px',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: C.amber,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            SOLAR POWER (MW)
          </span>
        </div>

        <div style={{ position: 'relative', width: '100%' }}>
          {isIntra ? (
            /* Multi-Day Horizon (Oct 18 12:00 -> Oct 21 00:00) with Flagged Anomaly Column matching Screenshot 3 */
            <svg viewBox="0 0 720 155" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="solarGrad3DayReact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Y Numbers (380.00, 285.00, 190.00, 95.00, 0.00) */}
              <line x1="48" y1="15" x2="700" y2="15" stroke={C.gridLine} strokeWidth="1" />
              <text x="42" y="18" textAnchor="end" fill={C.muted} fontSize="7.5" fontFamily="monospace">380.00</text>
              <line x1="48" y1="41" x2="700" y2="41" stroke={C.gridLine} strokeWidth="1" />
              <text x="42" y="44" textAnchor="end" fill={C.muted} fontSize="7.5" fontFamily="monospace">285.00</text>
              <line x1="48" y1="67" x2="700" y2="67" stroke={C.gridLine} strokeWidth="1" />
              <text x="42" y="70" textAnchor="end" fill={C.muted} fontSize="7.5" fontFamily="monospace">190.00</text>
              <line x1="48" y1="93" x2="700" y2="93" stroke={C.gridLine} strokeWidth="1" />
              <text x="42" y="96" textAnchor="end" fill={C.muted} fontSize="7.5" fontFamily="monospace">95.00</text>
              <line x1="48" y1="120" x2="700" y2="120" stroke="#27272a" strokeWidth="1" />
              <text x="42" y="123" textAnchor="end" fill={C.muted} fontSize="7.5" fontFamily="monospace">0.00</text>

              {/* Red Flagged Data Anomaly Column on Day 1 matching Screenshot 3 */}
              <rect x="105" y="18" width="18" height="102" fill="rgba(239, 68, 68, 0.22)" stroke="#ef4444" strokeDasharray="2,2" strokeWidth="0.8" />

              {/* Cyan Area Fill for Predicted */}
              <path
                d="M 48 120 L 60 120 C 75 110, 95 45, 115 42 C 135 45, 155 110, 175 120 L 290 120 C 310 110, 330 40, 350 38 C 370 40, 395 110, 415 120 L 510 120 C 530 110, 550 42, 570 40 C 590 42, 615 110, 635 120 L 700 120 L 700 120 L 48 120 Z"
                fill="url(#solarGrad3DayReact)"
              />
              {/* Cyan Predicted Curve */}
              <path
                d="M 48 120 L 60 120 C 75 110, 95 45, 115 42 C 135 45, 155 110, 175 120 L 290 120 C 310 110, 330 40, 350 38 C 370 40, 395 110, 415 120 L 510 120 C 530 110, 550 42, 570 40 C 590 42, 615 110, 635 120 L 700 120"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Green Actual Curve on Day 1 (dashed cap) */}
              <path
                d="M 50 120 L 62 120 C 72 80, 85 28, 110 26 C 122 26, 135 48, 145 120"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeDasharray="3,2"
                strokeLinecap="round"
              />

              {/* Multi-Day X Labels at 45deg */}
              <g fontSize="7.5" fill={C.muted} fontFamily="monospace" textAnchor="end">
                <text x="115" y="132" transform="rotate(-45 115 132)">Oct 18 12:00</text>
                <text x="230" y="132" transform="rotate(-45 230 132)">Oct 19 00:00</text>
                <text x="350" y="132" transform="rotate(-45 350 132)">Oct 19 12:00</text>
                <text x="460" y="132" transform="rotate(-45 460 132)">Oct 20 00:00</text>
                <text x="570" y="132" transform="rotate(-45 570 132)">Oct 20 12:00</text>
                <text x="680" y="132" transform="rotate(-45 680 132)">Oct 21 00:00</text>
              </g>
            </svg>
          ) : (
            /* 24h Single Day Curve (00:00 to 23:00) matching Screenshot 1 */
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <defs>
                <linearGradient id="solarGradReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines (0, 500, 1000, 1500, 2000) */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                const y = padT + chartH * (1 - ratio);
                const val = (ratio * maxPower).toFixed(2);
                return (
                  <g key={ratio}>
                    <line x1={padL} y1={y} x2={svgWidth - padR} y2={y} stroke={C.gridLine} strokeWidth="1" />
                    <text x={padL - 8} y={y + 3} textAnchor="end" fill={C.muted} fontSize="8" fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                );
              })}

              <path d={predArea} fill="url(#solarGradReal)" />
              <path d={predPath} fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={actualPath} fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

              {FULL_DAY_HOURLY.map((d, i) => {
                const x = getX(i);
                return (
                  <text
                    key={d.time}
                    x={x}
                    y={svgHeight - 6}
                    textAnchor="end"
                    fill={C.muted}
                    fontSize="7.5"
                    fontFamily="monospace"
                    transform={`rotate(-45 ${x} ${svgHeight - 6})`}
                  >
                    {d.time}
                  </text>
                );
              })}

              {FULL_DAY_HOURLY.map((_, i) => (
                <rect
                  key={i}
                  x={getX(i) - chartW / FULL_DAY_HOURLY.length / 2}
                  y={padT}
                  width={chartW / FULL_DAY_HOURLY.length}
                  height={chartH}
                  fill="transparent"
                  style={{ cursor: 'crosshair' }}
                  onMouseEnter={() => setHoverIdx(i)}
                />
              ))}

              {hoverIdx !== null && (
                <g>
                  <line
                    x1={getX(hoverIdx)}
                    y1={padT}
                    x2={getX(hoverIdx)}
                    y2={padT + chartH}
                    stroke="#ffffff"
                    strokeDasharray="2,2"
                    strokeWidth="1"
                  />
                  <circle
                    cx={getX(hoverIdx)}
                    cy={getYPower(FULL_DAY_HOURLY[hoverIdx].predicted)}
                    r="3.5"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {FULL_DAY_HOURLY[hoverIdx].actual !== null && (
                    <circle
                      cx={getX(hoverIdx)}
                      cy={getYPower(FULL_DAY_HOURLY[hoverIdx].actual!)}
                      r="3.5"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  )}
                </g>
              )}
            </svg>
          )}
        </div>

        {/* Legend matching Screenshot 3 & Screenshot 1 */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span style={{ color: C.muted, fontSize: '9px', fontWeight: 600 }}>solar_actual</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
            <span style={{ color: C.muted, fontSize: '9px', fontWeight: 600 }}>solar_pred</span>
          </div>
          {isIntra && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.25)' }} />
              <span style={{ color: C.muted, fontSize: '9px', fontWeight: 600 }}>Actual generation data flagged by source</span>
            </div>
          )}
          {hoveredData && !isIntra && (
            <span style={{ marginLeft: '8px', fontSize: '9.5px', color: '#38bdf8', fontWeight: 700 }}>
              {hoveredData.time}: Pred {hoveredData.predicted.toFixed(2)} MW | Act {hoveredData.actual?.toFixed(2) ?? '—'} MW
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
