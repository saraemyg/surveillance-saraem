import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/Layout'
import LoginPage from '@/pages/LoginPage'
// Admin Pages
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import AdminVideoProcessingPage from '@/pages/AdminVideoProcessingPage'
// Security Pages
import SecurityDashboardPage from '@/pages/SecurityDashboardPage'
import LiveSurveillancePage from '@/pages/LiveSurveillancePage'
import VideoArchivePage from '@/pages/VideoArchivePage'

// Role-based redirect component
function RoleBasedRedirect() {
  const { user } = useAuth()

  if (user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  return <Navigate to="/security-dashboard" replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleBasedRedirect />} />
            {/* Admin Routes (2 pages) */}
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="video-processing" element={<AdminVideoProcessingPage />} />
            {/* Security Routes (3 pages) */}
            <Route path="security-dashboard" element={<SecurityDashboardPage />} />
            <Route path="live-surveillance" element={<LiveSurveillancePage />} />
            <Route path="video-archive" element={<VideoArchivePage />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
