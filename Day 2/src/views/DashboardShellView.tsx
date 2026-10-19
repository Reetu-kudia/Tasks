import React, { useState } from 'react';
import { ForecastFilters, type FilterState } from '../components/ForecastFilters';
import { KPICards } from '../components/KPICards';
import { ForecastCharts } from '../components/ForecastCharts';
import { DataTable } from '../components/DataTable';
import { MapPlaceholder } from '../components/MapPlaceholder';

export interface DashboardShellViewProps {
  onGoToAdmin: () => void;
  onLogout: () => void;
  onThemeToggle: () => void;
  theme?: 'dark' | 'light';
  vizState?: 'normal' | 'loading' | 'error';
  onVizStateChange?: (state: 'normal' | 'loading' | 'error') => void;
}

export const DashboardShellView: React.FC<DashboardShellViewProps> = ({
  onGoToAdmin,
  onLogout,
  onThemeToggle,
  theme = 'dark',
  vizState = 'normal',
  onVizStateChange = () => {},
}) => {
  const isLight = theme === 'light';

  // State 1: Active user filter selections (unapplied buffer)
  const [filters, setFilters] = useState<FilterState>({
    generationType: 'Solar',
    region: 'All Grids',
    category: 'State',
    state: 'All States',
    plant: 'All Plants',
    forecastingType: 'Nowcasting',
    runDate: '2026-10-18',
    revision: 'Latest',
  });

  // State 2: Applied filter selections (drives KPI cards, map, charts, and table)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    generationType: 'Solar',
    region: 'All Grids',
    category: 'State',
    state: 'All States',
    plant: 'All Plants',
    forecastingType: 'Nowcasting',
    runDate: '2026-10-18',
    revision: 'Latest',
  });

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleApply = () => {
    setAppliedFilters({ ...filters });
  };

  const handleReset = () => {
    const defaultState: FilterState = {
      generationType: 'Solar',
      region: 'All Grids',
      category: 'State',
      state: 'All States',
      plant: 'All Plants',
      forecastingType: 'Nowcasting',
      runDate: '2026-10-18',
      revision: 'Latest',
    };
    setFilters(defaultState);
    setAppliedFilters(defaultState);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {/* ======================================================== */}
      {/* 1. MAIN DASHBOARD OVERVIEW (ABOVE THE FOLD: 1366x768)    */}
      {/* ======================================================== */}
      <div
        id="main-dashboard-overview"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
        }}
      >
        {/* 2-COLUMN SPLIT (50% - 50%) MATCHING PRODUCTION PORTAL 1:1 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
            gap: '8px',
            alignItems: 'stretch',
            width: '100%',
          }}
          className="dashboard-main-split"
        >
          {/* COLUMN 1 (LEFT 50%): CONTROLS + MAP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
            <ForecastFilters
              filters={filters}
              appliedFilters={appliedFilters}
              onChange={handleFilterChange}
              onApply={handleApply}
              onReset={handleReset}
              onGoToAdmin={onGoToAdmin}
              onThemeToggle={onThemeToggle}
              onLogout={onLogout}
              theme={theme}
            />

            <MapPlaceholder
              region={appliedFilters.region}
              state={appliedFilters.state}
              selectedPlant={appliedFilters.plant}
              category={appliedFilters.category}
              theme={theme}
              stateMode={vizState}
              onRetry={() => onVizStateChange('normal')}
              onPlantSelect={(plant) => {
                handleFilterChange({ plant });
                setAppliedFilters((prev) => ({ ...prev, plant }));
              }}
            />
          </div>

          {/* COLUMN 2 (RIGHT 50%): SUMMARY + STACKED DUAL CHARTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
            <KPICards
              filters={filters}
              appliedFilters={appliedFilters}
              theme={theme}
            />

            <ForecastCharts
              generationType={appliedFilters.generationType}
              forecastingType={appliedFilters.forecastingType}
              theme={theme}
              stateMode={vizState}
              onRetry={() => onVizStateChange('normal')}
            />
          </div>
        </div>
      </div>

      {/* Downward Scroll Cue to Lower Data Panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '4px 0',
          color: '#71717a',
          fontSize: '10px',
          fontWeight: 600,
        }}
      >
        <span>↓</span>
        <span>Scroll down to inspect detailed Plant Telemetry &amp; Forecast Data Records</span>
        <span>↓</span>
      </div>

      {/* ======================================================== */}
      {/* 2. LOWER DATA PANEL (BELOW THE FOLD, REACHED BY SCROLL)  */}
      {/* ======================================================== */}
      <div id="plant-data-panel" style={{ width: '100%', marginTop: '4px' }}>
        <DataTable
          appliedFilters={appliedFilters}
          theme={theme}
          stateMode={vizState}
          onRetry={() => onVizStateChange('normal')}
        />
      </div>
    </div>
  );
};
