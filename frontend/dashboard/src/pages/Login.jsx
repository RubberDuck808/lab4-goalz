import { useState } from 'react'
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading/Loading';

export default function Login() {
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      {
        isLoading && <Loading />
      }
        <div className='hidden md:block w-1/2 bg-primary-green p-[100px]'>
          <div className='w-[72px] h-[72px] rounded-full bg-secondary-green flex items-center justify-center mb-5'>
            <i class="fa-solid fa-leaf text-white text-3xl"></i>
          </div>
          <div>
            <h1 className='font text-4xl font-bold text-white'>Arboretum</h1>
            <h3 className='font text-light-green text-4xl font-bold'>Dasboard</h3>
            <p className='font text-light-green italic text-sm mt-3'>Humber College Office of Sustainability</p>
          </div>

        </div>
        <div className='w-full md:w-1/2 bg-white flex items-center justify-center'>
          <div className='w-[75%]'>
            <h1 className='font text-3xl font-bold'>Welcome back!</h1>
            <p className='font text-sm text-gray-500 mt-2'>Sign in to the Office of Sustainability Portal</p>

            <div className='flex flex-col mt-5 gap-5'>
              <div>
                <label htmlFor="email" className='font'>Email</label>
                <input 
                  type="email" 
                  id='email' 
                  placeholder='Sustainability@humber.ca' 
                  className='border border-gray-300 rounded-md p-2 w-full' 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className='font'>Password</label>
                <input 
                  type="password" 
                  id='password' 
                  placeholder='••••••••' 
                  className='border border-gray-300 rounded-md p-2 w-full' 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && 
              <div className='text-red-700'>
                {error}
              </div>}

              <button className='bg-secondary-green text-white rounded-md p-2 mt-4 w-full cursor-pointer' onClick={handleLogin}>Sign In</button>
              <p>
                Forgot your password? <a href="#" className='text-primary-green hover:underline'>Reset it here</a>
              </p>
            </div>
          </div>
        </div>
    </div>
  )
}
