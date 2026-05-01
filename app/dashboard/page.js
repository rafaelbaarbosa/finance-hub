"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CategoryCards from "@/components/CategoryCards";
import ExpenseChart from "@/components/ExpenseChart";
import TransactionTable from "@/components/TransactionTable";
import useAnalysisStore from "@/store/useAnalysisStore";

const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function DashboardPage() {
  const router = useRouter();
  const data = useAnalysisStore((state) => state.data);
  const clear = useAnalysisStore((state) => state.clear);

  useEffect(() => {
    if (!data) router.replace("/");
  }, [data, router]);

  if (!data) return null;

  const handleNewAnalysis = () => {
    clear();
    router.push("/");
  };

  const txCount = data.transactions.length;

  return (
    <main className="min-h-screen px-8 py-12 md:py-16">
      <div className="max-w-6xl mx-auto space-y-12 md:space-y-16">
        <header className="space-y-8 md:space-y-10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Edição <span className="mx-2">·</span> {data.period}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewAnalysis}
              className="rounded-none border-foreground/20 hover:bg-foreground hover:text-background transition-colors"
            >
              Nova análise
            </Button>
          </div>

          <div className="border-t border-foreground/15" />

          <div className="space-y-4">
            <p className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight tabular-nums -ml-0.5">
              {formatter.format(data.totalAmount)}
            </p>
            <p className="text-sm text-muted-foreground italic font-serif">
              em {txCount} {txCount === 1 ? "transação" : "transações"} no período.
            </p>
          </div>
        </header>

        <CategoryCards categories={data.categories} />
        <ExpenseChart categories={data.categories} />
        <TransactionTable transactions={data.transactions} />
      </div>
    </main>
  );
}
