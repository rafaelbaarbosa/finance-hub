"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAnalysisStore from "@/store/useAnalysisStore";

export default function UploadArea() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const router = useRouter();
  const setData = useAnalysisStore((state) => state.setData);

  const handleFile = (f) => {
    if (f?.type === "application/pdf") {
      setFile(f);
      setError(null);
    } else {
      setError("Por favor, selecione um arquivo PDF.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao analisar o extrato.");
      }

      setData(data);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const bracketColor = isDragging
    ? "border-primary"
    : "border-foreground/25";

  return (
    <div className="space-y-4">
      <div
        onClick={() => !isLoading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative p-12 text-center transition-colors ${
          isLoading
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        } ${isDragging ? "bg-primary/5" : "hover:bg-secondary/40"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {/* Corner brackets */}
        <span className={`absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 transition-colors ${bracketColor}`} />
        <span className={`absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 transition-colors ${bracketColor}`} />
        <span className={`absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 transition-colors ${bracketColor}`} />
        <span className={`absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 transition-colors ${bracketColor}`} />

        {file ? (
          <div className="flex items-center gap-3 justify-center">
            <FileText
              className="w-5 h-5 text-muted-foreground shrink-0"
              strokeWidth={1.5}
            />
            <div className="text-left">
              <p className="font-mono text-sm truncate max-w-[260px]">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(file.size / 1024 / 1024).toFixed(2)} MB — clique para trocar
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload
              className="w-6 h-6 text-muted-foreground mx-auto"
              strokeWidth={1.5}
            />
            <div className="space-y-1">
              <p className="text-sm font-medium">Arraste o PDF aqui</p>
              <p className="text-xs text-muted-foreground">
                ou clique para selecionar
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!file || isLoading}
        className="w-full rounded-none"
      >
        {isLoading ? "Analisando extrato..." : "Analisar Extrato"}
      </Button>

      {isLoading && (
        <p className="text-xs text-muted-foreground text-center">
          Isso pode levar alguns segundos...
        </p>
      )}
    </div>
  );
}
