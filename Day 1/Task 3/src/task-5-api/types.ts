export interface RegionalEnergyTelemetry {
  regionId: string;
  regionName: string;
  regionCode: string;
  installedCapacityMW: number;
  currentForecastMW: number;
  substationsCount: number;
  gridStatus: 'NORMAL' | 'ALERT' | 'OFFLINE';
  revision: string;
  queriedDate: string;
  timestamp: string;
}

export interface EnergyApiSuccessResponse {
  success: true;
  data: RegionalEnergyTelemetry;
  meta: {
    responseTimeMs: number;
    apiVersion: string;
    server: string;
  };
}

export interface EnergyApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

export type EnergyApiResponse = EnergyApiSuccessResponse | EnergyApiErrorResponse;

export interface ApiExecutionResult {
  status: number;
  statusText: string;
  ok: boolean;
  headers: Record<string, string>;
  data: EnergyApiResponse | null;
  rawJson: string;
  durationMs: number;
  timestamp: string;
  requestedUrl: string;
}
