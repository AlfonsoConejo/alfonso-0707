import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Wallet } from 'lucide-react'
import BetsDonutChart from '../components/BetsDonutChart';
import SnailWinsChart from '../components/SnailWinsCharts';
import {raceHistory} from '../data/Races'
import type { Race } from '../types/racesRecord'
import { snailNames, type SnailName } from '../data/Snails';
import RechargeModal from '../components/RechargeModal'

export default function Dashboard() {
  const { user } = useAuth()
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false)
  const balance = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(user?.balance ?? 0)

  // Calculate won and lost races based on the raceHistory data
  const { wonRaces, lostRaces } = raceHistory.reduce((accumulator: { wonRaces: number; lostRaces: number }, item: Race ) => {
    if (item.bet && item.bet.snail === item.winner) {
      accumulator.wonRaces++;
    } 
    if (item.bet && item.bet.snail !== item.winner) {
      accumulator.lostRaces++;
    }
    return accumulator;
  }, { wonRaces: 0, lostRaces: 0 });

  // Get races from 2026-09-28
  const racesOnSpecificDate = raceHistory.filter((race) => {
    const raceDate = new Date(race.date);

    return raceDate.toISOString().startsWith('2026-09-28');
  });

  // Initialize every snail with 0 wins
  const snailWinsOnSpecificDate = Object.fromEntries(
    snailNames.map((snail) => [snail, 0])
  ) as Record<SnailName, number>;

  // Count wins
  racesOnSpecificDate.forEach((race) => {
    snailWinsOnSpecificDate[race.winner]++;
  });

  console.log('Snail Wins on 2026-09-28:', snailWinsOnSpecificDate);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Mi Tablero</h1>
          <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-700">
            <Wallet aria-hidden="true" className="h-4 w-4" />
            <span>{balance}</span>
            <button
              type="button"
              onClick={() => setIsRechargeModalOpen(true)}
              className="rounded-full bg-[#7BAE8A] px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-[#628F70]"
            >
              Recargar
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <BetsDonutChart wonRaces={wonRaces} lostRaces={lostRaces} />
          <SnailWinsChart snailWinsOnSpecificDate={snailWinsOnSpecificDate} />
        </div>
        <RechargeModal
          isOpen={isRechargeModalOpen}
          onClose={() => setIsRechargeModalOpen(false)}
        />
    </main>
  )
}
