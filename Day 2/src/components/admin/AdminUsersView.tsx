import React, { useState, useMemo } from 'react';

export interface UserItem {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  role: 'super_admin' | 'admin' | 'user';
  status: 'active' | 'inactive';
  assignedStates: string[];
}

export interface AdminUsersViewProps {
  theme?: 'dark' | 'light';
  isCreateOpenInitially?: boolean;
}

const DEFAULT_USERS: UserItem[] = [
  { id: 'u-1', username: 'admin', displayName: 'Super Admin', email: 'admin@grid-india.in', role: 'super_admin', status: 'active', assignedStates: ['CG', 'GJ', 'MP', 'MH'] },
  { id: 'u-2', username: 'cg_admin', displayName: 'Chhattisgarh SLDC', email: 'cg_admin@sldc.cg.gov.in', role: 'admin', status: 'active', assignedStates: ['CG'] },
  { id: 'u-3', username: 'gj_admin', displayName: 'Gujarat SLDC', email: 'gj_admin@getcosldc.com', role: 'admin', status: 'active', assignedStates: ['GJ'] },
  { id: 'u-4', username: 'mp_admin', displayName: 'Madhya Pradesh SLDC', email: 'mp_admin@sldcmp.in', role: 'admin', status: 'active', assignedStates: ['MP'] },
  { id: 'u-5', username: 'mh_admin', displayName: 'Maharashtra SLDC', email: 'mh_admin@mahasldc.in', role: 'admin', status: 'active', assignedStates: ['MH'] },
];

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  theme = 'dark',
  isCreateOpenInitially = false,
}) => {
  const isLight = theme === 'light';
  const [users, setUsers] = useState<UserItem[]>(DEFAULT_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(isCreateOpenInitially);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'super_admin' | 'admin' | 'user'>('user');
  const [assignedStates, setAssignedStates] = useState<string[]>([]);
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

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setFormUsername('');
    setFormPassword('');
    setFormDisplayName('');
    setFormEmail('');
    setFormRole('user');
    setAssignedStates([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditingUserId(user.id);
    setFormUsername(user.username);
    setFormPassword('');
    setFormDisplayName(user.displayName);
    setFormEmail(user.email || '');
    setFormRole(user.role);
    setAssignedStates(user.assignedStates || []);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleStateCheckbox = (stateCode: string) => {
    if (assignedStates.includes(stateCode)) {
      setAssignedStates(assignedStates.filter((s) => s !== stateCode));
    } else {
      setAssignedStates([...assignedStates, stateCode]);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim()) {
      setFormError('Username is required.');
      return;
    }
    if (!editingUserId && !formPassword) {
      setFormError('Password is required for new users.');
      return;
    }
    if (!formDisplayName.trim()) {
      setFormError('Display Name is required.');
      return;
    }

    if (editingUserId) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserId
            ? {
                ...u,
                username: formUsername.trim(),
                displayName: formDisplayName.trim(),
                email: formEmail.trim() || undefined,
                role: formRole,
                assignedStates,
              }
            : u
        )
      );
      showToast(`User ${formUsername} updated successfully.`);
    } else {
      const newUser: UserItem = {
        id: `u-${Date.now()}`,
        username: formUsername.trim().toLowerCase(),
        displayName: formDisplayName.trim(),
        email: formEmail.trim() || undefined,
        role: formRole,
        status: 'active',
        assignedStates,
      };
      setUsers((prev) => [...prev, newUser]);
      showToast(`User ${newUser.username} created successfully.`);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === 'active' ? 'inactive' : 'active';
          showToast(`User ${u.username} set to ${newStatus}`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (id: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast(`User ${username} deleted.`);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }, [users, searchQuery]);

  const activeCount = users.filter((u) => u.status === 'active').length;

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

      {/* Top Title & + New User Button (Screenshot 2) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.01em' }}>
            Users
          </h2>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>
            {users.length} total · {activeCount} active
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
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
            transition: 'background-color 0.15s ease',
          }}
        >
          + New User
        </button>
      </div>

      {/* Search Input Filter (Screenshot 2) */}
      <div
        style={{
          backgroundColor: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: '8px',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Search by username or display name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: C.inputBg,
            color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '12px',
            outline: 'none',
          }}
        />
      </div>

      {/* Users Table (Screenshot 2) */}
      <div
        style={{
          backgroundColor: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: '8px',
          overflowX: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
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
              <th style={{ padding: '9px 14px' }}>USERNAME</th>
              <th style={{ padding: '9px 14px' }}>DISPLAY NAME</th>
              <th style={{ padding: '9px 14px', textAlign: 'center' }}>STATUS</th>
              <th style={{ padding: '9px 14px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '32px 0', textAlign: 'center', color: C.muted }}>
                  No users found matching "{searchQuery}"
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isActive = user.status === 'active';
                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      color: C.text,
                    }}
                  >
                    {/* Username */}
                    <td style={{ padding: '10px 14px', fontWeight: 700, fontFamily: 'monospace', color: '#f59e0b' }}>
                      {user.username}
                      {user.role === 'super_admin' && (
                        <span
                          style={{
                            marginLeft: '8px',
                            fontSize: '9px',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b',
                            fontWeight: 700,
                          }}
                        >
                          SUPER ADMIN
                        </span>
                      )}
                    </td>

                    {/* Display Name */}
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                      {user.displayName}
                      {user.assignedStates && user.assignedStates.length > 0 && (
                        <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>
                          States: {user.assignedStates.join(', ')}
                        </div>
                      )}
                    </td>

                    {/* Status Badge (Screenshot 2: green 'active' pill) */}
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(113, 113, 122, 0.2)',
                          color: isActive ? '#10b981' : '#71717a',
                          border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(113, 113, 122, 0.3)'}`,
                        }}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* Actions: Pencil, Red Deactivate button, Trash (Screenshot 2) */}
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {/* Edit Pencil */}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Edit User"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#71717a',
                            cursor: 'pointer',
                            fontSize: '13px',
                            padding: '2px',
                          }}
                        >
                          ✏️
                        </button>

                        {/* Red Deactivate / Green Activate Button */}
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          style={{
                            backgroundColor: isActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: isActive ? '#ef4444' : '#10b981',
                            border: `1px solid ${isActive ? '#ef4444' : '#10b981'}`,
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        {/* Delete Trash */}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          title="Delete User"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '13px',
                            padding: '2px',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Centered Create/Edit User Modal (Exact Layout in Screenshot 2) */}
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
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f4f4f5' }}>
                {editingUserId ? 'Edit User' : 'Create User'}
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

            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Username */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                  USERNAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. sldc_operator"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
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

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                  PASSWORD * {editingUserId && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
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

              {/* Display Name */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                  DISPLAY NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gujarat SLDC Operator"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
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

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                  EMAIL (OPTIONAL)
                </label>
                <input
                  type="email"
                  placeholder="operator@sldc.in"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
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

              {/* Role */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                  ROLE
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
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
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                  <option value="super_admin">super_admin</option>
                </select>
              </div>

              {/* Assign State (Optional) - Screenshot 2 checkboxes */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '6px' }}>
                  ASSIGN STATE (OPTIONAL)
                </label>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {['CG', 'GJ', 'MP', 'MH'].map((st) => (
                    <label key={st} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#f4f4f5', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={assignedStates.includes(st)}
                        onChange={() => handleToggleStateCheckbox(st)}
                        style={{ accentColor: '#10b981', cursor: 'pointer' }}
                      />
                      {st}
                    </label>
                  ))}
                </div>
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
                {editingUserId ? 'Save Changes' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
