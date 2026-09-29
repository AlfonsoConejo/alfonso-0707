import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { getRegisteredUsers, hashPassword } from '../../utils'
import { useNavigate } from 'react-router-dom'
import type { LoginFormData } from '../types/auth'
import { useAuth } from '../context/AuthContext'

export default function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [userData, setUserData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const hasEmptyFields = Object.values(userData).some((field) => !field.trim())

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const field = event.target.name as keyof LoginFormData

    setUserData((currentData) => ({
      ...currentData,
      [field]: event.target.value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedEmail = userData.email.trim().toLowerCase()
    const passwordHash = await hashPassword(userData.password)
    const registeredUsers = getRegisteredUsers()
    const registeredUser = registeredUsers.find(
      (registeredUser) =>
        registeredUser.email.toLowerCase() === normalizedEmail &&
        registeredUser.passwordHash === passwordHash,
    )

    if (!registeredUser) {
      setError('Usuario o contraseñas incorrectos')
      return
    }

    setError('')
    login(registeredUser)
    navigate('/app/dashboard')
  }

  return (
    <main className="min-h-screen bg-white px-5 py-14 text-zinc-900 sm:py-18">
      <section className="mx-auto w-full max-w-md" aria-labelledby="login-title">
        <header className="mb-9 text-center">
          <h1 id="login-title" className="text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            Inicia sesión
          </h1>
          <p className="mt-2 text-base sm:text-lg">
            ¿Aún no tienes una cuenta?{' '}
            <a href="/auth/signup" className="text-[#7BAE8A] underline-offset-4 hover:underline">
              Regístrate
            </a>
          </p>
        </header>

        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email" className="grid gap-2 text-sm font-bold">
            Correo electrónico
            <input
              id="email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              className="h-11 rounded-sm border-2 border-[#7BAE8A] bg-white px-3 text-base font-normal outline-none focus:ring-2 focus:ring-[#7BAE8A]/25"
            />
          </label>

          <label htmlFor="password" className="grid gap-2 text-sm font-bold">
            Contraseña
            <input
              id="password"
              name="password"
              type="password"
              value={userData.password}
              onChange={handleChange}
              className="h-11 rounded-sm border border-zinc-400 bg-white px-3 text-base font-normal outline-none focus:border-[#7BAE8A] focus:ring-2 focus:ring-[#7BAE8A]/25"
            />
          </label>

          {error && (
            <p className="rounded-sm bg-red-100 px-3 py-2 text-sm font-medium text-red-800" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={hasEmptyFields}
            className="mt-1 h-11 rounded-sm bg-[#7BAE8A] px-4 text-base font-bold text-white transition-colors hover:bg-[#628F70] focus:outline-none focus:ring-3 focus:ring-[#7BAE8A]/30 disabled:cursor-not-allowed disabled:bg-[#7BAE8A]/50 disabled:text-white disabled:hover:bg-[#7BAE8A]/50"
          >
            Iniciar sesión
          </button>
        </form>
      </section>
    </main>
  )
}
