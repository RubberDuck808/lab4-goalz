import { useState } from 'react';
import { authService } from '../../../services/authService';
import { createUserService } from '../../../services/createUserService';

export default function Settings() {
  const user = authService.getUser();
  const isAdmin = user?.role === 'Admin';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold text-secondary-black mb-1'>Settings</h1>
      <p className='text-sm text-gray-500 mb-8'>Manage your dashboard preferences and users.</p>

      {isAdmin ? (
        <div className='max-w-md'>
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
        </div>
      ) : (
        <div className='max-w-md border border-gray-200 rounded-xl p-6'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-full bg-light-green flex items-center justify-center'>
              <i className='fa-solid fa-lock text-primary-green text-sm'></i>
            </div>
            <div>
              <h2 className='font-semibold text-secondary-black'>User Management</h2>
              <p className='text-sm text-gray-500'>Only admins can create new staff accounts.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
