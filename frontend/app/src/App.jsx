import { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import RouteModePage from './pages/RouteModePage';
import PartyModePage from './pages/PartyModePage';
import CreatePartyPage from './pages/CreatePartyPage';
import PartyLobbyPage from './pages/PartyLobbyPage';
import PartyOwnerPage from './pages/PartyOwnerPage';
import YourRolePage from './pages/YourRolePage';

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
        onStartRoute={() => setPage('routeMode')}
      />
    );
  }

  if (page === 'routeMode') {
    return <RouteModePage onBack={() => setPage('home')} onSingle={() => setPage('yourRole')} onParty={() => setPage('partyMode')} />;
  }

  if (page === 'yourRole') {
    return <YourRolePage onBack={() => setPage('routeMode')} singlePlayer />;
  }

  if (page === 'partyMode') {
    return (
      <PartyModePage
        onBack={() => setPage('routeMode')}
        onJoinParty={() => setPage('partyLobby')}
        onCreateParty={() => setPage('createParty')}
      />
    );
  }

  if (page === 'partyLobby') {
    return <PartyLobbyPage onBack={() => setPage('partyMode')} onLeave={() => setPage('partyMode')} />;
  }

  if (page === 'createParty') {
    return <CreatePartyPage onBack={() => setPage('partyMode')} onCreate={() => setPage('partyOwner')} />;
  }

  if (page === 'partyOwner') {
    return (
      <PartyOwnerPage
        onBack={() => setPage('createParty')}
        onStart={() => setPage('yourRole')}
        onEnd={() => setPage('partyMode')}
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
