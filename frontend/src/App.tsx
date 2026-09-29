import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import SignupForm from './pages/SignupForm'
import LoginForm from './pages/LoginForm'
import Dashboard from './pages/Dashboard'
import { useAuth } from './context/AuthContext'
import './App.css'

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />
}

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Outlet />
}

function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<LoginForm />} />

          <Route path="/auth">
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<LoginForm />} />
            <Route path="signup" element={<SignupForm />} />
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Route>
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route path="/app">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
