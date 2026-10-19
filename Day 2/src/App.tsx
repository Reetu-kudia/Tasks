import React, { useState } from 'react';
import { AppShell } from './components/AppShell';
import { LoginShellView } from './views/LoginShellView';
import { DashboardShellView } from './views/DashboardShellView';
import { AdminShellView } from './views/AdminShellView';
import type { AdminSubSection } from './components/Sidebar';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'admin' | 'login'>('dashboard');
  const [adminSection, setAdminSection] = useState<AdminSubSection>('overview');
  const [viewportWidth, setViewportWidth] = useState<'100%' | '768px' | '375px'>('100%');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [vizState, setVizState] = useState<'normal' | 'loading' | 'error'>('normal');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AppShell
      activeView={currentView}
      onViewChange={setCurrentView}
      adminSection={adminSection}
      onAdminSectionChange={setAdminSection}
      viewportWidth={viewportWidth}
      onViewportChange={setViewportWidth}
      theme={theme}
      onThemeToggle={toggleTheme}
      vizState={vizState}
      onVizStateChange={setVizState}
    >
      {currentView === 'login' && (
        <LoginShellView
          onSuccessfulLogin={() => setCurrentView('dashboard')}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      )}
      {currentView === 'dashboard' && (
        <DashboardShellView
          onGoToAdmin={() => setCurrentView('admin')}
          onLogout={() => setCurrentView('login')}
          onThemeToggle={toggleTheme}
          theme={theme}
          vizState={vizState}
          onVizStateChange={setVizState}
        />
      )}
      {currentView === 'admin' && (
        <AdminShellView
          activeSection={adminSection}
          onSectionChange={setAdminSection}
          onGoToDashboard={() => setCurrentView('dashboard')}
          theme={theme}
        />
      )}
    </AppShell>
  );
};

export default App;
