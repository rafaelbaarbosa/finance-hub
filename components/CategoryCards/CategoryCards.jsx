import {
  UtensilsCrossed,
  Car,
  Film,
  HeartPulse,
  ShoppingBag,
  BookOpen,
  Receipt,
  Plane,
  MoreHorizontal,
} from "lucide-react";

const CATEGORY_META = {
  Alimentação: { icon: UtensilsCrossed, color: "#b3552e" },
  Transporte: { icon: Car, color: "#243b53" },
  Entretenimento: { icon: Film, color: "#6b3e6b" },
  Saúde: { icon: HeartPulse, color: "#4a6b3a" },
  Compras: { icon: ShoppingBag, color: "#a06b6b" },
  Educação: { icon: BookOpen, color: "#3e6b6b" },
  Serviços: { icon: Receipt, color: "#9b6f2e" },
  Viagem: { icon: Plane, color: "#3a6b8a" },
  Outros: { icon: MoreHorizontal, color: "#5a5a5a" },
};

const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function CategoryCards({ categories = [] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((cat, i) => {
        const meta = CATEGORY_META[cat.name] || CATEGORY_META["Outros"];
        const Icon = meta.icon;
        const isTop = i === 0;

        return (
          <div
            key={cat.name}
            className={`relative rounded-sm border border-foreground/10 p-5 flex flex-col gap-4 overflow-hidden min-h-[180px] ${
              isTop ? "bg-accent" : "bg-card"
            }`}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ backgroundColor: meta.color }}
            />

            <Icon
              className="w-5 h-5"
              style={{ color: isTop ? "var(--foreground)" : meta.color }}
              strokeWidth={1.5}
            />

            <p
              className={`text-[11px] uppercase tracking-[0.18em] font-medium ${
                isTop ? "text-foreground/70" : "text-muted-foreground"
              }`}
            >
              {cat.name}
            </p>

            <p className="font-serif text-3xl leading-none tracking-tight tabular-nums">
              {formatter.format(cat.total)}
            </p>

            <div
              className={`flex justify-between text-[11px] tabular-nums mt-auto ${
                isTop ? "text-foreground/70" : "text-muted-foreground"
              }`}
            >
              <span>{cat.percentage.toFixed(1)}%</span>
              <span>
                {cat.count} {cat.count === 1 ? "transação" : "transações"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
