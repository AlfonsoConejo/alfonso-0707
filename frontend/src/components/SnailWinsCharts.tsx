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
    <section className="w-full rounded-2xl border border-[#7BAE8A]/30 bg-white p-5 shadow-[0_0_18px_rgba(123,174,138,0.18)]">
      <h2 className="text-xl font-bold text-zinc-900">Victorias por caracol</h2>
      <p className="mt-1 text-sm text-zinc-500">Carreras ganadas el 28 de septiembre de 2026</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 40 }}>
            <XAxis
              dataKey="snail"
              angle={-20}
              textAnchor="end"
              interval={0}
              height={60}
              tick={{ fill: '#52525b', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#d4d4d8' }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#52525b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [String(value), 'Victorias']}
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid #d4e5d9',
                boxShadow: '0 8px 20px rgb(0 0 0 / 0.08)',
              }}
            />

            <Bar dataKey="wins" fill="#7BAE8A" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
