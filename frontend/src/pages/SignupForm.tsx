import { useState } from 'react'

export default function SignupForm() {
  const [showRequiredMessage, setShowRequiredMessage] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const hasEmptyField = ['fullName', 'email', 'password', 'confirmPassword'].some(
      (field) => !formData.get(field)?.toString().trim(),
    )

    setShowRequiredMessage(hasEmptyField)
  }

  return (
    <main className="min-h-screen bg-white px-5 py-14 text-zinc-900 sm:py-18">
      <section className="mx-auto w-full max-w-md" aria-labelledby="signup-title">
        <header className="mb-9 text-center">
          <h1 id="signup-title" className="font-medium text-3xl leading-tight tracking-tight sm:text-4xl">
            Crea tu cuenta
          </h1>
          <p className="mt-2 text-base sm:text-lg">
            Regístrate gratis o{' '}
            <a href="/auth/login" className="text-[#7BAE8A] underline-offset-4 hover:underline">
              inicia sesión
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
              className="h-11 rounded-sm border-2 border-[#7BAE8A] bg-white px-3 text-base font-normal outline-none focus:ring-2 focus:ring-[#7BAE8A]/25"
            />
          </label>

          <label htmlFor="fullName" className="grid gap-2 text-sm font-bold">
            Nombre completo
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="h-11 rounded-sm border border-zinc-400 bg-white px-3 text-base font-normal outline-none focus:border-[#7BAE8A] focus:ring-2 focus:ring-[#7BAE8A]/25"
            />
          </label>

          <label htmlFor="password" className="grid gap-2 text-sm font-bold">
            Contraseña
            <input
              id="password"
              name="password"
              type="password"
              className="h-11 rounded-sm border border-zinc-400 bg-white px-3 text-base font-normal outline-none focus:border-[#7BAE8A] focus:ring-2 focus:ring-[#7BAE8A]/25"
            />
          </label>

          <label htmlFor="confirmPassword" className="grid gap-2 text-sm font-bold">
            Confirmar contraseña
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="h-11 rounded-sm border border-zinc-400 bg-white px-3 text-base font-normal outline-none focus:border-[#7BAE8A] focus:ring-2 focus:ring-[#7BAE8A]/25"
            />
          </label>

          {showRequiredMessage && (
            <p
              className="rounded-sm bg-red-100 px-3 py-2 text-sm font-medium text-red-800"
              role="alert"
            >
              Es obligatorio llenar todos los campos.
            </p>
          )}

          <button
            type="submit"
            className="mt-1 h-11 rounded-sm bg-[#7BAE8A] px-4 text-base font-bold text-white transition-colors hover:bg-[#628F70] focus:outline-none focus:ring-3 focus:ring-[#7BAE8A]/30 cursor-pointer"
          >
            Registrarme
          </button>
        </form>
      </section>
    </main>
  )
}
