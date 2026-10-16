export interface RegionTelemetry {
  id: string;
  name: string;
  code: string;
  installedCapacityMW: number;
  substations: number;
  status: 'NORMAL' | 'ALERT' | 'OFFLINE';
}

export const REGIONS_DATA: RegionTelemetry[] = [
  { id: 'ALL', name: 'All Grids (National View)', code: 'NATIONAL', installedCapacityMW: 72450.5, substations: 420, status: 'NORMAL' },
  { id: 'NR',  name: 'Northern Region (NR)',      code: 'GRID-NR',  installedCapacityMW: 18230.0, substations: 94,  status: 'NORMAL' },
  { id: 'WR',  name: 'Western Region (WR)',       code: 'GRID-WR',  installedCapacityMW: 26655.2, substations: 138, status: 'NORMAL' },
  { id: 'SR',  name: 'Southern Region (SR)',      code: 'GRID-SR',  installedCapacityMW: 19840.8, substations: 112, status: 'NORMAL' },
  { id: 'ER',  name: 'Eastern Region (ER)',       code: 'GRID-ER',  installedCapacityMW: 5820.0,  substations: 52,  status: 'NORMAL' },
  { id: 'NER', name: 'North Eastern Region (NER)',code: 'GRID-NER', installedCapacityMW: 1904.5,  substations: 24,  status: 'NORMAL' },
];

export function getRegionById(id: string): RegionTelemetry | undefined {
  return REGIONS_DATA.find((r) => r.id === id);
}
