import React, { useState, useEffect, useCallback } from 'react';
import { FilterControls } from '../task-4-filter/FilterControls';
import { ApiInspectorPanel } from './ApiInspectorPanel';
import { fetchTrainingEnergy } from './apiService';
import type { ApiExecutionResult, RegionalEnergyTelemetry } from './types';
import { EnergySummaryCard } from '../components/EnergySummaryCard';

export const Task5View: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('WR');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-14');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState<ApiExecutionResult | null>(null);
  const [viewportWidth, setViewportWidth] = useState<'100%' | '768px' | '375px'>('100%');

  const executeApiCall = useCallback(async (region?: string, date?: string) => {
    setIsLoading(true);
    try {
      const result = await fetchTrainingEnergy(region, date);
      setApiResult(result);
    } catch (err) {
      console.error('Failed to execute API call:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial call on mount
  useEffect(() => {
    executeApiCall('WR', '2026-10-14');
  }, [executeApiCall]);

  const handleTrigger400 = () => {
    executeApiCall(undefined, selectedDate);
  };

  const handleTrigger404 = () => {
    executeApiCall('UNKNOWN_REGION', selectedDate);
  };

  const activeData: RegionalEnergyTelemetry | undefined =
    apiResult && apiResult.ok && apiResult.data && 'data' in apiResult.data
      ? apiResult.data.data
      : undefined;

  const endpointUrl = `/api/training/energy?region=${selectedRegion}&date=${selectedDate}`;

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
            Task 05: Build &amp; Call a Tiny Training API (Full-Stack Integration)
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#71717a' }}>
            Route Handler (/api/training/energy) returning typed JSON, status codes (200, 400, 404), headers, and live cards.
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

        {/* 1. Filter Controls & Quick Error Triggers */}
        <FilterControls
          selectedRegion={selectedRegion}
          selectedDate={selectedDate}
          onRegionChange={(reg) => {
            setSelectedRegion(reg);
            executeApiCall(reg, selectedDate);
          }}
          onDateChange={(dt) => {
            setSelectedDate(dt);
            executeApiCall(selectedRegion, dt);
          }}
          onReset={() => {
            setSelectedRegion('');
            setSelectedDate('');
            executeApiCall('', '');
          }}
          disabled={isLoading}
        />

        {/* Action Trigger Buttons for Testing 200, 400, 404 */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '20px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #27272a',
            padding: '12px 16px',
            borderRadius: '8px',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            API Actions:
          </span>

          <button
            onClick={() => executeApiCall(selectedRegion, selectedDate)}
            disabled={isLoading}
            style={{
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isLoading ? 'Fetching...' : 'Call API (200 OK)'}
          </button>

          <button
            onClick={handleTrigger400}
            disabled={isLoading}
            style={{
              backgroundColor: '#27272a',
              color: '#ef4444',
              border: '1px solid #ef4444',
              padding: '7px 14px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Test 400 Error (Missing Param)
          </button>

          <button
            onClick={handleTrigger404}
            disabled={isLoading}
            style={{
              backgroundColor: '#27272a',
              color: '#f59e0b',
              border: '1px solid #f59e0b',
              padding: '7px 14px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Test 404 Error (Unknown Region)
          </button>
        </div>

        {/* 2. HTTP Request & Response Inspector */}
        <ApiInspectorPanel lastResult={apiResult} currentEndpoint={endpointUrl} />

        {/* 3. Live Cards Powered By API Response (Shared Task 3 Component) */}
        <section style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa', margin: 0 }}>
              Live Cards Powered By API Response (Shared Task 3 Component)
            </h3>
            <span style={{ fontSize: '11px', color: activeData ? '#10b981' : '#f87171', fontWeight: 600 }}>
              {activeData ? `● Live Data: ${activeData.regionName}` : '○ No Valid Telemetry'}
            </span>
          </div>

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
              label={activeData ? 'Installed Capacity' : 'Unavailable'}
              sublabel={activeData ? activeData.regionCode : 'ISTS'}
              value={activeData ? activeData.installedCapacityMW : null}
              unit="MW"
              variant="amber"
              icon="📍"
              isLoading={isLoading}
              isEmpty={!activeData}
              emptyMessage={apiResult?.ok === false ? 'API Error: check inspector above' : 'Select region to fetch'}
              metadata={
                activeData
                  ? [
                      { label: 'Forecasting Type', value: 'Nowcasting' },
                      { label: 'Revision', value: activeData.revision },
                      { label: 'Queried Date', value: activeData.queriedDate },
                    ]
                  : undefined
              }
            />

            {/* Card 2: Current Forecast (Matching Task 3 Forecast Card) */}
            <EnergySummaryCard
              title="Current Forecast"
              label="Solar Forecast"
              sublabel={activeData ? activeData.queriedDate : '08:30'}
              value={activeData ? activeData.currentForecastMW : null}
              unit="MW"
              variant="violet"
              icon="⚡"
              badge={activeData ? activeData.queriedDate : undefined}
              isLoading={isLoading}
              isEmpty={!activeData}
              emptyMessage={apiResult?.ok === false ? 'API Error: check inspector above' : 'Select region to fetch'}
              metadata={
                activeData
                  ? [
                      { label: 'Run Date', value: activeData.queriedDate },
                      { label: 'Forecast Status', value: 'Active Feed' },
                    ]
                  : undefined
              }
            />

            {/* Card 3: Monitored Substations (Matching Task 3 Status Card) */}
            <EnergySummaryCard
              title="Telemetry Substations"
              label="Live Telemetry Feed"
              sublabel={activeData ? activeData.gridStatus : 'Offline'}
              value={activeData ? activeData.substationsCount : null}
              unit="Nodes"
              variant="green"
              icon="📈"
              badge={activeData ? activeData.gridStatus : 'OFFLINE'}
              isLoading={isLoading}
              isEmpty={!activeData}
              emptyMessage={apiResult?.ok === false ? 'API Error: check inspector above' : 'Select region to fetch'}
              metadata={
                activeData
                  ? [
                      { label: 'Link Status', value: activeData.gridStatus },
                      { label: 'Data Quality', value: '100% Validated' },
                    ]
                  : undefined
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
};
