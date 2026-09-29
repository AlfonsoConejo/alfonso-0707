import { useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from '../types/auth'
import { getRegisteredUsers } from '../../utils'
import { AuthContext } from '../hooks/useAuth'

const SESSION_KEY = 'currentUser'

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

  function addBalance(amount: number) {
    if (!user || !Number.isFinite(amount) || amount <= 0) {
      return
    }

    const updatedUser: AuthUser = {
      ...user,
      balance: user.balance + amount,
    }

    const updatedRegisteredUsers = getRegisteredUsers().map((registeredUser) =>
      registeredUser.id === user.id
        ? { ...registeredUser, balance: updatedUser.balance }
        : registeredUser,
    )

    setUser(updatedUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser))
    localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, addBalance, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
