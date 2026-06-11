import { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import { authService } from './services/authService'

const Overview = lazy(() => import('./pages/Overview'))

function ProtectedRoute({ children }) {
  return authService.getToken() ? children : <Navigate to='/' replace />;
}

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/overview' element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading…</div>}>
              <Overview />
            </Suspense>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default App
