
import { Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Overview from './pages/Overview'
import { authService } from './services/authService'

function ProtectedRoute({ children }) {
  return authService.getToken() ? children : <Navigate to='/' replace />;
}

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/overview' element={<ProtectedRoute><Overview /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App
