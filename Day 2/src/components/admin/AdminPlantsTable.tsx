import React, { useState, useMemo } from 'react';

export interface PlantRecord {
  id: string;
  code: string;
  name: string;
  area: string;
  poolingStation: string;
  capacityMw?: number;
  genType?: 'Solar' | 'Wind' | 'Hybrid';
  latitude?: number;
  longitude?: number;
  portalVisible: boolean;
  pipelineActive: boolean;
}

export interface AdminPlantsTableProps {
  theme?: 'dark' | 'light';
  isAddOpenInitially?: boolean;
}

const DEFAULT_PLANTS: PlantRecord[] = [
  { id: 'p-1', code: 'ACL_PSS3_KPS1_S', name: 'Adani Solar Khavda 1', area: 'GJ', poolingStation: 'Khavda PS1', capacityMw: 300, genType: 'Solar', portalVisible: true, pipelineActive: true },
  { id: 'p-2', code: 'AGE24AL_PSS3_KPS1_S', name: 'Adani Green Energy 24A', area: 'GJ', poolingStation: 'Khavda PS1', capacityMw: 250, genType: 'Solar', portalVisible: true, pipelineActive: true },
  { id: 'p-3', code: 'AGEL_PSS1_KPS1_S', name: 'Adani Green Energy 1', area: 'GJ', poolingStation: 'Khavda PS1', capacityMw: 350, genType: 'Solar', portalVisible: true, pipelineActive: true },
  { id: 'p-4', code: 'AHESL_PSS1_KPS1_S', name: 'Adani Hybrid Energy 1', area: 'GJ', poolingStation: 'Khavda PS1', capacityMw: 390, genType: 'Hybrid', portalVisible: true, pipelineActive: true },
  { id: 'p-5', code: 'ARERJL_PSS1_KPS1_S', name: 'Adani RE Rajasthan 1', area: 'ISTS', poolingStation: 'Bhadla PS', capacityMw: 250, genType: 'Solar', portalVisible: true, pipelineActive: true },
  { id: 'p-6', code: 'AUGEL_PSS2_KPS1_S', name: 'Adani Utility Green 2', area: 'GJ', poolingStation: 'Khavda PS2', capacityMw: 300, genType: 'Solar', portalVisible: true, pipelineActive: true },
  { id: 'p-7', code: 'AVAADA_PAVAGADA_S', name: 'Avaada Pavagada Solar', area: 'ISTS', poolingStation: 'Pavagada PS', capacityMw: 150, genType: 'Solar', portalVisible: true, pipelineActive: true },
  { id: 'p-8', code: 'BHADLA_NTPC_S', name: 'NTPC Bhadla Solar Plant', area: 'ISTS', poolingStation: 'Bhadla PS', capacityMw: 260, genType: 'Solar', portalVisible: true, pipelineActive: true },
  { id: 'p-9', code: 'CHARANKA_GPCL_S', name: 'Charanka Solar Park', area: 'GJ', poolingStation: 'Charanka GIS', capacityMw: 600, genType: 'Solar', portalVisible: true, pipelineActive: true },
  { id: 'p-10', code: 'RENEW_SOLAR_MP_S', name: 'ReNew Solar Madhya 1', area: 'MP', poolingStation: 'Rewa Central', capacityMw: 250, genType: 'Solar', portalVisible: true, pipelineActive: true },
  { id: 'p-11', code: 'TATA_POWER_MH_S', name: 'Tata Power Sakri Solar', area: 'MH', poolingStation: 'Dhule Grid', capacityMw: 125, genType: 'Solar', portalVisible: true, pipelineActive: true },
  { id: 'p-12', code: 'ACME_RAIPUR_CG_S', name: 'ACME Solar Raipur', area: 'CG', poolingStation: 'Raipur Pooling', capacityMw: 100, genType: 'Solar', portalVisible: true, pipelineActive: true },
  { id: 'p-13', code: 'AZURE_POWER_GJ_S', name: 'Azure Power Gujarat', area: 'GJ', poolingStation: 'Charanka GIS', capacityMw: 200, genType: 'Solar', portalVisible: true, pipelineActive: true },
  { id: 'p-14', code: 'HERO_FUTURE_WR_W', name: 'Hero Future Energies Wind', area: 'ISTS', poolingStation: 'Khavda PS2', capacityMw: 180, genType: 'Wind', portalVisible: true, pipelineActive: true },
];

