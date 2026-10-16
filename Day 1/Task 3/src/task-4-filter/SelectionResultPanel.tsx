import React from 'react';
import type { RegionTelemetry } from './regions';

export interface SelectionResultPanelProps {
  selectedRegion: string;
  selectedDate: string;
  regionDetails?: RegionTelemetry;
  onClear: () => void;
}

export const SelectionResultPanel: React.FC<SelectionResultPanelProps> = ({
  selectedRegion,
  selectedDate,
  regionDetails,
}) => {
  const hasActiveFilters = Boolean(selectedRegion || selectedDate);

  return (
    <section
      aria-labelledby="result-panel-heading"
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #27272a',
          paddingBottom: '12px',
          marginBottom: '16px',
        }}
      >
        <h3
          id="result-panel-heading"
          style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#e4e4e7',
            margin: 0,
          }}
        >
          Active Selection &amp; Mock Result Panel
        </h3>

        <span
          style={{
            fontSize: '11px',
            color: hasActiveFilters ? '#8b5cf6' : '#71717a',
            fontWeight: 600,
          }}
        >
          {hasActiveFilters ? '● Live Synchronized' : '○ Waiting for user selection'}
        </span>
      </div>

      {!hasActiveFilters ? (
        <div
          role="status"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '36px 16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px', color: '#52525b' }}>📊</div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#a1a1aa', margin: '0 0 4px 0' }}>
            No Active Filters Selected
          </h4>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0, maxWidth: '400px' }}>
            Please select a grid region or forecast run date using the controlled inputs above to preview regional power metrics and telemetry.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Selected Region Box */}
          <div style={{ backgroundColor: '#121212', border: '1px solid #27272a', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Selected Region
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#8b5cf6' }}>
              {regionDetails ? regionDetails.name : selectedRegion || 'Not Selected'}
            </div>
          </div>

          {/* Forecast Date Box */}
          <div style={{ backgroundColor: '#121212', border: '1px solid #27272a', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Forecast Run Date
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b', fontVariantNumeric: 'tabular-nums' }}>
              {selectedDate || 'Not Specified'}
            </div>
          </div>

          {/* Capacity Box */}
          <div style={{ backgroundColor: '#121212', border: '1px solid #27272a', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Simulated Capacity
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
              {regionDetails ? `${regionDetails.installedCapacityMW.toLocaleString()} MW` : '—'}
            </div>
          </div>

          {/* Nodes Box */}
          <div style={{ backgroundColor: '#121212', border: '1px solid #27272a', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Grid Telemetry Status
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8' }}>
              {regionDetails ? `${regionDetails.substations} Substations Connected` : 'Awaiting Query'}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
