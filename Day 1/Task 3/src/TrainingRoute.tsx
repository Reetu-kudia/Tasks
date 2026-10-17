import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EnergySummaryCard } from './components/EnergySummaryCard';
import type { MetaItem } from './components/EnergySummaryCard.types';
import { fetchTrainingEnergy } from './task-5-api/apiService';
import type { ApiExecutionResult, RegionalEnergyTelemetry } from './task-5-api/types';
import { REGIONS_DATA } from './task-4-filter/regions';

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
  Sun: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
};

const DEFAULT_REGION = 'WR';
const DEFAULT_DATE = '2026-10-14';

export const TrainingRoute: React.FC = () => {
  // Controlled Filter States (Task 04)
  const [selectedRegion, setSelectedRegion] = useState<string>(DEFAULT_REGION);
  const [selectedDate, setSelectedDate] = useState<string>(DEFAULT_DATE);

  // Manual Test Overrides (Task 03)
  const [manualLoading, setManualLoading] = useState<boolean>(false);
  const [manualEmpty, setManualEmpty] = useState<boolean>(false);
  const [viewportWidth, setViewportWidth] = useState<'100%' | '768px' | '375px'>('100%');

  // API Execution State & Stale Request Protection (Task 05)
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState<ApiExecutionResult | null>(null);
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const latestRequestIdRef = useRef<number>(0);

  // API Fetch Callback with Stale Request Protection
  const executeApiCall = useCallback(async (region?: string, date?: string) => {
    const currentRequestId = ++latestRequestIdRef.current;
    setIsApiLoading(true);

    try {
      const result = await fetchTrainingEnergy(region, date);
      if (currentRequestId === latestRequestIdRef.current) {
        setApiResult(result);
      }
    } catch (err) {
      if (currentRequestId === latestRequestIdRef.current) {
        console.error('Training API execution error:', err);
      }
    } finally {
      if (currentRequestId === latestRequestIdRef.current) {
        setIsApiLoading(false);
      }
    }
  }, []);

  // Initial Fetch on component mount
  useEffect(() => {
    executeApiCall(DEFAULT_REGION, DEFAULT_DATE);
  }, [executeApiCall]);

  // Handler for Region Change
  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion);
    executeApiCall(newRegion, selectedDate);
  };

  // Handler for Date Change
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    executeApiCall(selectedRegion, newDate);
  };

  // Handler for Clear Filters
  const handleClearFilters = () => {
    setSelectedRegion(DEFAULT_REGION);
    setSelectedDate(DEFAULT_DATE);
    executeApiCall(DEFAULT_REGION, DEFAULT_DATE);
  };

  // Quick Error Testing Scenarios
  const handleTrigger400 = () => {
    executeApiCall(undefined, selectedDate);
  };

  const handleTrigger404 = () => {
    executeApiCall('UNKNOWN_REGION', selectedDate);
  };

  // Active Regional Telemetry from API
  const activeData: RegionalEnergyTelemetry | undefined =
    apiResult && apiResult.ok && apiResult.data && 'data' in apiResult.data
      ? apiResult.data.data
      : undefined;

  // Effective loading & empty states (combines API status + manual test toggle)
  const isDashboardLoading = isApiLoading || manualLoading;
  const isDashboardEmpty = manualEmpty || !activeData;

  // Context metadata for Forecast Context Card
  const contextMetadata: MetaItem[] = activeData
    ? [
        { label: 'Installed Capacity', value: `${activeData.installedCapacityMW.toLocaleString()} MW` },
        { label: 'Forecasting Type', value: 'Nowcasting' },
        { label: 'Revision', value: activeData.revision },
        { label: 'Time Range', value: activeData.timeRange },
        { label: 'Run Time', value: `${activeData.queriedDate}, 08:30` },
      ]
    : [
        { label: 'Installed Capacity', value: '26,655.2 MW' },
        { label: 'Forecasting Type', value: 'Nowcasting' },
        { label: 'Revision', value: 'Till Latest' },
        { label: 'Time Range', value: 'Oct 14, 00:00 → Oct 14, 23:45' },
        { label: 'Run Time', value: 'Oct 14, 08:30' },
      ];

  // Helper for Status Badge Color
  const getStatusBadgeStyle = (status: number) => {
    if (status >= 200 && status < 300) {
      return { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#34d399' };
    }
    if (status === 400) {
      return { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#f87171' };
    }
    return { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#fbbf24' };
  };

  const currentEndpoint = `/api/training/energy?region=${selectedRegion}&date=${selectedDate}`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', color: '#e4e4e7', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top Main Navigation Header */}
      <header style={{ maxWidth: '1200px', margin: '0 auto 20px auto', borderBottom: '1px solid #27272a', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f59e0b' }}>
              GI-IITB Unified Training Workspace (Day 1)
            </span>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0 0 0', color: '#ffffff' }}>
              Task 03: Energy Summary Card Component
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#71717a' }}>
              Unified Training Dashboard · Controlled Filters (Task 04) · Live Training API &amp; Inspector (Task 05)
            </p>
          </div>

          {/* Test States & Viewport Simulation Controls */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
              background: '#18181b',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #27272a',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>Test States:</span>
            <button
              onClick={() => setManualLoading(!manualLoading)}
              style={{
                backgroundColor: manualLoading ? '#f59e0b' : '#27272a',
                color: manualLoading ? '#000000' : '#ffffff',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              aria-label="Toggle Loading State"
            >
              {manualLoading ? 'Loading: ON' : 'Toggle Loading'}
            </button>
            <button
              onClick={() => setManualEmpty(!manualEmpty)}
              style={{
                backgroundColor: manualEmpty ? '#ef4444' : '#27272a',
                color: '#ffffff',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              aria-label="Toggle Empty State"
            >
              {manualEmpty ? 'Empty: ON' : 'Toggle Empty'}
            </button>

            <span style={{ margin: '0 4px', color: '#3f3f46' }}>|</span>

            <span style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>Viewport:</span>
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
      </header>

      {/* Main Container Viewport Frame */}
      <main
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
            Simulating Viewport: {viewportWidth} (Testing narrow screen responsiveness)
          </div>
        )}

        {/* ========================================================= */}
        {/* COMPACT FILTERS & API TEST TOOLBAR (Task 04 + Task 05)    */}
        {/* ========================================================= */}
        <section
          aria-labelledby="dashboard-filters-heading"
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #27272a',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f59e0b' }}>
                Grid &amp; Forecast Filters
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 7px',
                  borderRadius: '4px',
                }}
              >
                Controlled Inputs Active
              </span>
            </div>

            {/* Live API Status Badge */}
            {apiResult && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#71717a' }}>API:</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: getStatusBadgeStyle(apiResult.status).bg,
                    border: `1px solid ${getStatusBadgeStyle(apiResult.status).border}`,
                    color: getStatusBadgeStyle(apiResult.status).text,
                    fontFamily: 'monospace',
                  }}
                >
                  {apiResult.status} {apiResult.statusText}
                </span>
                <span style={{ fontSize: '11px', color: '#71717a', fontVariantNumeric: 'tabular-nums' }}>
                  ({apiResult.durationMs}ms)
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* 1. Grid Region Select (Controlled Input) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 200px' }}>
              <label htmlFor="grid-region-select" style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>
                Grid Region <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                id="grid-region-select"
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                disabled={isApiLoading}
                style={{
                  backgroundColor: '#121212',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px',
                  color: '#f4f4f5',
                  fontSize: '12px',
                  padding: '7px 10px',
                  width: '100%',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {REGIONS_DATA.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Forecast Run Date Input (Controlled Input) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 180px' }}>
              <label htmlFor="forecast-date-input" style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa' }}>
                Forecast Run Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="forecast-date-input"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                disabled={isApiLoading}
                style={{
                  backgroundColor: '#121212',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px',
                  color: '#f4f4f5',
                  fontSize: '12px',
                  padding: '7px 10px',
                  width: '100%',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 3. Clear Filters Button */}
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={isApiLoading || (selectedRegion === DEFAULT_REGION && selectedDate === DEFAULT_DATE)}
              style={{
                backgroundColor: '#27272a',
                color: '#e4e4e7',
                border: '1px solid #3f3f46',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                height: '35px',
                transition: 'all 0.15s ease',
              }}
              title="Reset Region and Date to Defaults"
            >
              Clear Filters
            </button>

            {/* Divider */}
            <div style={{ height: '24px', width: '1px', backgroundColor: '#3f3f46', margin: '0 4px', alignSelf: 'center' }} />

            {/* 4. API Action Test Controls (Task 05 Integration) */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => executeApiCall(selectedRegion, selectedDate)}
                disabled={isApiLoading}
                style={{
                  backgroundColor: '#8b5cf6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: isApiLoading ? 'not-allowed' : 'pointer',
                  height: '35px',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {isApiLoading ? 'Fetching...' : '⟳ Call API'}
              </button>

              <button
                type="button"
                onClick={handleTrigger400}
                disabled={isApiLoading}
                style={{
                  backgroundColor: '#27272a',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  padding: '7px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  height: '35px',
                }}
                title="Test 400 Bad Request by omitting region parameter"
              >
                Test 400 Error
              </button>

              <button
                type="button"
                onClick={handleTrigger404}
                disabled={isApiLoading}
                style={{
                  backgroundColor: '#27272a',
                  color: '#f59e0b',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  padding: '7px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  height: '35px',
                }}
                title="Test 404 Not Found by requesting an unknown region"
              >
                Test 404 Error
              </button>

              <button
                type="button"
                onClick={() => setShowInspector(!showInspector)}
                style={{
                  backgroundColor: showInspector ? '#3f3f46' : '#1f1f23',
                  color: '#a1a1aa',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  height: '35px',
                }}
              >
                {showInspector ? 'Hide Inspector ▴' : 'Inspect API ▾'}
              </button>
            </div>
          </div>

          {/* Collapsible API Inspector (Task 05 without separate page) */}
          {showInspector && (
            <div
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #27272a',
              }}
            >
              <div
                style={{
                  fontFamily: 'Consolas, monospace',
                  fontSize: '11px',
                  color: '#e4e4e7',
                  backgroundColor: '#121212',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #27272a',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <span style={{ color: '#8b5cf6', fontWeight: 700 }}>GET</span>{' '}
                  <span style={{ color: '#d4d4d8' }}>{apiResult?.requestedUrl || currentEndpoint}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#71717a' }}>Next.js Route Handler / Vite Middleware</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a', marginBottom: '4px' }}>
                    Response Headers
                  </div>
                  <div
                    style={{
                      backgroundColor: '#121212',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontFamily: 'Consolas, monospace',
                      fontSize: '11px',
                      lineHeight: '1.5',
                      maxHeight: '140px',
                      overflowY: 'auto',
                    }}
                  >
                    {apiResult && Object.keys(apiResult.headers).length > 0 ? (
                      Object.entries(apiResult.headers).map(([key, val]) => (
                        <div key={key}>
                          <span style={{ color: '#8b5cf6' }}>{key}:</span> <span style={{ color: '#e4e4e7' }}>{val}</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ color: '#71717a' }}>No headers recorded yet.</span>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a', marginBottom: '4px' }}>
                    Response JSON Body
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      backgroundColor: '#121212',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontFamily: 'Consolas, monospace',
                      fontSize: '11px',
                      lineHeight: '1.4',
                      maxHeight: '140px',
                      overflowY: 'auto',
                      color: apiResult?.ok ? '#34d399' : apiResult?.status === 404 ? '#fbbf24' : '#f87171',
                    }}
                  >
                    {apiResult ? apiResult.rawJson : '// Waiting for API execution...'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Validation & Error Message Alert Banner */}
          {apiResult && !apiResult.ok && (
            <div
              style={{
                marginTop: '14px',
                padding: '10px 14px',
                borderRadius: '6px',
                backgroundColor: apiResult.status === 400 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${apiResult.status === 400 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <strong style={{ color: apiResult.status === 400 ? '#ef4444' : '#f59e0b', fontSize: '12px' }}>
                  {apiResult.status === 400 ? '⚠️ 400 Bad Request:' : '🔍 404 Not Found:'}
                </strong>{' '}
                <span style={{ fontSize: '12px', color: '#e4e4e7' }}>
                  {apiResult.data && 'error' in apiResult.data ? apiResult.data.error.message : 'An error occurred'}
                </span>
                {apiResult.data && 'error' in apiResult.data && apiResult.data.error.details && (
                  <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
                    {apiResult.data.error.details}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => executeApiCall(DEFAULT_REGION, selectedDate)}
                style={{
                  backgroundColor: '#27272a',
                  color: '#ffffff',
                  border: '1px solid #3f3f46',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Reset to Valid Region
              </button>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* SECTION 1: UPCOMING FORECAST BLOCK CARDS (T to T+3)       */}
        {/* ========================================================= */}
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa', margin: 0 }}>
              1. Upcoming Forecast Block Cards (Matched to Dashboard Image)
            </h2>
            {activeData && (
              <span style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 600 }}>
                ● Active Region: {activeData.regionName} ({activeData.queriedDate})
              </span>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: viewportWidth === '375px' ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            {/* T (08:30) */}
            <EnergySummaryCard
              title="Upcoming Forecast"
              label="Time Block: T"
              sublabel="08:30"
              value={activeData?.forecastBlocks?.[0]?.value ?? (activeData ? null : 8250.7)}
              unit="MW"
              variant="violet"
              badge="08:30"
              icon={<Icons.Zap />}
              isLoading={isDashboardLoading}
              isEmpty={isDashboardEmpty}
              emptyMessage={apiResult?.ok === false ? 'API Error: check inspector above' : 'No forecast data available for selected filters'}
            />

            {/* T+1 (08:45) */}
            <EnergySummaryCard
              title="Upcoming Forecast"
              label="Time Block: T+1"
              sublabel="08:45"
              value={activeData?.forecastBlocks?.[1]?.value ?? (activeData ? null : 9389.0)}
              unit="MW"
              variant="violet"
              badge="08:45"
              icon={<Icons.Zap />}
              isLoading={isDashboardLoading}
              isEmpty={isDashboardEmpty}
              emptyMessage={apiResult?.ok === false ? 'API Error: check inspector above' : 'No forecast data available for selected filters'}
            />

            {/* T+2 (09:00) */}
            <EnergySummaryCard
              title="Upcoming Forecast"
              label="Time Block: T+2"
              sublabel="09:00"
              value={activeData?.forecastBlocks?.[2]?.value ?? (activeData ? null : 10791.5)}
              unit="MW"
              variant="violet"
              badge="09:00"
              icon={<Icons.Zap />}
              isLoading={isDashboardLoading}
              isEmpty={isDashboardEmpty}
              emptyMessage={apiResult?.ok === false ? 'API Error: check inspector above' : 'No forecast data available for selected filters'}
            />

            {/* T+3 (09:15) */}
            <EnergySummaryCard
              title="Upcoming Forecast"
              label="Time Block: T+3"
              sublabel="09:15"
              value={activeData?.forecastBlocks?.[3]?.value ?? (activeData ? null : 11694.1)}
              unit="MW"
              variant="violet"
              badge="09:15"
              icon={<Icons.Zap />}
              isLoading={isDashboardLoading}
              isEmpty={isDashboardEmpty}
              emptyMessage={apiResult?.ok === false ? 'API Error: check inspector above' : 'No forecast data available for selected filters'}
            />
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: HIGH-DENSITY CONTEXT & LIVE METRICS            */}
        {/* ========================================================= */}
        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '12px' }}>
            2. High-Density Context &amp; Live Telemetry
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: viewportWidth === '375px' ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {/* Card 1: Forecast Context / Installed Capacity */}
            <EnergySummaryCard
              title="Forecast Context"
              label="Installed Capacity"
              value={activeData ? activeData.installedCapacityMW : 26655.2}
              unit="MW"
              variant="amber"
              badge={activeData ? activeData.regionCode : 'ISTS'}
              icon={<Icons.MapPin />}
              metadata={contextMetadata}
              isLoading={isDashboardLoading}
              isEmpty={isDashboardEmpty}
              emptyMessage={apiResult?.ok === false ? 'API Error: check inspector above' : 'No context data available'}
            />

            {/* Card 2: Live Solar Power (Actual Grid Reading) */}
            <EnergySummaryCard
              title="Live Solar Power"
              label="Actual Grid Reading"
              sublabel="08:15 IST"
              value={activeData ? activeData.actualSolarMW : 7842.3}
              unit="MW"
              variant="green"
              badge={activeData?.actualSolarMW !== null && activeData?.actualSolarMW !== undefined ? 'Live IST' : 'No Feed'}
              icon={<Icons.Activity />}
              isLoading={isDashboardLoading}
              isEmpty={manualEmpty || !activeData || activeData.actualSolarMW === null}
              emptyMessage={
                activeData && activeData.actualSolarMW === null
                  ? `Telemetry feed unavailable for ${activeData.regionName}`
                  : 'No live telemetry recorded'
              }
              metadata={[
                { label: 'Telemetry Latency', value: '< 240ms' },
                {
                  label: 'Data Quality',
                  value: activeData?.actualSolarMW !== null ? '100% Validated' : 'Offline / No Sensor',
                },
              ]}
            />

            {/* Card 3: Solar Radiation (GHI) */}
            <EnergySummaryCard
              title="Solar Radiation (GHI)"
              label="Peak Estimated"
              sublabel="12:30 IST"
              value={activeData ? activeData.solarRadiationGhi : 842.5}
              unit="W/m²"
              variant="blue"
              badge={activeData?.solarRadiationGhi !== null && activeData?.solarRadiationGhi !== undefined ? 'Clear Sky' : 'No Sensor'}
              icon={<Icons.Sun />}
              isLoading={isDashboardLoading}
              isEmpty={manualEmpty || !activeData || activeData.solarRadiationGhi === null}
              emptyMessage={
                activeData && activeData.solarRadiationGhi === null
                  ? `GHI pyranometer offline in ${activeData.regionName}`
                  : 'No radiation reading'
              }
              metadata={[
                { label: 'Pyranometer Status', value: activeData?.solarRadiationGhi !== null ? 'Calibrated' : 'Offline' },
                { label: 'Forecast Model', value: 'ECMWF IFS HighRes' },
              ]}
            />
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: SIDE-BY-SIDE STATE VERIFICATION (Task 03)      */}
        {/* ========================================================= */}
        <section>
          <h2 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '12px' }}>
            3. Side-by-Side State Verification (Active / Loading / Empty)
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: viewportWidth === '375px' ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px',
            }}
          >
            {/* Active Demo */}
            <EnergySummaryCard
              title="State: Active"
              label="Nominal Power"
              sublabel="Active"
              value={12450.0}
              unit="MW"
              variant="violet"
              badge="Normal"
              icon={<Icons.Zap />}
              isLoading={false}
              isEmpty={false}
            />

            {/* Skeleton Loading Demo */}
            <EnergySummaryCard
              title="State: Loading"
              label="Shimmer Skeleton"
              sublabel="Loading"
              value={null}
              unit="MW"
              variant="amber"
              badge="Shimmer"
              icon={<Icons.Zap />}
              isLoading={true}
            />

            {/* Empty Fallback Demo */}
            <EnergySummaryCard
              title="State: Empty / No Data"
              label="Offline Metric"
              sublabel="Offline"
              value={null}
              unit="MW"
              variant="blue"
              badge="Offline"
              icon={<Icons.Zap />}
              isEmpty={true}
              emptyMessage="No solar generation recorded for this date."
            />
          </div>
        </section>
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
          Unified Architecture: <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Task 03 (Cards)</span> ·{' '}
          <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Task 04 (Controlled Filters)</span> ·{' '}
          <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Task 05 (Live API &amp; Inspector)</span>
        </div>
        <div>
          Report: <code>reports/week-1/day-01/task-03-summary-card.md</code>
        </div>
      </footer>
    </div>
  );
};
export default TrainingRoute;
