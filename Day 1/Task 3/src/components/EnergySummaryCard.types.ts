/**
 * Type definitions for the EnergySummaryCard component.
 * Task 03: Build a tiny frontend card (Energy Summary Card)
 */

export type CardThemeVariant = 'violet' | 'amber' | 'green' | 'blue';

export interface MetaItem {
  label: string;
  value: string | number;
}

export interface EnergySummaryCardProps {
  /**
   * Title of the energy metric card (e.g., "Forecast Block T", "Forecast Context", "Aggregated Power")
   */
  title: string;

  /**
   * Numerical or formatted value of the energy metric (e.g., 8250.7, 26655.2)
   * When null or undefined, the component renders in its Empty/Fallback state.
   */
  value?: number | string | null;

  /**
   * Unit of measurement (e.g., "MW", "GW", "W/m²")
   */
  unit?: string;

  /**
   * Primary label or tag (e.g., "T", "T+1", "Installed Capacity", "Avg GHI")
   */
  label?: string;

  /**
   * Optional secondary label or timestamp (e.g., "08:30", "15-min slot", "Live IST")
   */
  sublabel?: string;

  /**
   * Optional custom badge text or node to display in top-right header (e.g. "GRID-WR", "Live IST")
   */
  badge?: React.ReactNode;

  /**
   * Color theme variant matching dashboard design:
   * - 'violet': Forecast values (8250.7 MW)
   * - 'green': Actual / Live readings
   * - 'amber': Highlights and warnings
   * - 'blue': General solar/grid metrics
   */
  variant?: CardThemeVariant;

  /**
   * Optional icon component or SVG to display alongside the title
   */
  icon?: React.ReactNode;

  /**
   * When true, renders the card in an accessible skeleton loading state
   */
  isLoading?: boolean;

  /**
   * Optional explicit empty state flag. If true or if value is null/undefined, shows empty state.
   */
  isEmpty?: boolean;

  /**
   * Optional custom text to display when card is in empty state
   */
  emptyMessage?: string;

  /**
   * Additional key-value metadata rows (as seen in the "Forecast Context" card)
   */
  metadata?: MetaItem[];

  /**
   * Additional custom CSS class names
   */
  className?: string;

  /**
   * Optional click handler if the card is interactive
   */
  onClick?: () => void;
}

