"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const GREENS = [
  "oklch(0.345 0.085 165)",
  "oklch(0.40 0.08 165)",
  "oklch(0.46 0.07 165)",
  "oklch(0.52 0.06 165)",
  "oklch(0.58 0.05 165)",
  "oklch(0.64 0.04 165)",
  "oklch(0.70 0.03 165)",
  "oklch(0.76 0.02 165)",
];

const ACCENT = "oklch(0.78 0.14 75)";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card border border-foreground/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">
        {data.name}
      </p>
      <p className="text-sm font-medium tabular-nums">
        {formatter.format(data.total)}
      </p>
    </div>
  );
}

export default function ExpenseChart({ categories = [] }) {
  return (
    <section className="space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="font-serif text-3xl tracking-tight">Onde foi parar</h2>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Ranking do mês
        </p>
      </div>

      <ResponsiveContainer
        width="100%"
        height={Math.max(280, categories.length * 56)}
      >
        <BarChart
          data={categories}
          layout="vertical"
          margin={{ top: 8, right: 100, left: 0, bottom: 8 }}
          barCategoryGap="22%"
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={(props) => {
              const { y, payload } = props;
              return (
                <text
                  x={0}
                  y={y}
                  textAnchor="start"
                  dominantBaseline="middle"
                  fontSize={12}
                  fill="var(--foreground)"
                >
                  {payload.value}
                </text>
              );
            }}
            width={120}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "var(--secondary)", opacity: 0.5 }}
          />
          <Bar dataKey="total" radius={[0, 2, 2, 0]}>
            {categories.map((_, i) => (
              <Cell
                key={i}
                fill={
                  i === 0
                    ? ACCENT
                    : GREENS[Math.min(i - 1, GREENS.length - 1)]
                }
              />
            ))}
            <LabelList
              dataKey="total"
              position="right"
              formatter={(value) => formatter.format(value)}
              style={{
                fontSize: 12,
                fill: "var(--muted-foreground)",
                fontVariantNumeric: "tabular-nums",
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
