import { useState, useEffect, useCallback } from 'react';
import { authService } from '../../../services/authService';
import { createUserService } from '../../../services/createUserService';
import { userManagementService } from '../../../services/userManagementService';

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
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await createUserService.createStaffUser(email, name, password);
      setSuccess(`Staff account created for ${email}.`);
      setName('');
      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'Staff' : 'Admin';
    setActionLoading(`role-${userId}`);
    setUsersError('');
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
    setActionLoading(`delete-${userId}`);
    setUsersError('');
    try {
      await userManagementService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className='p-8'>
        <h1 className='text-2xl font-bold text-secondary-black mb-1'>Settings</h1>
        <p className='text-sm text-gray-500 mb-8'>Manage your dashboard preferences and users.</p>
        <div className='max-w-md border border-gray-200 rounded-xl p-6'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-full bg-light-green flex items-center justify-center'>
              <i className='fa-solid fa-lock text-primary-green text-sm'></i>
            </div>
            <div>
              <h2 className='font-semibold text-secondary-black'>User Management</h2>
              <p className='text-sm text-gray-500'>Only admins can manage user accounts.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold text-secondary-black mb-1'>Settings</h1>
      <p className='text-sm text-gray-500 mb-8'>Manage your dashboard preferences and users.</p>

      <div className='flex flex-col gap-8 max-w-2xl'>
        {/* Create user */}
        <div className='border border-gray-200 rounded-xl p-6'>
          <div className='flex items-center gap-3 mb-5'>
            <div className='w-9 h-9 rounded-full bg-light-green flex items-center justify-center'>
              <i className='fa-solid fa-user-plus text-primary-green text-sm'></i>
            </div>
            <div>
              <h2 className='font-semibold text-secondary-black'>Create Staff User</h2>
              <p className='text-xs text-gray-500'>New accounts are created with Staff role</p>
            </div>
          </div>

          <div className='flex flex-col gap-4'>
            <div>
              <label className='text-sm font-medium text-gray-700 block mb-1'>Full Name</label>
              <input
                type='text'
                placeholder='Jane Smith'
                className='border border-gray-300 rounded-md p-2 w-full text-sm'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700 block mb-1'>Email</label>
              <input
                type='email'
                placeholder='staff@humber.ca'
                className='border border-gray-300 rounded-md p-2 w-full text-sm'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700 block mb-1'>Password</label>
              <input
                type='password'
                placeholder='••••••••'
                className='border border-gray-300 rounded-md p-2 w-full text-sm'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className='text-red-600 text-sm'>{error}</p>}
            {success && <p className='text-green-600 text-sm'>{success}</p>}

            <button
              className='bg-secondary-green text-white rounded-md p-2 text-sm font-medium cursor-pointer disabled:opacity-50'
              onClick={handleCreateUser}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Staff User'}
            </button>
          </div>
        </div>

        {/* User list */}
        <div className='border border-gray-200 rounded-xl p-6'>
          <div className='flex items-center gap-3 mb-5'>
            <div className='w-9 h-9 rounded-full bg-light-green flex items-center justify-center'>
              <i className='fa-solid fa-users text-primary-green text-sm'></i>
            </div>
            <div>
              <h2 className='font-semibold text-secondary-black'>User Management</h2>
              <p className='text-xs text-gray-500'>View, promote, or remove staff and admin accounts</p>
            </div>
          </div>

          {usersError && <p className='text-red-600 text-sm mb-3'>{usersError}</p>}

          {usersLoading ? (
            <p className='text-sm text-gray-500'>Loading users...</p>
          ) : users.length === 0 ? (
            <p className='text-sm text-gray-400'>No staff or admin users found.</p>
          ) : (
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-gray-500 border-b border-gray-100'>
                  <th className='pb-2 font-medium'>Name</th>
                  <th className='pb-2 font-medium'>Email</th>
                  <th className='pb-2 font-medium'>Role</th>
                  <th className='pb-2 font-medium'></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className='border-b border-gray-50 last:border-0'>
                    <td className='py-3 pr-4 font-medium text-secondary-black'>{u.name}</td>
                    <td className='py-3 pr-4 text-gray-500'>{u.email}</td>
                    <td className='py-3 pr-4'>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'Admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className='py-3'>
                      <div className='flex items-center gap-2 justify-end'>
                        <button
                          className='text-xs px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 cursor-pointer'
                          onClick={() => handleChangeRole(u.id, u.role)}
                          disabled={actionLoading !== null || u.email === user.email}
                          title={u.email === user.email ? "Can't change your own role" : `Switch to ${u.role === 'Admin' ? 'Staff' : 'Admin'}`}
                        >
                          {actionLoading === `role-${u.id}`
                            ? '...'
                            : `Make ${u.role === 'Admin' ? 'Staff' : 'Admin'}`}
                        </button>
                        <button
                          className='text-xs px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer'
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={actionLoading !== null || u.email === user.email}
                          title={u.email === user.email ? "Can't delete your own account" : 'Delete user'}
                        >
                          {actionLoading === `delete-${u.id}` ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
