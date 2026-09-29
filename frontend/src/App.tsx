import { Navigate, Route, Routes } from 'react-router-dom'
import SignupForm from './pages/SignupForm'
import LoginForm from './pages/LoginForm'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/auth">
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<LoginForm />} />
          <Route path="signup" element={<SignupForm />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
