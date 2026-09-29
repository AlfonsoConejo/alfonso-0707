import { snailNames, type SnailName } from '../data/Snails';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SnailWinsData {
  snail: SnailName;
  wins: number;
}

export default function SnailWinsChart({
  snailWinsOnSpecificDate,
}: {
  snailWinsOnSpecificDate: Record<SnailName, number>
}) {
  const data: SnailWinsData[] = snailNames.map((snail) => ({
    snail,
    wins: snailWinsOnSpecificDate[snail],
  }));

  return (
    <section className="w-full">
      <h2 className="mb-4 text-xl font-bold text-zinc-900">Victorias por caracol</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="snail" />
            <YAxis allowDecimals={false} />
            <Tooltip />

            <Bar dataKey="wins" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
