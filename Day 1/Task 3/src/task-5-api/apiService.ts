import type { ApiExecutionResult, EnergyApiResponse } from './types';

// Client-side fallback database matching backend route handler
const MOCK_DB: Record<string, { name: string; code: string; mw: number; fc: number; nodes: number; rev: string }> = {
  ALL: { name: 'All Grids (National View)', code: 'NATIONAL', mw: 72450.5, fc: 54120.0, nodes: 420, rev: 'Till Latest' },
  NR:  { name: 'Northern Region (NR)',      code: 'GRID-NR',  mw: 18230.0, fc: 12890.5, nodes: 94,  rev: 'Rev 02' },
  WR:  { name: 'Western Region (WR)',       code: 'GRID-WR',  mw: 26655.2, fc: 18450.0, nodes: 138, rev: 'Rev 04' },
  SR:  { name: 'Southern Region (SR)',      code: 'GRID-SR',  mw: 19840.8, fc: 15300.0, nodes: 112, rev: 'Rev 03' },
  ER:  { name: 'Eastern Region (ER)',       code: 'GRID-ER',  mw: 5820.0,  fc: 4210.0,  nodes: 52,  rev: 'Rev 01' },
  NER: { name: 'North Eastern Region (NER)',code: 'GRID-NER', mw: 1904.5,  fc: 1120.0,  nodes: 24,  rev: 'Rev 01' },
};

export async function fetchTrainingEnergy(
  region?: string,
  date?: string
): Promise<ApiExecutionResult> {
  const startTime = performance.now();
  const queryParams = new URLSearchParams();
  if (region !== undefined) queryParams.set('region', region);
  if (date !== undefined) queryParams.set('date', date);

  const url = `/api/training/energy${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    const headersRecord: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      headersRecord[key] = val;
    });

    const text = await res.text();
    let parsedData: EnergyApiResponse | null = null;
    try {
      parsedData = JSON.parse(text);
    } catch {
      // Raw string if not JSON
    }

    return {
      status: res.status,
      statusText: res.statusText || (res.status === 200 ? 'OK' : res.status === 400 ? 'Bad Request' : 'Not Found'),
      ok: res.ok,
      headers: headersRecord,
      data: parsedData,
      rawJson: text,
      durationMs,
      timestamp: new Date().toISOString(),
      requestedUrl: url,
    };
  } catch {
    // If backend endpoint is offline, use exact client-side simulation
    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    if (!region) {
      const errPayload = {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Missing required query parameter "region".',
          details: 'Usage: GET /api/training/energy?region=WR',
        },
      } as const;

      return {
        status: 400,
        statusText: 'Bad Request',
        ok: false,
        headers: {
          'content-type': 'application/json',
          'x-status-reason': 'Parameter-Missing',
        },
        data: errPayload,
        rawJson: JSON.stringify(errPayload, null, 2),
        durationMs: 8,
        timestamp: new Date().toISOString(),
        requestedUrl: url,
      };
    }

    const regUpper = region.toUpperCase();
    const dbRecord = MOCK_DB[regUpper];
    if (!dbRecord) {
      const notFoundPayload = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Region "${region}" not recognized.`,
          details: 'Allowed regions: ALL, WR, NR, SR, ER, NER',
        },
      } as const;

      return {
        status: 404,
        statusText: 'Not Found',
        ok: false,
        headers: {
          'content-type': 'application/json',
          'x-status-reason': 'Entity-Not-Found',
        },
        data: notFoundPayload,
        rawJson: JSON.stringify(notFoundPayload, null, 2),
        durationMs: 9,
        timestamp: new Date().toISOString(),
        requestedUrl: url,
      };
    }

    const effectiveDate = date || '2026-10-14';
    const successPayload = {
      success: true as const,
      data: {
        regionId: regUpper,
        regionName: dbRecord.name,
        regionCode: dbRecord.code,
        installedCapacityMW: dbRecord.mw,
        currentForecastMW: dbRecord.fc,
        substationsCount: dbRecord.nodes,
        gridStatus: 'NORMAL' as const,
        revision: dbRecord.rev,
        queriedDate: effectiveDate,
        timestamp: new Date().toISOString(),
      },
      meta: {
        responseTimeMs: durationMs || 12,
        apiVersion: '1.0.0-training',
        server: 'Training Route Handler',
      },
    };

    return {
      status: 200,
      statusText: 'OK',
      ok: true,
      headers: {
        'content-type': 'application/json',
        'x-training-api': 'Task-05',
        'x-response-time-ms': String(durationMs || 12),
      },
      data: successPayload,
      rawJson: JSON.stringify(successPayload, null, 2),
      durationMs: durationMs || 12,
      timestamp: new Date().toISOString(),
      requestedUrl: url,
    };
  }
}
