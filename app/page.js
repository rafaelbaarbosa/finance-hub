import UploadArea from "@/components/UploadArea";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-10">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Automated Finance
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight">
            Comece pelos<br />números.
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Faça upload do extrato do seu cartão de crédito em PDF e veja seus
            gastos organizados por categoria.
          </p>
        </div>
        <UploadArea />
      </div>
    </main>
  );
}
