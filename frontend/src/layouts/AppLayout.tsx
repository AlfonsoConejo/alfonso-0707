import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Header />
      <Outlet />
    </div>
  )
}
