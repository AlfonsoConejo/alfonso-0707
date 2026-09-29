import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from '../types/auth'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (user: AuthUser) => void
  logout: () => void
}

const SESSION_KEY = 'currentUser'
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getStoredUser(): AuthUser | null {
  try {
    const storedUser = localStorage.getItem(SESSION_KEY)

    return storedUser ? (JSON.parse(storedUser) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)

  function login(authUser: AuthUser) {
    setUser(authUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.')
  }

  return context
}
