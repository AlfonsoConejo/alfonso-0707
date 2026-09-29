import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
const COLORS = ['#22c55e', '#ef4444'];

type BetsDonutChartProps = {
  wonRaces: number;
  lostRaces: number;
};

export default function BetsDonutChart({ wonRaces, lostRaces }: BetsDonutChartProps) {
  // Update the data based on the props
  const data = [
    { name: 'Ganadas', value: wonRaces },
    { name: 'Perdidas', value: lostRaces },
  ];

  return (
    <section className="w-full">
      <h2 className="mb-4 text-xl font-bold text-zinc-900">Resultados de tus apuestas</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
