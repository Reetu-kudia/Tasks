export interface FilterControlsProps {
  selectedRegion: string;
  selectedDate: string;
  onRegionChange: (region: string) => void;
  onDateChange: (date: string) => void;
  onReset: () => void;
  disabled?: boolean;
}
