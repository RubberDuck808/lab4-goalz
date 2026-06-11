import { useState, useEffect, useCallback } from 'react';
import { authService } from '../../../services/authService';
import { createUserService } from '../../../services/createUserService';
import { userManagementService } from '../../../services/userManagementService';

const inputCls = 'border border-border rounded-xl px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-game-blue/30 bg-white';

export default function Settings() {
  const user = authService.getUser();
  const isAdmin = user?.role === 'Admin';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await userManagementService.listUsers();
      setUsers(data);
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin, fetchUsers]);

  const handleCreateUser = async () => {
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    setError(''); setSuccess(''); setLoading(true);
    try {
      await createUserService.createStaffUser(email, name, password);
      setSuccess(`Staff account created for ${email}.`);
      setName(''); setEmail(''); setPassword('');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'Staff' : 'Admin';
    setActionLoading(`role-${userId}`); setUsersError('');
    try {
      await userManagementService.changeRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    setActionLoading(`delete-${userId}`); setUsersError('');
    try {
      await userManagementService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const cardCls = 'rounded-xl border border-border p-6 bg-white flex flex-col gap-5';

  if (!isAdmin) {
    return (
      <div className='p-8'>
        <h1 className='text-2xl font-bold text-text-primary mb-1'>Settings</h1>
        <p className='text-sm text-text-secondary mb-6'>Manage dashboard preferences and users.</p>
        <div className={`${cardCls} max-w-md`}>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-game-blue-soft flex items-center justify-center shrink-0'>
              <i className='fa-solid fa-lock text-game-blue text-sm' />
            </div>
            <div>
              <h2 className='font-semibold text-text-primary text-sm'>User Management</h2>
              <p className='text-xs text-text-secondary'>Only admins can manage user accounts.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold text-text-primary mb-1'>Settings</h1>
      <p className='text-sm text-text-secondary mb-6'>Manage dashboard preferences and users.</p>

      <div className='flex flex-col gap-5 max-w-2xl'>

        {/* Create user */}
        <div className={cardCls}>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-game-blue-soft flex items-center justify-center shrink-0'>
              <i className='fa-solid fa-user-plus text-game-blue text-sm' />
            </div>
            <div>
              <h2 className='font-semibold text-text-primary text-sm'>Create Staff User</h2>
              <p className='text-xs text-text-secondary'>New accounts are created with Staff role</p>
            </div>
          </div>

          <div className='flex flex-col gap-3'>
            <div>
              <label className='text-xs font-semibold text-text-primary block mb-1'>Full Name</label>
              <input type='text' placeholder='Jane Smith' className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className='text-xs font-semibold text-text-primary block mb-1'>Email</label>
              <input type='email' placeholder='staff@humber.ca' className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className='text-xs font-semibold text-text-primary block mb-1'>Password</label>
              <input type='password' placeholder='••••••••' className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && <p className='text-sm text-game-red'>{error}</p>}
            {success && <p className='text-sm text-game-green'>{success}</p>}

            <button
              className='bg-game-green border-b-[3px] border-game-green-border text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50 cursor-pointer'
              onClick={handleCreateUser}
              disabled={loading}
            >
              {loading ? 'Creating…' : 'Create Staff User'}
            </button>
          </div>
        </div>

        {/* User list */}
        <div className={cardCls}>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-game-blue-soft flex items-center justify-center shrink-0'>
              <i className='fa-solid fa-users text-game-blue text-sm' />
            </div>
            <div>
              <h2 className='font-semibold text-text-primary text-sm'>User Management</h2>
              <p className='text-xs text-text-secondary'>View, promote, or remove staff and admin accounts</p>
            </div>
          </div>

          {usersError && <p className='text-sm text-game-red'>{usersError}</p>}

          {usersLoading ? (
            <p className='text-sm text-text-secondary'>Loading users…</p>
          ) : users.length === 0 ? (
            <p className='text-sm text-text-secondary'>No staff or admin users found.</p>
          ) : (
            <div className='overflow-x-auto'>{/* overflow-x-auto: horizontal scroll, rows left-aligned at card padding */}
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-text-secondary border-b border-border'>
                  {/* merged: name and email shown as "Name / Email" */}
                  <th className='pb-2 pr-4 font-semibold text-xs uppercase tracking-wide whitespace-nowrap'>Name / Email</th>
                  <th className='pb-2 pr-4 font-semibold text-xs uppercase tracking-wide'>Role</th>
                  <th className='pb-2' />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className='border-b border-border last:border-0'>
                    {/* name / email in one cell, nowrap prevents wrapping beyond scroll container */}
                    <td className='py-3 pr-4 font-medium text-text-primary text-sm whitespace-nowrap'>{u.name} / {u.email}</td>
                    <td className='py-3 pr-4'>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'Admin' ? 'bg-game-blue-soft text-game-blue' : 'bg-surface text-text-secondary border border-border'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className='py-3'>
                      <div className='flex items-center gap-2 justify-end'>
                        <button
                          className='text-xs px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:bg-surface disabled:opacity-50 cursor-pointer transition'
                          onClick={() => handleChangeRole(u.id, u.role)}
                          disabled={actionLoading !== null || u.email === user.email}
                          title={u.email === user.email ? "Can't change your own role" : `Switch to ${u.role === 'Admin' ? 'Staff' : 'Admin'}`}
                        >
                          {actionLoading === `role-${u.id}` ? '…' : `Make ${u.role === 'Admin' ? 'Staff' : 'Admin'}`}
                        </button>
                        <button
                          className='text-xs px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-game-red hover:bg-red-100 disabled:opacity-50 cursor-pointer transition'
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={actionLoading !== null || u.email === user.email}
                          title={u.email === user.email ? "Can't delete your own account" : 'Delete user'}
                        >
                          {actionLoading === `delete-${u.id}` ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
