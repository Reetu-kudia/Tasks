"use client";

import React from 'react';
import type { EnergySummaryCardProps } from './EnergySummaryCard.types';
import styles from './EnergySummaryCard.module.css';

/**
 * EnergySummaryCard Component
 * 
 * Master reusable card component for Task 3, Task 4, and Task 5.
 * Strictly uses semantic HTML (<article>, <header>, <dl>, <dt>, <dd>),
 * typed props, and supports Active, Loading Skeleton, and Empty states.
 */
export const EnergySummaryCard: React.FC<EnergySummaryCardProps> = ({
  title,
  value,
  unit = 'MW',
  label,
  sublabel,
  badge,
  variant = 'violet',
  icon,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data available for the selected period',
  metadata,
  className = '',
  onClick,
}) => {
  const isDataEmpty = isEmpty || value === null || value === undefined || value === '';

  // Determine variant CSS class
  const variantClass = {
    violet: styles.variantViolet,
    amber: styles.variantAmber,
    green: styles.variantGreen,
    blue: styles.variantBlue,
  }[variant] || styles.variantViolet;

  // Render Skeleton / Loading state
  if (isLoading) {
    return (
      <article
        className={`${styles.card} ${styles.skeletonCard} ${className}`}
        aria-busy="true"
        aria-live="polite"
        aria-label={`Loading ${title}`}
      >
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
          </div>
          <div className={`${styles.skeletonBlock}`} style={{ width: '40px', height: '14px' }} />
        </header>

        <div className={styles.metricsList}>
          <div className={`${styles.skeletonBlock} ${styles.skeletonLabel}`} />
          <div className={`${styles.skeletonBlock} ${styles.skeletonValue}`} />
        </div>

        {metadata && metadata.length > 0 && (
          <div className={styles.metadataList}>
            {metadata.map((_, index) => (
              <div key={index} className={`${styles.skeletonBlock} ${styles.skeletonMeta}`} />
            ))}
          </div>
        )}
      </article>
    );
  }

  // Format numerical or string value
  const formattedValue = typeof value === 'number'
    ? value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : value;

  return (
    <article
      className={`${styles.card} ${variantClass} ${className}`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : 'region'}
      aria-label={title}
    >
      {/* Semantic Card Header */}
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          {icon && (
            <span className={styles.iconWrapper} aria-hidden="true">
              {icon}
            </span>
          )}
          <h3 className={styles.title}>{title}</h3>
        </div>

        {(badge || sublabel) && (
          <span className={styles.headerBadge}>
            {badge ?? sublabel}
          </span>
        )}
      </header>

      {/* Main Content Area */}
      {isDataEmpty ? (
        // Empty / Fallback State
        <div className={styles.emptyState} role="status">
          <span className={styles.emptyValue}>—</span>
          <p className={styles.emptyMessage}>{emptyMessage}</p>
        </div>
      ) : (
        // Active Metric State using semantic Description List (<dl>)
        <dl className={styles.metricsList}>
          {label && (
            <div className={styles.labelRow}>
              <dt className={styles.metricLabel}>{label}</dt>
              {sublabel && <span className={styles.metricSublabel}>{sublabel}</span>}
            </div>
          )}

          <dd className={styles.valueRow}>
            <span className={styles.metricValue}>
              {formattedValue}
            </span>
            {unit && <span className={styles.metricUnit}>{unit}</span>}
          </dd>
        </dl>
      )}

      {/* Optional Metadata / Context Rows (e.g. for Forecast Context) */}
      {metadata && metadata.length > 0 && (
        <dl className={styles.metadataList}>
          {metadata.map((item, idx) => (
            <div key={`${item.label}-${idx}`} className={styles.metaRow}>
              <dt className={styles.metaLabel}>{item.label}:</dt>
              <dd className={styles.metaValue}>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
};

export default EnergySummaryCard;
