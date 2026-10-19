import React, { useState } from 'react';
import { Globe } from '../components/Globe';
import { Icons } from '../components/Icons';

export interface LoginShellViewProps {
  onSuccessfulLogin?: () => void;
  theme?: 'dark' | 'light';
  onThemeToggle?: () => void;
}

export type LoginDisplayState = 'idle' | 'loading' | 'error' | 'success';

export const LoginShellView: React.FC<LoginShellViewProps> = ({
  onSuccessfulLogin,
  theme = 'dark',
  onThemeToggle,
}) => {
  // Form input state (Pre-filled with sample credentials matching the screenshot)
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('forecast@2026');
  const [showPassword, setShowPassword] = useState(false);

  // UI state management
  const [loginState, setLoginState] = useState<LoginDisplayState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [demoStateMode, setDemoStateMode] = useState<string>('interactive');

  const isDark = theme === 'dark';

  // Handle Form Submission (Task 03 Mock Validation)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation for empty fields
    if (!username.trim() || !password.trim()) {
      setLoginState('error');
      setErrorMessage('Please enter both username and password.');
      return;
    }

    // 2. Trigger loading state
    setLoginState('loading');
    setErrorMessage('');

    // 3. Simulated mock authentication delay (No real server check, strictly local)
    setTimeout(() => {
      if (username.toLowerCase() === 'error') {
        setLoginState('error');
        setErrorMessage('Authentication rejected: Invalid mock credentials. (Use "superadmin" or "operator")');
      } else {
        setLoginState('success');
        setTimeout(() => {
          onSuccessfulLogin?.();
        }, 1000);
      }
    }, 1200);
  };

  // Helper for Task 03 reviewer state simulator
  const forceState = (state: 'idle' | 'empty' | 'loading' | 'error' | 'success') => {
    setDemoStateMode(state);
    if (state === 'idle') {
      setUsername('superadmin');
      setPassword('forecast@2026');
      setLoginState('idle');
      setErrorMessage('');
    } else if (state === 'empty') {
      setUsername('');
      setPassword('');
      setLoginState('idle');
      setErrorMessage('');
    } else if (state === 'loading') {
      setUsername('superadmin');
      setPassword('••••••••••••');
      setLoginState('loading');
      setErrorMessage('');
    } else if (state === 'error') {
      setUsername('invalid_user');
      setPassword('wrong_pass');
      setLoginState('error');
      setErrorMessage('Authentication rejected: Invalid mock credentials.');
    } else if (state === 'success') {
      setUsername('superadmin');
      setPassword('••••••••••••');
      setLoginState('success');
      setErrorMessage('');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 24px)',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: isDark ? '#000000' : '#f1f5f9',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Task 03 Training State Simulator Toolbar (Floating at Top-Center) */}
      <aside
        aria-label="Task 03 UI State Controls"
        style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          backgroundColor: isDark ? 'rgba(18, 18, 20, 0.85)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${isDark ? '#27272a' : '#d4d4d8'}`,
          borderRadius: '20px',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <span style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          🧪 Task 03:
        </span>
        <button
          type="button"
          onClick={() => forceState('empty')}
          style={{
            background: demoStateMode === 'empty' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            border: `1px solid ${demoStateMode === 'empty' ? '#f59e0b' : 'transparent'}`,
            color: demoStateMode === 'empty' ? '#f59e0b' : isDark ? '#a1a1aa' : '#52525b',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Empty
        </button>
        <button
          type="button"
          onClick={() => forceState('loading')}
          style={{
            background: demoStateMode === 'loading' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
            border: `1px solid ${demoStateMode === 'loading' ? '#38bdf8' : 'transparent'}`,
            color: demoStateMode === 'loading' ? '#38bdf8' : isDark ? '#a1a1aa' : '#52525b',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Loading
        </button>
        <button
          type="button"
          onClick={() => forceState('error')}
          style={{
            background: demoStateMode === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
            border: `1px solid ${demoStateMode === 'error' ? '#ef4444' : 'transparent'}`,
            color: demoStateMode === 'error' ? '#ef4444' : isDark ? '#a1a1aa' : '#52525b',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Error
        </button>
        <button
          type="button"
          onClick={() => forceState('success')}
          style={{
            background: demoStateMode === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            border: `1px solid ${demoStateMode === 'success' ? '#10b981' : 'transparent'}`,
            color: demoStateMode === 'success' ? '#10b981' : isDark ? '#a1a1aa' : '#52525b',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Mock Success
        </button>
        <button
          type="button"
          onClick={() => forceState('idle')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8b5cf6',
            padding: '2px 6px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Reset
        </button>
      </aside>

      {/* ── LEFT: 3D Globe with IITB & GRID-INDIA Branding ─────────────── */}
      <section
        aria-label="Earth Telemetry Visualization"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: isDark ? '#000000' : '#bae6fd',
          display: 'flex',
          minHeight: '600px',
        }}
        className="globe-container"
      >
        {/* 3D WebGL Canvas Globe */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <Globe theme={theme} />
        </div>

        {/* Top-Left: IITB & GRID-INDIA Logos matching Screenshot */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'flex-end',
            gap: '24px',
          }}
        >
          {/* IITB Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="/images/iitb.jpg"
                alt="IIT Bombay Emblem"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  // Fallback to embedded SVG if external jpg is blocked
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span
              style={{
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                textShadow: '0 2px 6px rgba(0,0,0,0.8)',
              }}
            >
              IITB
            </span>
          </div>

          {/* GRID-INDIA Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                height: '60px',
                width: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '4px 10px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                boxSizing: 'border-box',
              }}
            >
              <img
                src="/images/grid_india.png"
                alt="GRID-INDIA Logo"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span
              style={{
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                textShadow: '0 2px 6px rgba(0,0,0,0.8)',
              }}
            >
              GRID-INDIA
            </span>
          </div>
        </div>

        {/* Bottom-Left: Inspirational Slogan matching Screenshot */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '24px',
            zIndex: 10,
            maxWidth: '460px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '6px',
                alignSelf: 'stretch',
                borderRadius: '4px',
                backgroundColor: '#f59e0b',
                flexShrink: 0,
              }}
            />
            <p
              style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.95)',
                fontSize: '17px',
                fontStyle: 'italic',
                fontWeight: 500,
                lineHeight: 1.5,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
              }}
            >
              “Advanced forecasting models for a sustainable energy future.”
            </p>
          </div>
        </div>
      </section>

      {/* ── RIGHT: Welcome Back & Exact Login Card ─────────────────────── */}
      <section
        aria-label="Login Authentication Form"
        style={{
          width: '100%',
          maxWidth: '560px',
          minWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderLeft: `1px solid ${isDark ? '#27272a' : '#e4e7eb'}`,
          backgroundColor: isDark ? '#000000' : '#ffffff',
          boxSizing: 'border-box',
        }}
      >
        {/* Top-Right: Theme Button matching Screenshot */}
        <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
          <button
            type="button"
            onClick={onThemeToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              border: `1px solid ${isDark ? '#3f3f46' : '#d4d4d8'}`,
              backgroundColor: isDark ? '#141416' : '#f4f4f5',
              color: isDark ? '#a1a1aa' : '#52525b',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span>{isDark ? '☀️' : '🌙'}</span>
            <span>Theme</span>
          </button>
        </div>

        {/* Center: Form Area */}
        <div
          style={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ width: '100%', maxWidth: '380px' }}>
            {/* Heading matching Screenshot */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#f59e0b',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Welcome Back
              </h1>
              <p
                style={{
                  fontSize: '13px',
                  color: isDark ? '#71717a' : '#6b7280',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                Enter your credentials to access the forecast dashboard.
              </p>
            </div>

            {/* Login Card */}
            <div
              style={{
                borderRadius: '14px',
                border: `1px solid ${isDark ? '#27272a' : '#e5e7eb'}`,
                backgroundColor: isDark ? '#111113' : '#f9fafb',
                padding: '28px',
                boxShadow: isDark ? '0 12px 36px rgba(0, 0, 0, 0.7)' : '0 10px 25px rgba(0, 0, 0, 0.06)',
                boxSizing: 'border-box',
              }}
            >
              {/* Card Title inside Card */}
              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <h2
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: isDark ? '#ffffff' : '#111827',
                    margin: '0 0 4px 0',
                    letterSpacing: '0.02em',
                  }}
                >
                  GI-IITB Experimental Forecast
                </h2>
                <p
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: '#f59e0b',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    margin: 0,
                  }}
                >
                  NOWCASTING • INTRA • MEDIUM
                </p>
              </div>

              {/* Validation Error Banner */}
              {loginState === 'error' && errorMessage && (
                <div
                  role="alert"
                  aria-live="assertive"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid #ef4444',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Icons.AlertCircle size={15} color="#ef4444" />
                  <div style={{ fontSize: '12px', color: '#fca5a5' }}>
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Mock Success Banner */}
              {loginState === 'success' && (
                <div
                  role="status"
                  aria-live="polite"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid #10b981',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Icons.CheckCircle size={15} color="#10b981" />
                  <div style={{ fontSize: '12px', color: '#86efac' }}>
                    <strong>[Mock Success Verified]</strong> Directing to dashboard...
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                {/* Username Input matching light-blue style from Screenshot */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    htmlFor="login-username"
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isDark ? '#a1a1aa' : '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    Username
                  </label>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your username"
                    value={username}
                    disabled={loginState === 'loading'}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (loginState === 'error') setLoginState('idle');
                    }}
                    style={{
                      width: '100%',
                      height: '42px',
                      borderRadius: '8px',
                      padding: '0 14px',
                      fontSize: '13px',
                      fontWeight: 500,
                      outline: 'none',
                      backgroundColor: isDark ? '#e8edf5' : '#ffffff',
                      border: `1px solid ${loginState === 'error' && !username.trim() ? '#ef4444' : isDark ? '#cbd5e1' : '#d1d5db'}`,
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s ease',
                    }}
                  />
                </div>

                {/* Password Input matching Screenshot */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    htmlFor="login-password"
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isDark ? '#a1a1aa' : '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter Password"
                      value={password}
                      disabled={loginState === 'loading'}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (loginState === 'error') setLoginState('idle');
                      }}
                      style={{
                        width: '100%',
                        height: '42px',
                        borderRadius: '8px',
                        padding: '0 40px 0 14px',
                        fontSize: '13px',
                        fontWeight: 500,
                        outline: 'none',
                        backgroundColor: isDark ? '#e8edf5' : '#ffffff',
                        border: `1px solid ${loginState === 'error' && !password.trim() ? '#ef4444' : isDark ? '#cbd5e1' : '#d1d5db'}`,
                        color: '#0f172a',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s ease',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Submit Button matching Orange 'Secure Login' */}
                <button
                  type="submit"
                  disabled={loginState === 'loading'}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#ffffff',
                    backgroundColor: loginState === 'loading' ? '#d97706' : '#f59e0b',
                    border: 'none',
                    cursor: loginState === 'loading' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {loginState === 'loading' ? (
                    <>
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          border: '2px solid #ffffff',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                          display: 'inline-block',
                        }}
                      />
                      Signing in...
                    </>
                  ) : (
                    'Secure Login'
                  )}
                </button>
              </form>

              {/* Dev Quick Fill Mock Button */}
              <div style={{ marginTop: '14px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('superadmin');
                    setPassword('forecast@2026');
                    setLoginState('idle');
                    setErrorMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8b5cf6',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  ⚡ Reset / Quick Fill Credentials
                </button>
              </div>

              {/* Card Footer matching Screenshot */}
              <p
                style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  color: isDark ? '#52525b' : '#9ca3af',
                  marginTop: '18px',
                  marginBottom: 0,
                  fontWeight: 500,
                }}
              >
                Restricted Access • System v3.0
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
