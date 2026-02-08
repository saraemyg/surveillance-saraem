import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/Layout'
import LoginPage from '@/pages/LoginPage'
// Admin Pages
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import PerformanceMetricsDashboard from '@/pages/processing/PerformanceMetricsDashboard'
// Security Pages
import SecurityDashboardPage from '@/pages/SecurityDashboardPage'
import SecurityFeed from '@/pages/SecurityFeed'
import { AlertDashboard } from '@/pages/AlertDashboard'
import VideoArchivePage from '@/pages/VideoArchivePage'

// Role-based redirect component
function RoleBasedRedirect() {
  const { user } = useAuth()

  if (user?.role === 'admin') {
    return <Navigate to="/performance-metrics" replace />
  }
  return <Navigate to="/security-feed" replace />
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
            {/* Admin Routes (4 pages) */}
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="performance-metrics" element={<PerformanceMetricsDashboard />} />
            {/* <Route path="video-processing" element={<AdminVideoProcessingPage />} /> */}
            {/* <Route path="performance" element={<PerformancePage />} /> */}
            {/* Security Routes (3 pages) */}
            <Route path="security-dashboard" element={<SecurityDashboardPage />} />
            <Route path="security-feed" element={<SecurityFeed />} />
            <Route path="alert-dashboard" element={<AlertDashboard />} />
            <Route path="video-archive" element={<VideoArchivePage />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
