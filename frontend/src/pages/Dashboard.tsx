import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <h1 className="text-3xl font-bold">Bienvenido, {user?.fullName}</h1>
      </main>
    </div>
  )
}
