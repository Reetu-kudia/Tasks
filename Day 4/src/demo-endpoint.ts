/**
 * GRID-IITB Day 4 Task 5: Validated Demo API Operation
 *
 * Implements strict server-side validation using runtime schema checks,
 * returning typed responses for valid inputs and explicit 400 Bad Request
 * client errors for malformed requests.
 *
 * Read-only & fixture-backed. Zero production mutations.
 */

export interface TelemetryQueryInput {
  plantCode: string;
  date: string;
  region: 'GJ' | 'MH' | 'MP' | 'CG' | 'ISTS';
  model?: 'NOWCASTING' | 'INTRA' | 'MEDIUM' | 'ENSEMBLE';
  blockCount?: number;
}

export interface TelemetryBlock {
  blockIndex: number;
  timeIst: string;
  ghiWm2: number;
  powerPredMw: number;
  powerActualMw: number;
}

export interface TelemetrySuccessResponse {
  ok: true;
  data: {
    plantCode: string;
    region: string;
    date: string;
    model: string;
    blockCount: number;
    summary: {
      peakPredMw: number;
      peakActualMw: number;
      avgCoveragePct: number;
      telemetryStatus: 'NORMAL' | 'DEGRADED' | 'NO_DATA';
    };
    blocks: TelemetryBlock[];
  };
}

export interface TelemetryErrorResponse {
  ok: false;
  error: {
    code: 'VALIDATION_ERROR' | 'BAD_REQUEST';
    message: string;
    field?: string;
  };
}

export type ApiResponse = {
  status: number;
  body: TelemetrySuccessResponse | TelemetryErrorResponse;
};

// ── Validation Engine ────────────────────────────────────────────────────────

const VALID_REGIONS = ['GJ', 'MH', 'MP', 'CG', 'ISTS'] as const;
const VALID_MODELS = ['NOWCASTING', 'INTRA', 'MEDIUM', 'ENSEMBLE'] as const;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PLANT_CODE_REGEX = /^[A-Z0-9_]{4,32}$/;

export function validateAndProcessTelemetry(input: any): ApiResponse {
  if (!input || typeof input !== 'object') {
    return {
      status: 400,
      body: {
        ok: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Request body must be a valid JSON object.',
        },
      },
    };
  }

  // 1. Validate plantCode
  if (!input.plantCode || typeof input.plantCode !== 'string') {
    return {
      status: 400,
      body: {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          field: 'plantCode',
          message: 'Field "plantCode" is required and must be a string.',
        },
      },
    };
  }

  const cleanPlantCode = input.plantCode.trim().toUpperCase();
  if (!PLANT_CODE_REGEX.test(cleanPlantCode)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          field: 'plantCode',
          message: `Field "plantCode" must contain 4-32 uppercase alphanumeric characters or underscores. Received: "${input.plantCode}"`,
        },
      },
    };
  }

  // 2. Validate date (YYYY-MM-DD)
  if (!input.date || typeof input.date !== 'string') {
    return {
      status: 400,
      body: {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          field: 'date',
          message: 'Field "date" is required and must follow YYYY-MM-DD ISO format.',
        },
      },
    };
  }

  if (!ISO_DATE_REGEX.test(input.date.trim())) {
    return {
      status: 400,
      body: {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          field: 'date',
          message: `Field "date" must follow YYYY-MM-DD format (e.g. 2026-10-19). Received: "${input.date}"`,
        },
      },
    };
  }

  // 3. Validate region
  if (!input.region || typeof input.region !== 'string') {
    return {
      status: 400,
      body: {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          field: 'region',
          message: 'Field "region" is required.',
        },
      },
    };
  }

  const cleanRegion = input.region.trim().toUpperCase();
  if (!VALID_REGIONS.includes(cleanRegion as any)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          field: 'region',
          message: `Invalid region: "${input.region}". Permitted control areas: ${VALID_REGIONS.join(', ')}.`,
        },
      },
    };
  }

  // 4. Validate blockCount (optional, default 96, range 1..96)
  let blockCount = 96;
  if (input.blockCount !== undefined) {
    const num = Number(input.blockCount);
    if (!Number.isInteger(num) || num < 1 || num > 96) {
      return {
        status: 400,
        body: {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            field: 'blockCount',
            message: `Field "blockCount" must be an integer between 1 and 96. Received: ${input.blockCount}`,
          },
        },
      };
    }
    blockCount = num;
  }

  // 5. Validate model (optional, default 'NOWCASTING')
  let model: 'NOWCASTING' | 'INTRA' | 'MEDIUM' | 'ENSEMBLE' = 'NOWCASTING';
  if (input.model !== undefined) {
    const upperModel = String(input.model).trim().toUpperCase();
    if (!VALID_MODELS.includes(upperModel as any)) {
      return {
        status: 400,
        body: {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            field: 'model',
            message: `Invalid forecasting model: "${input.model}". Permitted: ${VALID_MODELS.join(', ')}.`,
          },
        },
      };
    }
    model = upperModel as any;
  }

  // ── Input Validated: Generate Safe Fixture Response ───────────────────────────

  const blocks: TelemetryBlock[] = [];
  for (let i = 0; i < blockCount; i++) {
    const totalMinutes = i * 15;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    // Synthetic solar bell-curve for daytime hours
    const isDaylight = hours >= 6 && hours <= 18;
    const bellFactor = isDaylight ? Math.sin(((hours - 6) / 12) * Math.PI) : 0;
    const ghi = Math.round(bellFactor * 850);
    const predMw = parseFloat((bellFactor * 280).toFixed(1));
    const actualMw = parseFloat((bellFactor * 268.4).toFixed(1));

    blocks.push({
      blockIndex: i + 1,
      timeIst: timeStr,
      ghiWm2: ghi,
      powerPredMw: predMw,
      powerActualMw: actualMw,
    });
  }

  return {
    status: 200,
    body: {
      ok: true,
      data: {
        plantCode: cleanPlantCode,
        region: cleanRegion,
        date: input.date.trim(),
        model,
        blockCount,
        summary: {
          peakPredMw: 280.0,
          peakActualMw: 268.4,
          avgCoveragePct: 100.0,
          telemetryStatus: 'NORMAL',
        },
        blocks,
      },
    },
  };
}

