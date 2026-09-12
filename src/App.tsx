import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { AppProvider } from './hooks/useAppState'
import { ToastProvider } from './hooks/useToast'
import Layout from './components/Layout'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import IndustryProfile from './pages/IndustryProfile'
import ProcessData from './pages/ProcessData'
import Hotspots from './pages/Hotspots'
import Recommendations from './pages/Recommendations'
import Simulator from './pages/Simulator'
import Optimizer from './pages/Optimizer'
import ActionPlan from './pages/ActionPlan'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--color-bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-loop)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/industry-profile" element={<ProtectedRoute><IndustryProfile /></ProtectedRoute>} />
      <Route path="/process-data" element={<ProtectedRoute><ProcessData /></ProtectedRoute>} />
      <Route path="/hotspots" element={<ProtectedRoute><Hotspots /></ProtectedRoute>} />
      <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
      <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
      <Route path="/optimizer" element={<ProtectedRoute><Optimizer /></ProtectedRoute>} />
      <Route path="/action-plan" element={<ProtectedRoute><ActionPlan /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
