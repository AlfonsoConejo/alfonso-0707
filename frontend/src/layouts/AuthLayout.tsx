import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <main className="min-h-screen bg-white px-5 py-14 sm:py-18">
      <Outlet />
    </main>
  )
}
