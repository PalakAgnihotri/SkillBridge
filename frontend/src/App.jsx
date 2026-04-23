import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import Sessions from './pages/Sessions'
import Profile from './pages/Profile'
import VideoRoom from './pages/VideoRoom'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#7c6ff7] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-[#0a0a0f]">
            <Routes>
              <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/room/:roomId" element={<PrivateRoute><VideoRoom /></PrivateRoute>} />
              <Route path="/*" element={
                <PrivateRoute>
                  <Navbar />
                  <main className="pt-16">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/matches"   element={<Matches />} />
                      <Route path="/sessions"  element={<Sessions />} />
                      <Route path="/profile"   element={<Profile />} />
                      <Route path="*"          element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </main>
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
