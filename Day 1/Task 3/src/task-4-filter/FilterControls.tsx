import React from 'react';
import type { FilterControlsProps } from './FilterControls.types';
import { REGIONS_DATA } from './regions';
import styles from './FilterControls.module.css';

export const FilterControls: React.FC<FilterControlsProps> = ({
  selectedRegion,
  selectedDate,
  onRegionChange,
  onDateChange,
  onReset,
  disabled = false,
}) => {
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRegionChange(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  return (
    <section className={styles.filterContainer} aria-labelledby="filter-heading">
      <div className={styles.filterHeader}>
        <h2 id="filter-heading" className={styles.filterTitle}>
          Grid &amp; Forecast Filters
        </h2>
        <span className={styles.activeBadge}>Controlled Inputs Active</span>
      </div>

      <form className={styles.filterForm} onSubmit={(e) => e.preventDefault()}>
        {/* Accessible Region Select */}
        <div className={styles.formGroup}>
          <label htmlFor="grid-region-select" className={styles.label}>
            <span>Grid Region</span>
            <span className={styles.requiredAsterisk} aria-hidden="true">*</span>
          </label>
          <select
            id="grid-region-select"
            value={selectedRegion}
            onChange={handleRegionChange}
            disabled={disabled}
            className={styles.selectInput}
            aria-required="true"
          >
            <option value="">-- Choose a Region --</option>
            {REGIONS_DATA.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        {/* Accessible Date Input */}
        <div className={styles.formGroup}>
          <label htmlFor="forecast-date-input" className={styles.label}>
            <span>Forecast Run Date</span>
            <span className={styles.requiredAsterisk} aria-hidden="true">*</span>
          </label>
          <input
            id="forecast-date-input"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            disabled={disabled}
            className={styles.dateInput}
            aria-required="true"
          />
        </div>

        {/* Reset Action */}
        <div className={styles.formGroup}>
          <button
            type="button"
            onClick={onReset}
            disabled={disabled || (!selectedRegion && !selectedDate)}
            className={styles.resetBtn}
            aria-label="Clear active filters"
          >
            Clear Filters
          </button>
        </div>
      </form>
    </section>
  );
};
