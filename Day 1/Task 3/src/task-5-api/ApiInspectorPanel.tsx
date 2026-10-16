import React from 'react';
import type { ApiExecutionResult } from './types';

export interface ApiInspectorPanelProps {
  lastResult: ApiExecutionResult | null;
  currentEndpoint: string;
}

export const ApiInspectorPanel: React.FC<ApiInspectorPanelProps> = ({
  lastResult,
  currentEndpoint,
}) => {
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return '#10b981'; // Green
    if (status >= 400 && status < 500) return status === 400 ? '#ef4444' : '#f59e0b'; // Red / Amber
    return '#8b5cf6';
  };

  return (
    <section
      aria-labelledby="api-inspector-heading"
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #27272a',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '1px solid #27272a',
          paddingBottom: '12px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b' }}>
            HTTP Request &amp; Response Inspector
          </span>
        </div>

        {lastResult && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#71717a' }}>Status:</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: `${getStatusColor(lastResult.status)}1a`,
                border: `1px solid ${getStatusColor(lastResult.status)}`,
                color: getStatusColor(lastResult.status),
                fontFamily: 'monospace',
              }}
            >
              {lastResult.status} {lastResult.statusText}
            </span>
            <span style={{ fontSize: '10px', color: '#71717a', fontVariantNumeric: 'tabular-nums' }}>
              ({lastResult.durationMs}ms)
            </span>
          </div>
        )}
      </div>

      {/* Target URL Line */}
      <div
        style={{
          fontFamily: 'Consolas, monospace',
          fontSize: '12px',
          color: '#e4e4e7',
          backgroundColor: '#121212',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #27272a',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <span style={{ color: '#8b5cf6', fontWeight: 700 }}>GET</span>{' '}
          <span style={{ color: '#d4d4d8' }}>{lastResult?.requestedUrl || currentEndpoint}</span>
        </div>
        <span style={{ fontSize: '11px', color: '#71717a' }}>Next.js Route Handler</span>
      </div>

      {/* 2-Column Inspector: Headers & JSON */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Column 1: Response Headers */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a', marginBottom: '6px' }}>
            Response Headers (Inspected via Fetch API)
          </div>
          <div
            style={{
              backgroundColor: '#121212',
              border: '1px solid #27272a',
              borderRadius: '6px',
              padding: '10px 12px',
              fontFamily: 'Consolas, monospace',
              fontSize: '11px',
              lineHeight: '1.6',
              maxHeight: '180px',
              overflowY: 'auto',
            }}
          >
            {lastResult && Object.keys(lastResult.headers).length > 0 ? (
              Object.entries(lastResult.headers).map(([key, val]) => (
                <div key={key}>
                  <span style={{ color: '#8b5cf6' }}>{key}:</span>{' '}
                  <span style={{ color: '#e4e4e7' }}>{val}</span>
                </div>
              ))
            ) : (
              <span style={{ color: '#71717a' }}>Awaiting API execution...</span>
            )}
          </div>
        </div>

        {/* Column 2: Typed Response JSON Body */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a', marginBottom: '6px' }}>
            Typed Response JSON Body
          </div>
          <pre
            style={{
              margin: 0,
              backgroundColor: '#121212',
              border: '1px solid #27272a',
              borderRadius: '6px',
              padding: '10px 12px',
              fontFamily: 'Consolas, monospace',
              fontSize: '11px',
              lineHeight: '1.5',
              maxHeight: '180px',
              overflowY: 'auto',
              color: lastResult?.ok ? '#34d399' : lastResult?.status === 404 ? '#f59e0b' : '#f87171',
            }}
          >
            {lastResult ? lastResult.rawJson : '// Click an API action above to inspect JSON response payload'}
          </pre>
        </div>
      </div>
    </section>
  );
};
