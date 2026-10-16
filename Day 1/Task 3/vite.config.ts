import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const MOCK_DB: Record<string, { name: string; code: string; mw: number; fc: number; nodes: number; rev: string }> = {
  ALL: { name: 'All Grids (National View)', code: 'NATIONAL', mw: 72450.5, fc: 54120.0, nodes: 420, rev: 'Till Latest' },
  NR:  { name: 'Northern Region (NR)',      code: 'GRID-NR',  mw: 18230.0, fc: 12890.5, nodes: 94,  rev: 'Rev 02' },
  WR:  { name: 'Western Region (WR)',       code: 'GRID-WR',  mw: 26655.2, fc: 18450.0, nodes: 138, rev: 'Rev 04' },
  SR:  { name: 'Southern Region (SR)',      code: 'GRID-SR',  mw: 19840.8, fc: 15300.0, nodes: 112, rev: 'Rev 03' },
  ER:  { name: 'Eastern Region (ER)',       code: 'GRID-ER',  mw: 5820.0,  fc: 4210.0,  nodes: 52,  rev: 'Rev 01' },
  NER: { name: 'North Eastern Region (NER)',code: 'GRID-NER', mw: 1904.5,  fc: 1120.0,  nodes: 24,  rev: 'Rev 01' },
};

function trainingApiPlugin(): Plugin {
  return {
    name: 'training-api-route-handler',
    configureServer(server) {
      server.middlewares.use('/api/training/energy', (req, res) => {
        const url = new URL(req.url || '', 'http://localhost:3000');
        const region = url.searchParams.get('region');
        const date = url.searchParams.get('date') || '2026-10-14';

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Training-API', 'Task-05');
        res.setHeader('X-Response-Time-Ms', '12');

        if (!region) {
          res.statusCode = 400;
          res.setHeader('X-Status-Reason', 'Parameter-Missing');
          res.end(
            JSON.stringify({
              success: false,
              error: {
                code: 'BAD_REQUEST',
                message: 'Missing required query parameter "region".',
                details: 'Usage: GET /api/training/energy?region=WR',
              },
            })
          );
          return;
        }

        const data = MOCK_DB[region.toUpperCase()];
        if (!data) {
          res.statusCode = 404;
          res.setHeader('X-Status-Reason', 'Entity-Not-Found');
          res.end(
            JSON.stringify({
              success: false,
              error: {
                code: 'NOT_FOUND',
                message: `Region "${region}" not recognized.`,
                details: 'Allowed regions: ALL, WR, NR, SR, ER, NER',
              },
            })
          );
          return;
        }

        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: true,
            data: {
              regionId: region.toUpperCase(),
              regionName: data.name,
              regionCode: data.code,
              installedCapacityMW: data.mw,
              currentForecastMW: data.fc,
              substationsCount: data.nodes,
              gridStatus: 'NORMAL',
              revision: data.rev,
              queriedDate: date,
              timestamp: new Date().toISOString(),
            },
            meta: {
              responseTimeMs: 12,
              apiVersion: '1.0.0-training',
              server: 'Vite Training Route Middleware',
            },
          })
        );
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), trainingApiPlugin()],
  server: {
    port: 3000,
    open: true,
  },
});
