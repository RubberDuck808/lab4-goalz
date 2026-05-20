import { useState } from 'react'
import { authService } from '../services/authService';
import { useNavigate, Navigate } from 'react-router-dom';
import Loading from '../components/Loading/Loading';

export default function Login() {
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (authService.getToken()) return <Navigate to='/overview' replace />;

  const handleLogin = async () => {
    if (email === '' || password === '') {
      setError('Please enter both email and password.');
    } else {
      setError('');
      try {
        setLoading(true);
        await authService.authenticate(email, password);
        navigate('/overview');
      } catch (err) {
        setError(err.message || 'An error occurred during login. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className='flex flex-row bg-white h-full w-full'>
      {isLoading && <Loading />}

      {/* Branding panel */}
      <div className='hidden md:flex w-1/2 bg-[#1E293B] border-r border-slate-700/40 flex-col justify-center p-[100px]'>
        <img src="/logo.svg" alt="Loggin Logo" className="w-[72px] h-[72px] mb-6" />
        <h1 className='text-5xl font-extrabold text-white leading-tight tracking-tight'>Loggin</h1>
        <h3 className='text-4xl font-bold text-white/90 mt-1'>Dashboard</h3>
      </div>

      {/* Form panel */}
      <div className='w-full md:w-1/2 bg-white flex items-center justify-center'>
        <div className='w-[75%] max-w-sm'>
          <h1 className='text-3xl font-bold text-text-primary'>Welcome back!</h1>
          <p className='text-sm text-text-secondary mt-2'>Sign in to the Loggin Dashboard Portal</p>

          <div className='flex flex-col mt-8 gap-4'>
            <div>
              <label htmlFor="email" className='text-sm font-medium text-text-primary block mb-1'>Email</label>
              <input
                type="email"
                id='email'
                placeholder='sustainability@humber.ca'
                className='border border-border rounded-xl px-3 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-game-blue/30'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label htmlFor="password" className='text-sm font-medium text-text-primary block mb-1'>Password</label>
              <input
                type="password"
                id='password'
                placeholder='••••••••'
                className='border border-border rounded-xl px-3 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-game-blue/30'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {error && (
              <div className='bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-game-red'>
                {error}
              </div>
            )}

            <button
              className='bg-game-green border-b-[3px] border-game-green-border text-white rounded-xl py-2.5 w-full font-bold text-sm cursor-pointer hover:opacity-90 transition mt-2'
              onClick={handleLogin}
            >
              Sign In
            </button>

            <p className='text-sm text-text-secondary text-center'>
              Forgot your password?{' '}
              <a href="#" className='text-game-blue font-semibold hover:underline'>Reset it here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
