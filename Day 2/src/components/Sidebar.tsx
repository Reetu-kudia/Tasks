import React from 'react';
import { Icons } from './Icons';

export type AdminSubSection = 'overview' | 'users' | 'plants' | 'regions' | 'coverage' | 'features';

export interface SidebarProps {
  activeSection: AdminSubSection;
  onSectionChange: (section: AdminSubSection) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onGoToDashboard?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  isOpenMobile,
  onCloseMobile,
  onGoToDashboard,
}) => {
  const navItems: { id: AdminSubSection; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Admin Dashboard', icon: <Icons.Dashboard size={18} /> },
    { id: 'users', label: 'Users', icon: <Icons.Users size={18} /> },
    { id: 'plants', label: 'Plants', icon: <Icons.Plants size={18} /> },
    { id: 'regions', label: 'Regions', icon: <Icons.Regions size={18} /> },
    { id: 'coverage', label: 'Live Actuals Coverage', icon: <Icons.Analytics size={18} /> },
    { id: 'features', label: 'Features & Maintenance', icon: <Icons.Security size={18} /> },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 40,
          }}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        aria-label="Admin Navigation Sidebar"
        style={{
          width: '64px',
          backgroundColor: '#0a0a0a',
          borderRight: '1px solid #27272a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 0',
          gap: '8px',
          flexShrink: 0,
          minHeight: 'calc(100vh - 65px)',
          transition: 'transform 0.25s ease',
          zIndex: 45,
        }}
        className={`admin-sidebar ${isOpenMobile ? 'mobile-open' : ''}`}
      >
        <div style={{ fontSize: '9px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
          ADMIN
        </div>

        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                onCloseMobile();
              }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              title={item.label}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                border: isActive ? '1px solid #f59e0b' : '1px solid transparent',
                backgroundColor: isActive ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: isActive ? '#f59e0b' : '#71717a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                outline: 'none',
              }}
              className="sidebar-icon-btn"
            >
              {item.icon}

              {/* Active left indicator bar */}
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: '-2px',
                    top: '10px',
                    bottom: '10px',
                    width: '3px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '0 2px 2px 0',
                  }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: '1 1 auto' }} />

        {/* Bottom controls matching screenshots */}
        <button
          type="button"
          title="Collapse sidebar"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#71717a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          className="sidebar-icon-btn"
        >
          &lt;
        </button>

        {onGoToDashboard && (
          <button
            type="button"
            onClick={onGoToDashboard}
            title="Return to Forecasting Dashboard"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            className="sidebar-icon-btn"
          >
            ➔
          </button>
        )}
      </aside>

      <style>{`
        .sidebar-icon-btn:hover {
          background-color: #1a1a1a !important;
          color: #e4e4e7 !important;
        }
        .sidebar-icon-btn:focus-visible {
          box-shadow: 0 0 0 2px #8b5cf6 !important;
        }
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed !important;
            top: 65px;
            left: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          .admin-sidebar.mobile-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
};

