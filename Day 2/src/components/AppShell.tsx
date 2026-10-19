import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar, type AdminSubSection } from './Sidebar';

export interface AppShellProps {
  children?: React.ReactNode;
  activeView: 'dashboard' | 'admin' | 'login';
  onViewChange: (view: 'dashboard' | 'admin' | 'login') => void;
  adminSection?: AdminSubSection;
  onAdminSectionChange?: (section: AdminSubSection) => void;
  viewportWidth?: '100%' | '768px' | '375px';
  onViewportChange?: (vp: '100%' | '768px' | '375px') => void;
  theme?: 'dark' | 'light';
  onThemeToggle?: () => void;
  vizState?: 'normal' | 'loading' | 'error';
  onVizStateChange?: (state: 'normal' | 'loading' | 'error') => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeView,
  onViewChange,
  adminSection = 'overview',
  onAdminSectionChange = () => {},
  viewportWidth = '100%',
  onViewportChange = () => {},
  theme: controlledTheme,
  onThemeToggle: controlledThemeToggle,
  vizState = 'normal',
  onVizStateChange = () => {},
}) => {
  const [internalTheme, setInternalTheme] = useState<'dark' | 'light'>('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const theme = controlledTheme ?? internalTheme;
  const toggleTheme = controlledThemeToggle ?? (() => {
    setInternalTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  });

  const isLight = theme === 'light';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: isLight ? '#f4f4f5' : '#000000',
        color: isLight ? '#09090b' : '#e4e4e7',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {/* 1. Master Compact Header (52px height) - Hide on Login view */}
      {activeView !== 'login' && (
        <Header
          activeView={activeView}
          onViewChange={onViewChange}
          theme={theme}
          onThemeToggle={toggleTheme}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
          vizState={vizState}
          onVizStateChange={onVizStateChange}
        />
      )}

      {/* 2. Admin Sidebar + Main Content */}
      <div style={{ display: 'flex', flex: '1 1 auto', position: 'relative', width: '100%' }}>
        {/* Render Left Sidebar only when in Admin View */}
        {activeView === 'admin' && (
          <Sidebar
            activeSection={adminSection}
            onSectionChange={onAdminSectionChange}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div
          style={{
            flex: '1 1 auto',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: activeView === 'login' ? '0' : activeView === 'dashboard' ? '6px 8px 16px 8px' : '12px 16px',
            boxSizing: 'border-box',
          }}
        >
          <main
            id="main-content"
            style={{
              width: '100%',
              maxWidth: activeView === 'login' ? '100%' : '1680px',
              boxSizing: 'border-box',
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
