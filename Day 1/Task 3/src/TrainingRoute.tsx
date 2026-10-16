import React, { useState } from 'react';
import { EnergySummaryCard } from './components/EnergySummaryCard';
import type { MetaItem } from './components/EnergySummaryCard.types';
import { Task4View } from './task-4-filter/Task4View';
import { Task5View } from './task-5-api/Task5View';

// Simple SVG Icons for training route
const Icons = {
  Zap: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  MapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Activity: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
};

export const TrainingRoute: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'task3' | 'task4' | 'task5'>('task3');
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalEmpty, setGlobalEmpty] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<'100%' | '768px' | '375px'>('100%');

  const forecastBlocks = [
    { title: 'Upcoming Forecast', label: 'T', sublabel: '08:30', value: 8250.7, unit: 'MW', variant: 'violet' as const },
    { title: 'Upcoming Forecast', label: 'T+1', sublabel: '08:45', value: 9389.0, unit: 'MW', variant: 'violet' as const },
    { title: 'Upcoming Forecast', label: 'T+2', sublabel: '09:00', value: 10791.5, unit: 'MW', variant: 'violet' as const },
    { title: 'Upcoming Forecast', label: 'T+3', sublabel: '09:15', value: 11694.1, unit: 'MW', variant: 'violet' as const },
  ];

  const contextMetadata: MetaItem[] = [
    { label: 'Installed Capacity', value: '26655.2 MW' },
    { label: 'Forecasting Type', value: 'Nowcasting' },
    { label: 'Revision', value: 'Till Latest' },
    { label: 'Time Range', value: 'Oct 14, 00:00 → Oct 14, 23:45' },
    { label: 'Run Time', value: 'Oct 14, 08:30' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', color: '#e4e4e7', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top Main Navigation Header */}
      <header style={{ maxWidth: '1200px', margin: '0 auto 24px auto', borderBottom: '1px solid #27272a', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f59e0b' }}>
              GI-IITB Unified Training Workspace (Day 1)
            </span>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0 0 0', color: '#ffffff' }}>
              Day 1 Unified Codebase: Tasks 03 + 04 + 05
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#71717a' }}>
              DRY Monolithic Architecture · Single Master Card Component · Shared State &amp; API Services
            </p>
          </div>

          {/* Tab Switcher */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#18181b',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid #27272a',
              gap: '4px',
            }}
          >
            <button
              onClick={() => setActiveTab('task3')}
              style={{
                backgroundColor: activeTab === 'task3' ? '#f59e0b' : 'transparent',
                color: activeTab === 'task3' ? '#000000' : '#a1a1aa',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Task 03: Summary Cards
            </button>

            <button
              onClick={() => setActiveTab('task4')}
              style={{
                backgroundColor: activeTab === 'task4' ? '#8b5cf6' : 'transparent',
                color: activeTab === 'task4' ? '#ffffff' : '#a1a1aa',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Task 04: Filter Interaction
            </button>

            <button
              onClick={() => setActiveTab('task5')}
              style={{
                backgroundColor: activeTab === 'task5' ? '#10b981' : 'transparent',
                color: activeTab === 'task5' ? '#000000' : '#a1a1aa',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Task 05: First API &amp; Inspector
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* ========================================================= */}
        {/* TAB 1: TASK 03 VIEW (Energy Summary Cards & States)       */}
        {/* ========================================================= */}
        {activeTab === 'task3' && (
          <div>
            {/* Task 3 Controls Bar */}
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
                  Task 03: Energy Summary Card Component
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#71717a' }}>
                  Master shared card component used across all Day 1 tasks. Test loading, empty, and responsive states.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', background: '#18181b', padding: '6px 12px', borderRadius: '8px', border: '1px solid #27272a' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>Test States:</span>
                <button
                  onClick={() => setGlobalLoading(!globalLoading)}
                  style={{
                    backgroundColor: globalLoading ? '#f59e0b' : '#27272a',
                    color: globalLoading ? '#000000' : '#ffffff',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {globalLoading ? 'Loading: ON' : 'Toggle Loading'}
                </button>
                <button
                  onClick={() => setGlobalEmpty(!globalEmpty)}
                  style={{
                    backgroundColor: globalEmpty ? '#ef4444' : '#27272a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {globalEmpty ? 'Empty: ON' : 'Toggle Empty'}
                </button>

                <span style={{ margin: '0 4px', color: '#3f3f46' }}>|</span>

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
                  Tablet
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
                  Mobile
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
              {/* Section 1: Forecast Blocks */}
              <section style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '12px' }}>
                  1. Multi-Horizon Forecast Blocks (T to T+3)
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: viewportWidth === '375px' ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {forecastBlocks.map((block) => (
                    <EnergySummaryCard
                      key={block.label}
                      title={block.title}
                      label={`Time Block: ${block.label}`}
                      sublabel={block.sublabel}
                      value={block.value}
                      unit={block.unit}
                      variant={block.variant}
                      badge={block.sublabel}
                      icon={<Icons.Zap />}
                      isLoading={globalLoading}
                      isEmpty={globalEmpty}
                    />
                  ))}
                </div>
              </section>

              {/* Section 2: High Density Context */}
              <section style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '12px' }}>
                  2. High-Density Context &amp; Live Telemetry
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: viewportWidth === '375px' ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '12px',
                  }}
                >
                  <EnergySummaryCard
                    title="Forecast Context"
                    label="Installed Capacity"
                    value={26655.2}
                    unit="MW"
                    variant="amber"
                    badge="ISTS"
                    icon={<Icons.MapPin />}
                    metadata={contextMetadata}
                    isLoading={globalLoading}
                    isEmpty={globalEmpty}
                  />

                  <EnergySummaryCard
                    title="Grid Telemetry"
                    label="Live Substation Feed"
                    sublabel="Active"
                    value={138}
                    unit="Nodes"
                    variant="green"
                    badge="Live IST"
                    icon={<Icons.Activity />}
                    isLoading={globalLoading}
                    isEmpty={globalEmpty}
                    metadata={[
                      { label: 'Telemetry Latency', value: '< 240ms' },
                      { label: 'Data Quality', value: '100% Validated' },
                    ]}
                  />
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TASK 04 VIEW (Filter Interaction & State)          */}
        {/* ========================================================= */}
        {activeTab === 'task4' && <Task4View />}

        {/* ========================================================= */}
        {/* TAB 3: TASK 05 VIEW (First API & Full-Stack Inspector)    */}
        {/* ========================================================= */}
        {activeTab === 'task5' && <Task5View />}
      </main>

      {/* Footer */}
      <footer
        style={{
          maxWidth: '1200px',
          margin: '36px auto 0 auto',
          borderTop: '1px solid #27272a',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: '#71717a',
        }}
      >
        <div>
          Acceptance: <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Task 03</span> ·{' '}
          <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Task 04</span> ·{' '}
          <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Task 05</span> · Unified Architecture
        </div>
        <div>Deliverables: <code>reports/week-1/day-01/</code></div>
      </footer>
    </div>
  );
};
