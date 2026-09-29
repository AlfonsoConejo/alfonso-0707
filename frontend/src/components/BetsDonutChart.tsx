import {
  PieChart,
  Pie,
  Cell,
  Label,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
const COLORS = ['#7BAE8A', '#E98272'];

type BetsDonutChartProps = {
  wonRaces: number;
  lostRaces: number;
};

export default function BetsDonutChart({ wonRaces, lostRaces }: BetsDonutChartProps) {
  const data = [
    { name: 'Ganadas', value: wonRaces },
    { name: 'Perdidas', value: lostRaces },
  ];
  const totalRaces = wonRaces + lostRaces;
  const winRate = totalRaces === 0 ? 0 : Math.round((wonRaces / totalRaces) * 100);

  return (
    <section className="w-full rounded-2xl border border-[#7BAE8A]/30 bg-white p-5 shadow-[0_0_18px_rgba(123,174,138,0.18)]">
      <h2 className="text-xl font-bold text-zinc-900">Resultados de todas tus apuestas</h2>
      <p className="mt-1 text-sm text-zinc-500">Resumen de todas tus carreras ganadas y perdidas</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
              <Label
                value={String(winRate) + '%'}
                position="center"
                className="fill-zinc-900 text-2xl font-bold"
                dy={-10}
              />
              <Label
                value="Ganadas"
                position="center"
                className="fill-zinc-500 text-xs font-medium"
                dy={14}
              />
            </Pie>

            <Tooltip
              formatter={(value) => [String(value) + ' carreras', 'Resultado']}
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid #d4e5d9',
                boxShadow: '0 8px 20px rgb(0 0 0 / 0.08)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-5 text-sm font-medium text-zinc-600">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#7BAE8A]" />
          Ganadas ({wonRaces})
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E98272]" />
          Perdidas ({lostRaces})
        </span>
      </div>
    </section>
  );
}
