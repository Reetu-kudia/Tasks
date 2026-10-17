/**
 * Training Route Handler: GET /api/training/energy
 * 
 * Follows Next.js App Router route conventions using standard Web Fetch API Request & Response.
 */

interface MockRecord {
  name: string;
  code: string;
  mw: number;
  fc: number;
  nodes: number;
  rev: string;
  forecastBlocks: { label: string; sublabel: string; value: number; unit: string }[];
  actualSolarMW: number | null;
  solarRadiationGhi: number | null;
}

const MOCK_DB: Record<string, MockRecord> = {
  ALL: {
    name: 'All Grids (National View)',
    code: 'NATIONAL',
    mw: 72450.5,
    fc: 54120.0,
    nodes: 420,
    rev: 'Till Latest',
    forecastBlocks: [
      { label: 'T', sublabel: '08:30', value: 22460.7, unit: 'MW' },
      { label: 'T+1', sublabel: '08:45', value: 25799.0, unit: 'MW' },
      { label: 'T+2', sublabel: '09:00', value: 29286.5, unit: 'MW' },
      { label: 'T+3', sublabel: '09:15', value: 31784.1, unit: 'MW' },
    ],
    actualSolarMW: 21340.0,
    solarRadiationGhi: 825.0,
  },
  NR: {
    name: 'Northern Region (NR)',
    code: 'GRID-NR',
    mw: 18230.0,
    fc: 12890.5,
    nodes: 94,
    rev: 'Rev 02',
    forecastBlocks: [
      { label: 'T', sublabel: '08:30', value: 5420.0, unit: 'MW' },
      { label: 'T+1', sublabel: '08:45', value: 6180.2, unit: 'MW' },
      { label: 'T+2', sublabel: '09:00', value: 7095.0, unit: 'MW' },
      { label: 'T+3', sublabel: '09:15', value: 7710.4, unit: 'MW' },
    ],
    actualSolarMW: 5120.8,
    solarRadiationGhi: 795.0,
  },
  WR: {
    name: 'Western Region (WR)',
    code: 'GRID-WR',
    mw: 26655.2,
    fc: 18450.0,
    nodes: 138,
    rev: 'Rev 04',
    forecastBlocks: [
      { label: 'T', sublabel: '08:30', value: 8250.7, unit: 'MW' },
      { label: 'T+1', sublabel: '08:45', value: 9389.0, unit: 'MW' },
      { label: 'T+2', sublabel: '09:00', value: 10791.5, unit: 'MW' },
      { label: 'T+3', sublabel: '09:15', value: 11694.1, unit: 'MW' },
    ],
    actualSolarMW: 7842.3,
    solarRadiationGhi: 842.5,
  },
  SR: {
    name: 'Southern Region (SR)',
    code: 'GRID-SR',
    mw: 19840.8,
    fc: 15300.0,
    nodes: 112,
    rev: 'Rev 03',
    forecastBlocks: [
      { label: 'T', sublabel: '08:30', value: 6890.0, unit: 'MW' },
      { label: 'T+1', sublabel: '08:45', value: 7640.5, unit: 'MW' },
      { label: 'T+2', sublabel: '09:00', value: 8450.0, unit: 'MW' },
      { label: 'T+3', sublabel: '09:15', value: 9120.0, unit: 'MW' },
    ],
    actualSolarMW: 6650.0,
    solarRadiationGhi: 810.0,
  },
  ER: {
    name: 'Eastern Region (ER)',
    code: 'GRID-ER',
    mw: 5820.0,
    fc: 4210.0,
    nodes: 52,
    rev: 'Rev 01',
    forecastBlocks: [
      { label: 'T', sublabel: '08:30', value: 1820.0, unit: 'MW' },
      { label: 'T+1', sublabel: '08:45', value: 2050.0, unit: 'MW' },
      { label: 'T+2', sublabel: '09:00', value: 2340.0, unit: 'MW' },
      { label: 'T+3', sublabel: '09:15', value: 2580.0, unit: 'MW' },
    ],
    actualSolarMW: null,
    solarRadiationGhi: null,
  },
  NER: {
    name: 'North Eastern Region (NER)',
    code: 'GRID-NER',
    mw: 1904.5,
    fc: 1120.0,
    nodes: 24,
    rev: 'Rev 01',
    forecastBlocks: [
      { label: 'T', sublabel: '08:30', value: 480.0, unit: 'MW' },
      { label: 'T+1', sublabel: '08:45', value: 540.0, unit: 'MW' },
      { label: 'T+2', sublabel: '09:00', value: 610.0, unit: 'MW' },
      { label: 'T+3', sublabel: '09:15', value: 680.0, unit: 'MW' },
    ],
    actualSolarMW: null,
    solarRadiationGhi: null,
  },
};

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const region = url.searchParams.get('region');
  const date = url.searchParams.get('date') || '2026-10-14';

  const headers = {
    'Content-Type': 'application/json',
    'X-Training-API': 'Task-05',
    'X-Response-Time-Ms': '12',
  };

  if (!region) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Missing required query parameter "region".',
          details: 'Usage: GET /api/training/energy?region=WR&date=2026-10-14',
        },
      }),
      { status: 400, headers }
    );
  }

  const data = MOCK_DB[region.toUpperCase()];
  if (!data) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Region "${region}" not recognized in grid dataset.`,
          details: 'Allowed regions: ALL, WR, NR, SR, ER, NER',
        },
      }),
      { status: 404, headers }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        regionId: region.toUpperCase(),
        regionName: data.name,
        regionCode: data.code,
        installedCapacityMW: data.mw,
        currentForecastMW: data.fc,
        forecastBlocks: data.forecastBlocks,
        actualSolarMW: data.actualSolarMW,
        solarRadiationGhi: data.solarRadiationGhi,
        substationsCount: data.nodes,
        gridStatus: 'NORMAL',
        revision: data.rev,
        queriedDate: date,
        timeRange: `${date}, 00:00 → ${date}, 23:45`,
        timestamp: new Date().toISOString(),
      },
      meta: {
        responseTimeMs: 12,
        apiVersion: '1.0.0-training',
        server: 'Next.js App Router Training Route Handler',
      },
    }),
    { status: 200, headers }
  );
}