export const AdminPlantsTable: React.FC<AdminPlantsTableProps> = ({
  theme = 'dark',
  isAddOpenInitially = false,
}) => {
  const isLight = theme === 'light';
  const [plants, setPlants] = useState<PlantRecord[]>(DEFAULT_PLANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(isAddOpenInitially);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states (2-column form)
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formArea, setFormArea] = useState('GJ');
  const [formPoolingStation, setFormPoolingStation] = useState('');
  const [formCapacity, setFormCapacity] = useState('');
  const [formGenType, setFormGenType] = useState<'Solar' | 'Wind' | 'Hybrid'>('Solar');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formPortal, setFormPortal] = useState(true);
  const [formPipeline, setFormPipeline] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

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
    setEditingPlantId(null);
    setFormCode('');
    setFormName('');
    setFormArea('GJ');
    setFormPoolingStation('Khavda PS1');
    setFormCapacity('');
    setFormGenType('Solar');
    setFormLat('23.85');
    setFormLng('69.80');
    setFormPortal(true);
    setFormPipeline(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PlantRecord) => {
    setEditingPlantId(p.id);
    setFormCode(p.code);
    setFormName(p.name);
    setFormArea(p.area);
    setFormPoolingStation(p.poolingStation);
    setFormCapacity(p.capacityMw ? p.capacityMw.toString() : '');
    setFormGenType(p.genType || 'Solar');
    setFormLat(p.latitude ? p.latitude.toString() : '');
    setFormLng(p.longitude ? p.longitude.toString() : '');
    setFormPortal(p.portalVisible);
    setFormPipeline(p.pipelineActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      setFormError('Plant Code is required.');
      return;
    }
    if (!formName.trim()) {
      setFormError('Plant Name is required.');
      return;
    }

    if (editingPlantId) {
      setPlants((prev) =>
        prev.map((p) =>
          p.id === editingPlantId
            ? {
                ...p,
                code: formCode.trim().toUpperCase(),
                name: formName.trim(),
                area: formArea,
                poolingStation: formPoolingStation.trim(),
                capacityMw: formCapacity ? parseFloat(formCapacity) : undefined,
                genType: formGenType,
                latitude: formLat ? parseFloat(formLat) : undefined,
                longitude: formLng ? parseFloat(formLng) : undefined,
                portalVisible: formPortal,
                pipelineActive: formPipeline,
              }
            : p
        )
      );
      showToast(`Plant ${formCode} updated successfully.`);
    } else {
      const newPlant: PlantRecord = {
        id: `p-${Date.now()}`,
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        area: formArea,
        poolingStation: formPoolingStation.trim() || 'Central PSS',
        capacityMw: formCapacity ? parseFloat(formCapacity) : 100,
        genType: formGenType,
        latitude: formLat ? parseFloat(formLat) : 23.5,
        longitude: formLng ? parseFloat(formLng) : 72.0,
        portalVisible: formPortal,
        pipelineActive: formPipeline,
      };
      setPlants((prev) => [newPlant, ...prev]);
      showToast(`Plant ${newPlant.code} added to portal & pipelines.`);
    }

    setIsModalOpen(false);
  };

  const togglePortal = (id: string) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = !p.portalVisible;
          showToast(`Plant ${p.code} portal visibility: ${next ? 'ON' : 'OFF'}`);
          return { ...p, portalVisible: next };
        }
        return p;
      })
    );
  };

  const togglePipeline = (id: string) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = !p.pipelineActive;
          showToast(`Plant ${p.code} pipeline ingestion: ${next ? 'ACTIVE' : 'INACTIVE'}`);
          return { ...p, pipelineActive: next };
        }
        return p;
      })
    );
  };

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to remove plant "${code}"?`)) {
      setPlants((prev) => prev.filter((p) => p.id !== id));
      showToast(`Plant ${code} removed.`);
    }
  };

  const filteredPlants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return plants.filter((p) => {
      const matchArea = selectedArea === 'ALL' || p.area === selectedArea;
      const matchSearch =
        !q ||
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.poolingStation.toLowerCase().includes(q);
      return matchArea && matchSearch;
    });
  }, [plants, searchQuery, selectedArea]);

  const totalCount = 1768; // Matching production total in screenshot
  const displayedCount = filteredPlants.length;
  const totalPages = Math.max(1, Math.ceil(displayedCount / pageSize));
  const paginatedPlants = filteredPlants.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

      {/* Top Title & + Add Plant Button (Screenshot 3) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.01em' }}>
            Plants
          </h2>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>
            {totalCount} plants · {totalCount} on the portal · {totalCount} in the pipelines
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
          + Add Plant
        </button>
      </div>

      {/* Filter Row: Search & Area dropdown (Screenshot 3) */}
      <div
        style={{
          backgroundColor: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: '8px',
          padding: '10px 12px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search by plant name, code, area, or pooling station..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              backgroundColor: C.inputBg,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <select
          value={selectedArea}
          onChange={(e) => {
            setSelectedArea(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            backgroundColor: C.inputBg,
            color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            minWidth: '150px',
            outline: 'none',
          }}
        >
          <option value="ALL">All areas (1768)</option>
          <option value="GJ">GJ (640)</option>
          <option value="MH">MH (512)</option>
          <option value="MP">MP (385)</option>
          <option value="CG">CG (142)</option>
          <option value="ISTS">ISTS (89)</option>
        </select>
      </div>

      {/* 7-Column Plants Table (Screenshot 3) */}
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
              <th style={{ padding: '9px 12px' }}>AREA</th>
              <th style={{ padding: '9px 12px' }}>POOLING STATION</th>
              <th style={{ padding: '9px 12px', textAlign: 'center' }}>PORTAL</th>
              <th style={{ padding: '9px 12px', textAlign: 'center' }}>PIPELINE</th>
              <th style={{ padding: '9px 12px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPlants.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px 0', textAlign: 'center', color: C.muted }}>
                  No plants match the search query.
                </td>
              </tr>
            ) : (
              paginatedPlants.map((plant) => (
                <tr
                  key={plant.id}
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    color: C.text,
                  }}
                >
                  {/* Code */}
                  <td style={{ padding: '9px 12px', fontWeight: 700, fontFamily: 'monospace', color: '#f59e0b' }}>
                    {plant.code}
                  </td>

                  {/* Name */}
                  <td style={{ padding: '9px 12px', fontWeight: 600 }}>
                    {plant.name}
                    {plant.capacityMw && (
                      <span style={{ fontSize: '9px', color: C.muted, marginLeft: '6px' }}>
                        ({plant.capacityMw} MW · {plant.genType})
                      </span>
                    )}
                  </td>

                  {/* Area */}
                  <td style={{ padding: '9px 12px' }}>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor:
                          plant.area === 'GJ'
                            ? 'rgba(56, 189, 248, 0.15)'
                            : plant.area === 'MH'
                            ? 'rgba(168, 85, 247, 0.15)'
                            : plant.area === 'MP'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : plant.area === 'CG'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(236, 72, 153, 0.15)',
                        color:
                          plant.area === 'GJ'
                            ? '#38bdf8'
                            : plant.area === 'MH'
                            ? '#a855f7'
                            : plant.area === 'MP'
                            ? '#f59e0b'
                            : plant.area === 'CG'
                            ? '#10b981'
                            : '#ec4899',
                      }}
                    >
                      {plant.area}
                    </span>
                  </td>

                  {/* Pooling Station */}
                  <td style={{ padding: '9px 12px', color: C.muted }}>
                    {plant.poolingStation}
                  </td>

                  {/* Portal Toggle Switch (Screenshot 3) */}
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    <label style={{ position: 'relative', display: 'inline-block', width: '32px', height: '17px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={plant.portalVisible}
                        onChange={() => togglePortal(plant.id)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          inset: 0,
                          backgroundColor: plant.portalVisible ? '#10b981' : '#3f3f46',
                          transition: '0.2s',
                          borderRadius: '17px',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            height: '13px',
                            width: '13px',
                            left: plant.portalVisible ? '16px' : '2px',
                            bottom: '2px',
                            backgroundColor: '#ffffff',
                            transition: '0.2s',
                            borderRadius: '50%',
                          }}
                        />
                      </span>
                    </label>
                  </td>

                  {/* Pipeline Toggle Switch (Screenshot 3) */}
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    <label style={{ position: 'relative', display: 'inline-block', width: '32px', height: '17px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={plant.pipelineActive}
                        onChange={() => togglePipeline(plant.id)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          inset: 0,
                          backgroundColor: plant.pipelineActive ? '#10b981' : '#3f3f46',
                          transition: '0.2s',
                          borderRadius: '17px',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            height: '13px',
                            width: '13px',
                            left: plant.pipelineActive ? '16px' : '2px',
                            bottom: '2px',
                            backgroundColor: '#ffffff',
                            transition: '0.2s',
                            borderRadius: '50%',
                          }}
                        />
                      </span>
                    </label>
                  </td>

                  {/* Actions: Pencil, Trash (Screenshot 3) */}
                  <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEdit(plant)}
                        title="Edit Plant"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#71717a',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(plant.id, plant.code)}
                        title="Delete Plant"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar (Screenshot 3) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '11px',
          color: C.muted,
          padding: '4px 2px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              backgroundColor: C.cardBg,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '11px',
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div>
          Showing {Math.min(displayedCount, (currentPage - 1) * pageSize + 1)}–
          {Math.min(displayedCount, currentPage * pageSize)} of {totalCount}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              backgroundColor: C.cardBg,
              color: currentPage <= 1 ? '#52525b' : C.text,
              border: `1px solid ${C.border}`,
              borderRadius: '4px',
              padding: '3px 10px',
              fontSize: '11px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            &lt; Prev
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{
              backgroundColor: C.cardBg,
              color: currentPage >= totalPages ? '#52525b' : C.text,
              border: `1px solid ${C.border}`,
              borderRadius: '4px',
              padding: '3px 10px',
              fontSize: '11px',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next &gt;
          </button>
        </div>
      </div>

      {/* Centered Add/Edit Plant Modal (Screenshot 3 - 2 Column Form) */}
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
              maxWidth: '560px',
              padding: '22px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f4f4f5' }}>
                {editingPlantId ? 'Edit Plant' : 'Add Plant'}
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Row 1: Code & Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                    CODE *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ACL_PSS3_KPS1_S"
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
                    NAME *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Adani Solar Khavda 1"
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
              </div>

              {/* Row 2: Area & Pooling Station */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                    AREA (STATE/ISTS) *
                  </label>
                  <select
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
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
                    <option value="GJ">GJ (Gujarat)</option>
                    <option value="MH">MH (Maharashtra)</option>
                    <option value="MP">MP (Madhya Pradesh)</option>
                    <option value="CG">CG (Chhattisgarh)</option>
                    <option value="ISTS">ISTS (Inter-State)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                    POOLING STATION
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Khavda PS1"
                    value={formPoolingStation}
                    onChange={(e) => setFormPoolingStation(e.target.value)}
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
              </div>

              {/* Row 3: Capacity & Generation Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                    CAPACITY (MW)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 300"
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
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                    GENERATION TYPE
                  </label>
                  <select
                    value={formGenType}
                    onChange={(e) => setFormGenType(e.target.value as any)}
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
                    <option value="Solar">Solar</option>
                    <option value="Wind">Wind</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Coordinates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                    LATITUDE
                  </label>
                  <input
                    type="text"
                    placeholder="23.85"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
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
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                    LONGITUDE
                  </label>
                  <input
                    type="text"
                    placeholder="69.80"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
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
              </div>

              {/* Row 5: Portal Visible & Pipeline Active Checkboxes */}
              <div style={{ display: 'flex', gap: '20px', padding: '6px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#f4f4f5', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formPortal}
                    onChange={(e) => setFormPortal(e.target.checked)}
                    style={{ accentColor: '#10b981', cursor: 'pointer' }}
                  />
                  PORTAL VISIBLE
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#f4f4f5', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formPipeline}
                    onChange={(e) => setFormPipeline(e.target.checked)}
                    style={{ accentColor: '#10b981', cursor: 'pointer' }}
                  />
                  PIPELINE ACTIVE
                </label>
              </div>

              {/* Full Width Green Button */}
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
                {editingPlantId ? 'Save Changes' : 'Add Plant'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
