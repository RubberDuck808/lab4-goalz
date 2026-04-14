import { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [page, setPage] = useState('login');

  if (page === 'signup') {
    return (
      <SignUp
        onSignUp={() => setPage('login')}
        onNavigateToLogin={() => setPage('login')}
      />
    );
  }

  if (page === 'home') {
    return (
      <HomePage
        onNavigateHome={() => setPage('home')}
        onNavigateToProfile={() => setPage('profile')}
      />
    );
  }

  if (page === 'profile') {
    return (
      <ProfilePage
        onNavigateHome={() => setPage('home')}
        onNavigateToProfile={() => setPage('profile')}
      />
    );
  }

  return (
    <Login
      onLogin={() => setPage('home')}
      onNavigateToSignUp={() => setPage('signup')}
    />
  );
}

export default App;
