import React, { useState } from 'react';
import { FilterControls } from './FilterControls';
import { SelectionResultPanel } from './SelectionResultPanel';
import { getRegionById } from './regions';
import { EnergySummaryCard } from '../components/EnergySummaryCard';

export const Task4View: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('WR');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-14');
  const [viewportWidth, setViewportWidth] = useState<'100%' | '768px' | '375px'>('100%');

  const activeRegion = getRegionById(selectedRegion);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleResetFilters = () => {
    setSelectedRegion('');
    setSelectedDate('');
  };

  const peakForecastValue = activeRegion
    ? Math.round(activeRegion.installedCapacityMW * 0.42 * 10) / 10
    : null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Subheader and Viewport Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            Task 04: Controlled Input &amp; Filter Interaction
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#71717a' }}>
            Demonstrates React state, synthetic event handlers, controlled inputs, and mobile responsiveness.
          </p>
        </div>

        {/* Viewport Simulation Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#18181b',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #27272a',
          }}
        >
          <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 600 }}>Viewport:</span>
          <button
            onClick={() => setViewportWidth('100%')}
            style={{
              backgroundColor: viewportWidth === '100%' ? '#8b5cf6' : '#27272a',
              color: '#ffffff',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Desktop
          </button>
          <button
            onClick={() => setViewportWidth('768px')}
            style={{
              backgroundColor: viewportWidth === '768px' ? '#8b5cf6' : '#27272a',
              color: '#ffffff',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tablet (768px)
          </button>
          <button
            onClick={() => setViewportWidth('375px')}
            style={{
              backgroundColor: viewportWidth === '375px' ? '#8b5cf6' : '#27272a',
              color: '#ffffff',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Mobile (375px)
          </button>
        </div>
      </div>

      {/* Viewport Frame */}
      <div
        style={{
          width: viewportWidth,
          maxWidth: '1200px',
          margin: '0 auto',
          transition: 'width 0.3s ease',
          backgroundColor: '#121212',
          border: viewportWidth !== '100%' ? '2px dashed #8b5cf6' : '1px solid #1f1f23',
          borderRadius: '12px',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        {viewportWidth !== '100%' && (
          <div style={{ textAlign: 'center', marginBottom: '16px', color: '#8b5cf6', fontSize: '12px', fontWeight: 600 }}>
            Simulating Viewport: {viewportWidth} (Testing narrow screen usability)
          </div>
        )}

        {/* 1. Controlled Filter Controls */}
        <FilterControls
          selectedRegion={selectedRegion}
          selectedDate={selectedDate}
          onRegionChange={handleRegionChange}
          onDateChange={handleDateChange}
          onReset={handleResetFilters}
        />

        {/* 2. Mock Result Panel showing active selections */}
        <SelectionResultPanel
          selectedRegion={selectedRegion}
          selectedDate={selectedDate}
          regionDetails={activeRegion}
          onClear={handleResetFilters}
        />

        {/* 3. Reactive Energy Summary Cards powered by Shared Task 3 Component */}
        <section style={{ marginTop: '28px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '12px' }}>
            Reactive Metrics Derived from Selected Filters (Shared Task 3 Component)
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: viewportWidth === '375px' ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
            }}
          >
            {/* Card 1: Regional Capacity (Matching Task 3 Context Card) */}
            <EnergySummaryCard
              title="Regional Capacity"
              label={activeRegion ? 'Installed Capacity' : 'No Region'}
              sublabel={activeRegion ? activeRegion.code : 'ISTS'}
              value={activeRegion ? activeRegion.installedCapacityMW : null}
              unit="MW"
              variant="amber"
              icon="📍"
              isEmpty={!activeRegion}
              metadata={[
                { label: 'Selected Region', value: activeRegion ? activeRegion.name : 'None Selected' },
                { label: 'Grid Code', value: activeRegion ? activeRegion.code : '--' },
              ]}
            />

            {/* Card 2: Peak Forecast (Matching Task 3 Live Block Card) */}
            <EnergySummaryCard
              title="Peak Forecast"
              label="Forecast Block T+1"
              sublabel={selectedDate || 'Today'}
              value={peakForecastValue}
              unit="MW"
              variant="violet"
              icon="⚡"
              badge={selectedDate ? '12:30 IST' : undefined}
              isEmpty={!selectedDate || !activeRegion}
              metadata={[
                { label: 'Run Date', value: selectedDate || 'Not Set' },
                { label: 'Forecast Revision', value: 'Rev-0' },
              ]}
            />

            {/* Card 3: Grid Status (Matching Task 3 Live Status Card) */}
            <EnergySummaryCard
              title="Grid Telemetry"
              label="Live Substation Feed"
              sublabel="Active"
              value={activeRegion ? activeRegion.substations : null}
              unit="Nodes"
              variant="green"
              icon="📈"
              badge="Live IST"
              isEmpty={!activeRegion}
              metadata={[
                { label: 'Telemetry Latency', value: '< 240ms' },
                { label: 'Data Quality', value: '100% Validated' },
              ]}
            />
          </div>
        </section>
      </div>
    </div>
  );
};
