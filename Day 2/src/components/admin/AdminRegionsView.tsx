import React, { useState, useMemo } from 'react';

export interface StateRegionItem {
  id: string;
  code: string;
  name: string;
  type: 'State' | 'ISTS';
  plants: number;
  capacityMw: number;
  status: 'active' | 'inactive';
}

export interface PoolingStationItem {
  id: string;
  code: string;
  name: string;
  stateOrIsts: string;
  grid: string;
  plants: number;
  capacityMw: number;
  status: 'active' | 'inactive';
}

export interface GridItem {
  id: string;
  code: string;
  name: string;
  rldc: string;
  regionsCovered: string;
  capacityMw: number;
  status: 'active' | 'inactive';
}

export interface AdminRegionsViewProps {
  theme?: 'dark' | 'light';
  isAddOpenInitially?: boolean;
}

const DEFAULT_STATES: StateRegionItem[] = [
  { id: 'st-cg', code: 'CG', name: 'Chhattisgarh', type: 'State', plants: 142, capacityMw: 1840, status: 'active' },
  { id: 'st-gj', code: 'GJ', name: 'Gujarat', type: 'State', plants: 640, capacityMw: 14250, status: 'active' },
  { id: 'st-mp', code: 'MP', name: 'Madhya Pradesh', type: 'State', plants: 385, capacityMw: 6120, status: 'active' },
  { id: 'st-mh', code: 'MH', name: 'Maharashtra', type: 'State', plants: 512, capacityMw: 8910, status: 'active' },
  { id: 'st-wr', code: 'WR-ISTS', name: 'Western Region ISTS', type: 'ISTS', plants: 89, capacityMw: 4200, status: 'active' },
];

const DEFAULT_POOLING: PoolingStationItem[] = [
  { id: 'ps-1', code: 'KPS1', name: 'Khavda Pooling Station 1', stateOrIsts: 'GJ', grid: 'WR', plants: 32, capacityMw: 4500, status: 'active' },
  { id: 'ps-2', code: 'KPS2', name: 'Khavda Pooling Station 2', stateOrIsts: 'GJ', grid: 'WR', plants: 28, capacityMw: 3800, status: 'active' },
  { id: 'ps-3', code: 'BHADLA', name: 'Bhadla Pooling Substation', stateOrIsts: 'ISTS', grid: 'NR', plants: 45, capacityMw: 2245, status: 'active' },
  { id: 'ps-4', code: 'FATG', name: 'Fatehgarh Pooling Station', stateOrIsts: 'ISTS', grid: 'NR', plants: 36, capacityMw: 1800, status: 'active' },
  { id: 'ps-5', code: 'PAV', name: 'Pavagada Solar Park PSS', stateOrIsts: 'ISTS', grid: 'SR', plants: 25, capacityMw: 2050, status: 'active' },
  { id: 'ps-6', code: 'REWA', name: 'Rewa Ultra Mega Solar PSS', stateOrIsts: 'MP', grid: 'WR', plants: 18, capacityMw: 750, status: 'active' },
  { id: 'ps-7', code: 'CHAR', name: 'Charanka Solar GIS', stateOrIsts: 'GJ', grid: 'WR', plants: 34, capacityMw: 600, status: 'active' },
  { id: 'ps-8', code: 'SAKRI', name: 'Sakri Solar Substation', stateOrIsts: 'MH', grid: 'WR', plants: 12, capacityMw: 125, status: 'active' },
  { id: 'ps-9', code: 'NAGDA', name: 'Nagda 400kV PSS', stateOrIsts: 'MP', grid: 'WR', plants: 15, capacityMw: 85, status: 'active' },
  { id: 'ps-10', code: 'BAKT', name: 'Baktapur 220kV PSS', stateOrIsts: 'MP', grid: 'WR', plants: 22, capacityMw: 278, status: 'active' },
  { id: 'ps-11', code: 'RAIPUR', name: 'Raipur Pooling Station', stateOrIsts: 'CG', grid: 'WR', plants: 14, capacityMw: 350, status: 'active' },
  { id: 'ps-12', code: 'BILASPUR', name: 'Bilaspur Solar PSS', stateOrIsts: 'CG', grid: 'WR', plants: 9, capacityMw: 180, status: 'active' },
  { id: 'ps-13', code: 'SHOLAPUR', name: 'Solapur Transmission PSS', stateOrIsts: 'MH', grid: 'WR', plants: 20, capacityMw: 450, status: 'active' },
  { id: 'ps-14', code: 'MALOTRA', name: 'Malotra Pooling Station', stateOrIsts: 'GJ', grid: 'WR', plants: 16, capacityMw: 320, status: 'active' },
];

