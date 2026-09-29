import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext'
import snailLogoWhite from '../assets/snail-logo-white.png'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  function handleLogout() {
    logout()
    navigate('/auth/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 bg-[#7BAE8A] px-5 py-4 text-white shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={snailLogoWhite}
            alt=""
            className="h-9 w-10 object-contain"
          />
          <p className="text-xl font-bold">Snail Races</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium sm:text-base">Hola, {user?.fullName ?? 'corredor'}</p>

          <div ref={userMenuRef} className="relative">
            <div
              className={[
                'h-8 w-8 rounded-md border text-white transition-colors',
                isMenuOpen
                  ? 'border-white bg-white/15'
                  : 'border-transparent hover:bg-white/15',
              ].join(' ')}
            >
              <button
                type="button"
                aria-label="Abrir menú de usuario"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
                className="grid h-full w-full place-items-center rounded-[inherit] focus:outline-none focus:ring-2 focus:ring-white/70"
              >
                <User aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>

            {isMenuOpen && (
              <div className="absolute right-0 top-12 z-10 w-64 rounded-lg bg-white p-2 text-zinc-900 shadow-lg shadow-black/15">
                <div className="border-b border-zinc-200 px-3 py-2">
                  <p className="text-xs font-medium text-zinc-500">Sesión activa</p>
                  <p className="mt-1 truncate text-sm font-semibold">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
