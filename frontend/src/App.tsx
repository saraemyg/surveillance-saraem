import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/Layout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import VideoProcessingPage from '@/pages/VideoProcessingPage'
import SearchPage from '@/pages/SearchPage'
import PerformancePage from '@/pages/PerformancePage'
import SettingsPage from '@/pages/SettingsPage'

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
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="videos" element={<VideoProcessingPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