const DEFAULT_GRIDS: GridItem[] = [
  { id: 'gr-wr', code: 'WR', name: 'Western Regional Grid', rldc: 'WRLDC, Mumbai', regionsCovered: 'CG, GJ, MP, MH, Goa, DD, DNH', capacityMw: 35320, status: 'active' },
  { id: 'gr-nr', code: 'NR', name: 'Northern Regional Grid', rldc: 'NRLDC, New Delhi', regionsCovered: 'RJ, HR, PB, UP, UK, HP, JK, DL', capacityMw: 42100, status: 'active' },
  { id: 'gr-sr', code: 'SR', name: 'Southern Regional Grid', rldc: 'SRLDC, Bengaluru', regionsCovered: 'KA, TN, AP, TS, KL, PY', capacityMw: 38600, status: 'active' },
];

export const AdminRegionsView: React.FC<AdminRegionsViewProps> = ({
  theme = 'dark',
  isAddOpenInitially = false,
}) => {
  const isLight = theme === 'light';

  // Tabs: 'states' | 'pooling' | 'grids'
  const [activeTab, setActiveTab] = useState<'states' | 'pooling' | 'grids'>('states');
  const [showInactive, setShowInactive] = useState(false);

  // Data states
  const [statesList, setStatesList] = useState<StateRegionItem[]>(DEFAULT_STATES);
  const [poolingList, setPoolingList] = useState<PoolingStationItem[]>(DEFAULT_POOLING);
  const [gridsList, setGridsList] = useState<GridItem[]>(DEFAULT_GRIDS);

  // Add Region Modal
  const [isModalOpen, setIsModalOpen] = useState(isAddOpenInitially);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'State' | 'ISTS' | 'Pooling Station' | 'Grid'>('State');
  const [formParentGrid, setFormParentGrid] = useState('WR');
  const [formCapacity, setFormCapacity] = useState('');
  const [formPlants, setFormPlants] = useState('');
  const [formCoordinates, setFormCoordinates] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const C = {
    cardBg: isLight ? '#ffffff' : '#0c0c0e',
    panelBg: isLight ? '#f9fafb' : '#111114',
    border: isLight ? '#e5e7eb' : '#1f1f23',
    text: isLight ? '#111827' : '#f4f4f5',
    muted: isLight ? '#6b7280' : '#888891',
    inputBg: isLight ? '#ffffff' : '#18181b',
    headerBg: isLight ? '#f3f4f6' : '#141417',
    hoverBg: isLight ? '#f9fafb' : '#16161a',
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setFormCode('');
    setFormName('');
    setFormType(activeTab === 'pooling' ? 'Pooling Station' : activeTab === 'grids' ? 'Grid' : 'State');
    setFormParentGrid('WR');
    setFormCapacity('');
    setFormPlants('');
    setFormCoordinates('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      setFormError('Region Code is required.');
      return;
    }
    if (!formName.trim()) {
      setFormError('Region Name is required.');
      return;
    }

    if (formType === 'State' || formType === 'ISTS') {
      const newSt: StateRegionItem = {
        id: `st-${Date.now()}`,
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        type: formType,
        plants: formPlants ? parseInt(formPlants) : 10,
        capacityMw: formCapacity ? parseInt(formCapacity) : 500,
        status: 'active',
      };
      setStatesList((prev) => [...prev, newSt]);
      showToast(`Region ${newSt.name} added to States & ISTS.`);
    } else if (formType === 'Pooling Station') {
      const newPs: PoolingStationItem = {
        id: `ps-${Date.now()}`,
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        stateOrIsts: 'GJ',
        grid: formParentGrid,
        plants: formPlants ? parseInt(formPlants) : 12,
        capacityMw: formCapacity ? parseInt(formCapacity) : 400,
        status: 'active',
      };
      setPoolingList((prev) => [...prev, newPs]);
      showToast(`Pooling Station ${newPs.name} added.`);
    } else {
      const newGr: GridItem = {
        id: `gr-${Date.now()}`,
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        rldc: `${formCode.toUpperCase()}LDC`,
        regionsCovered: 'Various States',
        capacityMw: formCapacity ? parseInt(formCapacity) : 25000,
        status: 'active',
      };
      setGridsList((prev) => [...prev, newGr]);
      showToast(`Regional Grid ${newGr.name} added.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteState = (id: string, name: string) => {
    if (window.confirm(`Delete region "${name}"?`)) {
      setStatesList((prev) => prev.filter((s) => s.id !== id));
      showToast(`Region ${name} deleted.`);
    }
  };

  const handleDeletePooling = (id: string, name: string) => {
    if (window.confirm(`Delete pooling station "${name}"?`)) {
      setPoolingList((prev) => prev.filter((p) => p.id !== id));
      showToast(`Pooling station ${name} deleted.`);
    }
  };

  const handleDeleteGrid = (id: string, name: string) => {
    if (window.confirm(`Delete grid "${name}"?`)) {
      setGridsList((prev) => prev.filter((g) => g.id !== id));
      showToast(`Grid ${name} deleted.`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#18181b',
            color: '#10b981',
            border: '1px solid #10b981',
            borderRadius: '6px',
            padding: '10px 16px',
            fontSize: '12px',
            fontWeight: 700,
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Top Title & + Add Region Button (Screenshot 4) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.01em' }}>
            Regions
          </h2>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>
            {statesList.filter((s) => s.type === 'State').length} states ·{' '}
            {statesList.filter((s) => s.type === 'ISTS').length} ISTS areas ·{' '}
            {poolingList.length} pooling stations
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            backgroundColor: '#10b981',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            padding: '7px 16px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
          }}
        >
          + Add Region
        </button>
      </div>

      {/* 3 Tabs & Show Inactive Checkbox (Screenshot 4) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: '2px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('states')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'states' ? '2px solid #f59e0b' : '2px solid transparent',
              color: activeTab === 'states' ? '#f59e0b' : C.muted,
              fontSize: '12px',
              fontWeight: 700,
              padding: '6px 12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            States &amp; ISTS
          </button>
          <button
            onClick={() => setActiveTab('pooling')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'pooling' ? '2px solid #f59e0b' : '2px solid transparent',
              color: activeTab === 'pooling' ? '#f59e0b' : C.muted,
              fontSize: '12px',
              fontWeight: 700,
              padding: '6px 12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Pooling Stations ({poolingList.length})
          </button>
          <button
            onClick={() => setActiveTab('grids')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'grids' ? '2px solid #f59e0b' : '2px solid transparent',
              color: activeTab === 'grids' ? '#f59e0b' : C.muted,
              fontSize: '12px',
              fontWeight: 700,
              padding: '6px 12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Grids &amp; RLDCs ({gridsList.length})
          </button>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: C.muted, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            style={{ accentColor: '#f59e0b', cursor: 'pointer' }}
          />
          Show inactive
        </label>
      </div>

      {/* Tab 1: States & ISTS Table (Screenshot 4) */}
      {activeTab === 'states' && (
        <div
          style={{
            backgroundColor: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: '8px',
            overflowX: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: C.headerBg,
                  borderBottom: `1px solid ${C.border}`,
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '10px',
                  fontWeight: 700,
                }}
              >
                <th style={{ padding: '9px 12px' }}>CODE</th>
                <th style={{ padding: '9px 12px' }}>NAME</th>
                <th style={{ padding: '9px 12px' }}>TYPE</th>
                <th style={{ padding: '9px 12px', textAlign: 'right' }}>PLANTS</th>
                <th style={{ padding: '9px 12px', textAlign: 'right' }}>CAPACITY (MW)</th>
                <th style={{ padding: '9px 12px', textAlign: 'center' }}>STATUS</th>
                <th style={{ padding: '9px 12px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {statesList.map((st) => (
                <tr key={st.id} style={{ borderBottom: `1px solid ${C.border}`, color: C.text }}>
                  <td style={{ padding: '9px 12px', fontWeight: 700, fontFamily: 'monospace', color: '#f59e0b' }}>
                    {st.code}
                  </td>
                  <td style={{ padding: '9px 12px', fontWeight: 600 }}>{st.name}</td>
                  <td style={{ padding: '9px 12px' }}>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: st.type === 'State' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(236, 72, 153, 0.15)',
                        color: st.type === 'State' ? '#38bdf8' : '#ec4899',
                      }}
                    >
                      {st.type}
                    </span>
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{st.plants}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {st.capacityMw.toLocaleString()} MW
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      {st.status}
                    </span>
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        title="Edit Region"
                        style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '13px' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteState(st.id, st.name)}
                        title="Delete Region"
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Pooling Stations Table */}
      {activeTab === 'pooling' && (
        <div
          style={{
            backgroundColor: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: '8px',
            overflowX: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: C.headerBg,
                  borderBottom: `1px solid ${C.border}`,
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '10px',
                  fontWeight: 700,
                }}
              >
                <th style={{ padding: '9px 12px' }}>CODE</th>
                <th style={{ padding: '9px 12px' }}>NAME</th>
                <th style={{ padding: '9px 12px' }}>STATE/ISTS</th>
                <th style={{ padding: '9px 12px' }}>GRID</th>
                <th style={{ padding: '9px 12px', textAlign: 'right' }}>PLANTS</th>
                <th style={{ padding: '9px 12px', textAlign: 'right' }}>CAPACITY (MW)</th>
                <th style={{ padding: '9px 12px', textAlign: 'center' }}>STATUS</th>
                <th style={{ padding: '9px 12px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {poolingList.map((ps) => (
                <tr key={ps.id} style={{ borderBottom: `1px solid ${C.border}`, color: C.text }}>
                  <td style={{ padding: '9px 12px', fontWeight: 700, fontFamily: 'monospace', color: '#f59e0b' }}>
                    {ps.code}
                  </td>
                  <td style={{ padding: '9px 12px', fontWeight: 600 }}>{ps.name}</td>
                  <td style={{ padding: '9px 12px', color: '#38bdf8', fontWeight: 600 }}>{ps.stateOrIsts}</td>
                  <td style={{ padding: '9px 12px', color: '#a855f7', fontWeight: 600 }}>{ps.grid}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{ps.plants}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {ps.capacityMw.toLocaleString()} MW
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      {ps.status}
                    </span>
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        title="Edit Pooling Station"
                        style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '13px' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeletePooling(ps.id, ps.name)}
                        title="Delete Pooling Station"
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Grids & RLDCs Table */}
      {activeTab === 'grids' && (
        <div
          style={{
            backgroundColor: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: '8px',
            overflowX: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: C.headerBg,
                  borderBottom: `1px solid ${C.border}`,
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '10px',
                  fontWeight: 700,
                }}
              >
                <th style={{ padding: '9px 12px' }}>CODE</th>
                <th style={{ padding: '9px 12px' }}>NAME</th>
                <th style={{ padding: '9px 12px' }}>RLDC</th>
                <th style={{ padding: '9px 12px' }}>REGIONS COVERED</th>
                <th style={{ padding: '9px 12px', textAlign: 'right' }}>TOTAL CAPACITY</th>
                <th style={{ padding: '9px 12px', textAlign: 'center' }}>STATUS</th>
                <th style={{ padding: '9px 12px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {gridsList.map((gr) => (
                <tr key={gr.id} style={{ borderBottom: `1px solid ${C.border}`, color: C.text }}>
                  <td style={{ padding: '9px 12px', fontWeight: 700, fontFamily: 'monospace', color: '#f59e0b' }}>
                    {gr.code}
                  </td>
                  <td style={{ padding: '9px 12px', fontWeight: 600 }}>{gr.name}</td>
                  <td style={{ padding: '9px 12px', color: '#38bdf8' }}>{gr.rldc}</td>
                  <td style={{ padding: '9px 12px', color: C.muted }}>{gr.regionsCovered}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {gr.capacityMw.toLocaleString()} MW
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      {gr.status}
                    </span>
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        title="Edit Grid"
                        style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '13px' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteGrid(gr.id, gr.name)}
                        title="Delete Grid"
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Centered Add Region Modal (Screenshot 4) */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#121215',
              border: '1px solid #27272a',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '460px',
              padding: '22px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f4f4f5' }}>
                Add Region
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#71717a', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '5px', fontSize: '11px', marginBottom: '12px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                  REGION CODE *
                </label>
                <input
                  type="text"
                  placeholder="e.g. GJ or KPS1"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#18181b',
                    color: '#f4f4f5',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    padding: '7px 10px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                  REGION NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gujarat SLDC or Khavda Pooling Station"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#18181b',
                    color: '#f4f4f5',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    padding: '7px 10px',
                    fontSize: '11px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                    REGION TYPE
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    style={{
                      width: '100%',
                      backgroundColor: '#18181b',
                      color: '#f4f4f5',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      padding: '7px 10px',
                      fontSize: '11px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="State">State</option>
                    <option value="ISTS">ISTS</option>
                    <option value="Pooling Station">Pooling Station</option>
                    <option value="Grid">Grid</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                    PARENT GRID
                  </label>
                  <select
                    value={formParentGrid}
                    onChange={(e) => setFormParentGrid(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#18181b',
                      color: '#f4f4f5',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      padding: '7px 10px',
                      fontSize: '11px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="WR">WR (Western Region)</option>
                    <option value="NR">NR (Northern Region)</option>
                    <option value="SR">SR (Southern Region)</option>
                    <option value="ER">ER (Eastern Region)</option>
                    <option value="NER">NER (North Eastern)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                  CAPACITY (MW)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#18181b',
                    color: '#f4f4f5',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    padding: '7px 10px',
                    fontSize: '11px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '8px',
                  width: '100%',
                  backgroundColor: '#10b981',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '9px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
                }}
              >
                Add Region
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
