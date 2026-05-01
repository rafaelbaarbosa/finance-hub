"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CATEGORY_COLORS = {
  Alimentação: "#b3552e",
  Transporte: "#243b53",
  Entretenimento: "#6b3e6b",
  Saúde: "#4a6b3a",
  Compras: "#a06b6b",
  Educação: "#3e6b6b",
  Serviços: "#9b6f2e",
  Viagem: "#3a6b8a",
  Outros: "#5a5a5a",
};

const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function TransactionTable({ transactions = [] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = ["all", ...new Set(transactions.map((t) => t.category))];

  const filtered = transactions.filter((t) => {
    const matchSearch = t.description
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchCat =
      categoryFilter === "all" || t.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <section className="space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="font-serif text-3xl tracking-tight">Transações</h2>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
          {filtered.length} {filtered.length === 1 ? "registro" : "registros"}
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center text-sm gap-y-2">
          {categories.map((cat, i) => (
            <span key={cat} className="flex items-center">
              {i > 0 && (
                <span className="text-foreground/25 mx-3 select-none">·</span>
              )}
              <button
                onClick={() => setCategoryFilter(cat)}
                className={`transition-colors ${
                  categoryFilter === cat
                    ? "text-foreground font-medium underline underline-offset-4 decoration-1"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "all" ? "Todas" : cat}
              </button>
            </span>
          ))}
        </div>

        <div className="relative md:w-64 shrink-0">
          <Search
            className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="Buscar descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-foreground/20 pl-7 pr-2 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-foreground/20 hover:bg-transparent">
            <TableHead className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Data
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Descrição
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Categoria
            </TableHead>
            <TableHead className="text-right text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              Valor
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((t, i) => (
            <TableRow
              key={i}
              className="border-b border-foreground/10 hover:bg-secondary/40 transition-colors"
            >
              <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap py-4">
                {t.date}
              </TableCell>
              <TableCell className="py-4 font-medium">
                {t.description}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[t.category] ||
                        CATEGORY_COLORS["Outros"],
                    }}
                  />
                  <span className="text-sm">{t.category}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums whitespace-nowrap py-4">
                {formatter.format(t.amount)}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground py-12 italic font-serif"
              >
                Nenhuma transação encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}
