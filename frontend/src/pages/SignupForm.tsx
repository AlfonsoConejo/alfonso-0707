import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { getRegisteredUsers, hashPassword } from '../../utils'
import { useNavigate } from 'react-router-dom'
import type { RegisteredUser, SignupFormData, SignupFormErrors } from '../types/auth'
import { useAuth } from '../context/AuthContext'
import snailLogo from '../assets/snail-logo.png'

export default function SignupForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [userData, setUserData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<SignupFormErrors>({})
  const hasEmptyFields = Object.values(userData).some((field) => !field.trim())

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const field = event.target.name as keyof SignupFormData

    setUserData((currentData) => ({
      ...currentData,
      [field]: event.target.value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors: SignupFormErrors = {}

    if (hasEmptyFields) {
      validationErrors.form = 'Es obligatorio llenar todos los campos.'
    } else {
      const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)
      const nameHasLetter = /\p{L}/u.test(userData.fullName)

      if (!emailIsValid) {
        validationErrors.email = 'Ingresa un correo electrónico válido.'
      }

      if (!nameHasLetter || userData.fullName.length > 60) {
        validationErrors.fullName =
          'El nombre debe incluir al menos una letra y tener un máximo de 60 caracteres.'
      }

      if (userData.password.length < 6) {
        validationErrors.password = 'La contraseña debe tener al menos 6 caracteres.'
      }

      if (userData.password !== userData.confirmPassword) {
        validationErrors.confirmPassword = 'Las contraseñas deben coincidir.'
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const normalizedEmail = userData.email.trim().toLowerCase()
    const registeredUsers = getRegisteredUsers()
    const emailAlreadyExists = registeredUsers.some(
      (registeredUser) => registeredUser.email.toLowerCase() === normalizedEmail,
    )

    if (emailAlreadyExists) {
      setErrors({ email: 'Este correo ya está registrado.' })
      return
    }

    const passwordHash = await hashPassword(userData.password)
    const registeredUser: RegisteredUser = {
      fullName: userData.fullName,
      email: normalizedEmail,
      passwordHash,
    }

    localStorage.setItem('registeredUsers', JSON.stringify([...registeredUsers, registeredUser]))
    setErrors({})
    login(registeredUser)
    navigate('/app/dashboard', { replace: true })
  }

  return (
    <main className="min-h-screen bg-white px-5 py-14 text-zinc-900 sm:py-18">
      <section className="mx-auto w-full max-w-md" aria-labelledby="signup-title">
        <header className="mb-6 text-center">
          <img
            src={snailLogo}
            alt="Logo de Snail Races"
            className="mx-auto mb-3 h-20 w-20 object-contain"
          />
        </header>

        <div className="rounded-2xl bg-white p-6 shadow-[0_0_5px_rgba(123,174,138,0.35)] sm:p-8">
          <div className="mb-9 text-center">
          <p className="mt-1 text-lg font-medium">Crea tu cuenta</p>
          <p className="mt-2 text-base sm:text-lg">
            Regístrate gratis o{' '}
            <a href="/auth/login" className="text-[#7BAE8A] underline-offset-4 hover:underline">
              inicia sesión
            </a>
          </p>
          </div>

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

          <label htmlFor="fullName" className="grid gap-2 text-sm font-bold">
            Nombre completo
            <input
              id="fullName"
              name="fullName"
              type="text"
              maxLength={60}
              value={userData.fullName}
              onChange={handleChange}
              className="h-11 rounded-sm border border-zinc-400 bg-white px-3 text-base font-normal outline-none focus:border-[#7BAE8A] focus:ring-2 focus:ring-[#7BAE8A]/25"
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

          <label htmlFor="confirmPassword" className="grid gap-2 text-sm font-bold">
            Confirmar contraseña
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={userData.confirmPassword}
              onChange={handleChange}
              className="h-11 rounded-sm border border-zinc-400 bg-white px-3 text-base font-normal outline-none focus:border-[#7BAE8A] focus:ring-2 focus:ring-[#7BAE8A]/25"
            />
          </label>

          {Object.values(errors).length > 0 && (
            <div
              className="rounded-sm bg-red-100 px-3 py-2 text-sm font-medium text-red-800"
              role="alert"
            >
              <ul className="list-inside list-disc space-y-1">
                {Object.values(errors).map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={hasEmptyFields}
            className="mt-1 h-11 rounded-sm bg-[#7BAE8A] px-4 text-base font-bold text-white transition-colors hover:bg-[#628F70] focus:outline-none focus:ring-3 focus:ring-[#7BAE8A]/30 disabled:cursor-not-allowed disabled:bg-[#7BAE8A]/50 disabled:text-white disabled:hover:bg-[#7BAE8A]/50"
          >
            Registrarme
          </button>
          </form>
        </div>
      </section>
    </main>
  )
}
