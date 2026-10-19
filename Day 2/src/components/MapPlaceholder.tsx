import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface PlantMarker {
  id: string;
  name: string;
  state: string;
  region: string;
  mw: number;
  lat: number;
  lon: number;
}

export interface MapPlaceholderProps {
  region: string;
  state: string;
  selectedPlant: string;
  category?: 'State' | 'ISTS';
  theme?: 'dark' | 'light';
  stateMode?: 'normal' | 'loading' | 'error';
  onRetry?: () => void;
  onPlantSelect?: (plant: string) => void;
}

// Realistic coordinate clusters across Western/Northern India matching Screenshot 1 & 3
const REALISTIC_PLANTS: PlantMarker[] = [
  // Khavda / Kutch ISTS Nodes (Screenshot 3)
  { id: 'kh-1', name: 'AGE24AL_PSS3_KPS1_S', state: 'Gujarat', region: 'Western Region', mw: 400.0, lat: 23.85, lon: 69.85 },
  { id: 'kh-2', name: 'Khavda PSS-2 Pool', state: 'Gujarat', region: 'Western Region', mw: 300.0, lat: 23.88, lon: 69.80 },
  { id: 'kh-3', name: 'KPS Pooling Station 3', state: 'Gujarat', region: 'Western Region', mw: 600.0, lat: 23.82, lon: 69.90 },
  { id: 'kh-4', name: 'Khavda Renewable Energy Park 4', state: 'Gujarat', region: 'Western Region', mw: 850.0, lat: 23.92, lon: 69.88 },
  { id: 'kh-5', name: 'NTPC Khavda Node', state: 'Gujarat', region: 'Western Region', mw: 500.0, lat: 23.87, lon: 69.94 },
  { id: 'kh-6', name: 'Coastal Solar Bay', state: 'Gujarat', region: 'Western Region', mw: 150.0, lat: 23.75, lon: 69.78 },

  // Gujarat Cluster (Charanka, Kutch, Anand, Malotra)
  { id: 'gj-1', name: 'CHARANKA_SOLAR_PARK', state: 'Gujarat', region: 'Western Region', mw: 600.0, lat: 23.90, lon: 71.20 },
  { id: 'gj-2', name: 'KUTCH_HYBRID_PARK', state: 'Gujarat', region: 'Western Region', mw: 1500.0, lat: 23.82, lon: 69.85 },
  { id: 'gj-3', name: 'ABReL_SPV2_(Malotra)', state: 'Gujarat', region: 'Western Region', mw: 86.3, lat: 24.41, lon: 72.63 },
  { id: 'gj-4', name: 'ANAND_SOLAR_CLUSTER', state: 'Gujarat', region: 'Western Region', mw: 180.0, lat: 22.56, lon: 72.95 },
  { id: 'gj-5', name: 'DHOLERA_SOLAR_PARK', state: 'Gujarat', region: 'Western Region', mw: 1000.0, lat: 22.25, lon: 72.18 },
  { id: 'gj-6', name: 'RADHANPUR_SOLAR', state: 'Gujarat', region: 'Western Region', mw: 75.0, lat: 23.83, lon: 71.60 },
  { id: 'gj-7', name: 'SURENDRANAGAR_SPV', state: 'Gujarat', region: 'Western Region', mw: 90.0, lat: 22.72, lon: 71.63 },
  { id: 'gj-8', name: 'BHAVNAGAR_SOLAR', state: 'Gujarat', region: 'Western Region', mw: 110.0, lat: 21.76, lon: 72.15 },
  { id: 'gj-9', name: 'RAJKOT_RE_SUBSTATION', state: 'Gujarat', region: 'Western Region', mw: 65.0, lat: 22.30, lon: 70.80 },
  { id: 'gj-10', name: 'JAMNAGAR_GREEN_ENERGY', state: 'Gujarat', region: 'Western Region', mw: 140.0, lat: 22.47, lon: 70.06 },

  // Rajasthan Cluster (Bhadla, Dhirubhai, Jaisalmer, Bikaner)
  { id: 'rj-1', name: 'BHADLA_SOLAR_PARK', state: 'Rajasthan', region: 'Northern Region', mw: 2245.0, lat: 27.53, lon: 71.91 },
  { id: 'rj-2', name: 'DHIRUBHAI_AMBANI_SOLAR', state: 'Rajasthan', region: 'Northern Region', mw: 125.0, lat: 26.90, lon: 72.10 },
  { id: 'rj-3', name: 'BIKANER_SOLAR_PARK', state: 'Rajasthan', region: 'Northern Region', mw: 800.0, lat: 28.01, lon: 73.31 },
  { id: 'rj-4', name: 'FATEHGARH_ISTS_POOL', state: 'Rajasthan', region: 'Northern Region', mw: 1200.0, lat: 26.50, lon: 71.18 },
  { id: 'rj-5', name: 'POKHRAN_SOLAR_GRID', state: 'Rajasthan', region: 'Northern Region', mw: 350.0, lat: 26.92, lon: 71.91 },
  { id: 'rj-6', name: 'JODHPUR_RE_COMPLEX', state: 'Rajasthan', region: 'Northern Region', mw: 420.0, lat: 26.29, lon: 73.02 },

  // Madhya Pradesh Cluster (Rewa, Nagda, Baktapur, Neemuch)
  { id: 'mp-1', name: 'REWAS_SOLAR_PARK', state: 'Madhya Pradesh', region: 'Western Region', mw: 750.0, lat: 24.53, lon: 81.30 },
  { id: 'mp-2', name: '220_33KV_BAKTAPUR', state: 'Madhya Pradesh', region: 'Western Region', mw: 278.0, lat: 22.19, lon: 76.25 },
  { id: 'mp-3', name: '400KV_NAGDA', state: 'Madhya Pradesh', region: 'Western Region', mw: 85.0, lat: 23.42, lon: 75.47 },
  { id: 'mp-4', name: 'NEEMUCH_MANDSAUR', state: 'Madhya Pradesh', region: 'Western Region', mw: 250.0, lat: 24.46, lon: 74.87 },
  { id: 'mp-5', name: 'INDORE_SLDC_POOL', state: 'Madhya Pradesh', region: 'Western Region', mw: 180.0, lat: 22.71, lon: 75.85 },
  { id: 'mp-6', name: 'AGAR_SOLAR_PARK', state: 'Madhya Pradesh', region: 'Western Region', mw: 550.0, lat: 23.71, lon: 76.01 },
  { id: 'mp-7', name: 'SHAJAPUR_SOLAR', state: 'Madhya Pradesh', region: 'Western Region', mw: 450.0, lat: 23.43, lon: 76.27 },

  // Maharashtra Cluster (Lasoor, Sakri, Shirpur, Dhule)
  { id: 'mh-1', name: '33_KV_LASOOR', state: 'Maharashtra', region: 'Western Region', mw: 5.1, lat: 19.88, lon: 75.32 },
  { id: 'mh-2', name: 'SAKRI_SOLAR_PLANT', state: 'Maharashtra', region: 'Western Region', mw: 125.0, lat: 21.00, lon: 74.30 },
  { id: 'mh-3', name: 'SHIRPUR_SOLAR', state: 'Maharashtra', region: 'Western Region', mw: 50.0, lat: 21.35, lon: 74.88 },
  { id: 'mh-4', name: 'DHULE_ISTS_SUBSTATION', state: 'Maharashtra', region: 'Western Region', mw: 320.0, lat: 20.90, lon: 74.78 },
  { id: 'mh-5', name: 'AURANGABAD_RE_NODE', state: 'Maharashtra', region: 'Western Region', mw: 95.0, lat: 19.87, lon: 75.34 },
  { id: 'mh-6', name: 'SOLAPUR_NTPC_SOLAR', state: 'Maharashtra', region: 'Western Region', mw: 260.0, lat: 17.65, lon: 75.90 },
  { id: 'mh-7', name: 'OSMANABAD_SOLAR', state: 'Maharashtra', region: 'Western Region', mw: 100.0, lat: 18.18, lon: 76.04 },
];

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
  region,
  state,
  selectedPlant,
  category = 'State',
  theme = 'dark',
  stateMode = 'normal',
  onRetry,
  onPlantSelect,
}) => {
  const isLight = theme === 'light';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.2, 75.8],
        zoom: 5.3,
        zoomControl: true,
        attributionControl: false,
      });

      // Light OpenStreetMap Tiles matching Screenshot 1
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Attribution matching Screenshot 1
      L.control
        .attribution({ position: 'bottomright', prefix: 'Leaflet | &copy; OpenStreetMap contributors' })
        .addTo(map);

      // Layers button at top-right
      const LayersControl = L.Control.extend({
        onAdd: function () {
          const div = L.DomUtil.create('div', 'leaflet-bar');
          div.innerHTML = `
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:4px; padding:3px 6px; box-shadow:0 1px 4px rgba(0,0,0,0.25); font-size:11px; cursor:pointer;" title="Layers">
              🗺️
            </div>
          `;
          return div;
        },
      });
      new LayersControl({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    const isISTS = category === 'ISTS';
    const isSinglePlant = selectedPlant !== 'All Plants';

    // Filter plants according to state/region or ISTS mode
    const visiblePlants = REALISTIC_PLANTS.filter((p) => {
      if (isISTS) {
        return p.id.startsWith('kh-') || p.name === 'CHARANKA_SOLAR_PARK' || p.name === 'BHADLA_SOLAR_PARK';
      }
      if (isSinglePlant && p.name !== selectedPlant) return false;
      if (state !== 'All States' && p.state !== state) return false;
      if (region !== 'All Grids' && p.region !== region) return false;
      return true;
    });

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Custom dense orange circular pin with soft ring (Matching Screenshot 1 & 3)
    const orangePin = L.divIcon({
      className: 'custom-solar-pin',
      html: `
        <div style="
          width: 12px;
          height: 12px;
          background: #f59e0b;
          border: 1.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.9);
          cursor: pointer;
        "></div>
      `,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    // Pulsing green beacon pin (Matching Screenshot 3)
    const greenBeaconPin = L.divIcon({
      className: 'green-beacon-pin',
      html: `
        <div style="position:relative; width:22px; height:22px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
          <div style="position:absolute; width:20px; height:20px; border-radius:50%; background:rgba(16, 185, 129, 0.45); border:1.5px solid #10b981; animation:pulse 2s infinite;"></div>
          <div style="width:12px; height:12px; border-radius:50%; background:#10b981; border:2px solid #ffffff; box-shadow:0 0 8px rgba(16,185,129,0.9); z-index:10;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    visiblePlants.forEach((p) => {
      const isSelectedNode = p.name === selectedPlant;
      const iconToUse = isSelectedNode && (isSinglePlant || isISTS) ? greenBeaconPin : orangePin;

      const marker = L.marker([p.lat, p.lon], { icon: iconToUse }).addTo(map);
      marker.bindTooltip(
        `
        <div style="font-family:sans-serif; font-size:10px; padding:2px;">
          <strong style="color:${isSelectedNode ? '#10b981' : '#d97706'};">${p.name}</strong><br/>
          <span>${p.state} · ${p.mw} MW</span>
        </div>
      `,
        { direction: 'top', offset: [0, -6] }
      );

      marker.on('click', () => {
        if (onPlantSelect) {
          onPlantSelect(p.name);
        }
      });
    });

    // Center on specific plant if selected, or on Khavda if ISTS, or default Western India
    if (selectedPlant === 'AGE24AL_PSS3_KPS1_S' || isISTS) {
      map.setView([23.85, 69.85], 9.5);
    } else if (isSinglePlant) {
      const found = REALISTIC_PLANTS.find((p) => p.name === selectedPlant);
      if (found) {
        map.setView([found.lat, found.lon], 9);
      }
    } else {
      map.setView([23.2, 75.8], 5.3);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [region, state, selectedPlant, category]);

  if (stateMode === 'loading') {
    return (
      <div
        style={{
          backgroundColor: isLight ? '#ffffff' : '#000000',
          border: `1px solid ${isLight ? '#e4e4e7' : '#222226'}`,
          borderRadius: '8px',
          height: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            width: '24px',
            height: '24px',
            border: '2px solid #f59e0b',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Loading Leaflet GIS Plant Map...</span>
      </div>
    );
  }

  if (stateMode === 'error') {
    return (
      <div
        role="alert"
        style={{
          backgroundColor: isLight ? '#ffffff' : '#000000',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          height: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '16px',
        }}
      >
        <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>
          GIS Map Stream Offline
        </div>
        <button
          onClick={onRetry}
          style={{
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 14px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: isLight ? '#ffffff' : '#000000',
        border: `1px solid ${isLight ? '#e4e4e7' : '#222226'}`,
        borderRadius: '8px',
        height: '380px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
};
