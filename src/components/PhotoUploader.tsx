"use client";

import { useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { saveFoodLog } from "@/lib/food-log";
import type { FoodAnalysis } from "@/lib/types";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoUploader() {
  const { user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysis | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setSaved(false);
    const dataUrl = await fileToDataUrl(file);
    setPreview(dataUrl);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menganalisis foto");
      setResult(data as FoodAnalysis);
      if (user) {
        await saveFoodLog(user.id, dataUrl, data as FoodAnalysis);
        setSaved(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary transition-colors p-8 flex flex-col items-center gap-3 text-center"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview makanan"
            className="max-h-64 rounded-xl object-cover"
          />
        ) : (
          <>
            <span className="text-4xl">📸</span>
            <span className="font-medium">Ambil / upload foto makanan</span>
            <span className="text-sm text-muted-foreground">
              Tap di sini untuk buka kamera atau pilih dari galeri
            </span>
          </>
        )}
      </button>

      {loading && (
        <div className="text-center text-sm text-muted-foreground animate-pulse">
          Menganalisis foto...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{result.summary}</p>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              {Math.round(result.totalCalories)}
            </span>
            <span className="text-muted-foreground">kkal</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-muted p-2">
              <div className="font-semibold">{Math.round(result.protein)}g</div>
              <div className="text-muted-foreground text-xs">Protein</div>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <div className="font-semibold">{Math.round(result.carbs)}g</div>
              <div className="text-muted-foreground text-xs">Karbo</div>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <div className="font-semibold">{Math.round(result.fat)}g</div>
              <div className="text-muted-foreground text-xs">Lemak</div>
            </div>
          </div>

          <ul className="flex flex-col gap-1 text-sm">
            {result.items.map((item, i) => (
              <li key={i} className="flex justify-between border-b border-border py-1 last:border-0">
                <span>{item.name} <span className="text-muted-foreground">({item.estimatedGrams}g)</span></span>
                <span className="font-medium">{Math.round(item.calories)} kkal</span>
              </li>
            ))}
          </ul>

          {result.confidence === "low" && (
            <p className="text-xs text-accent">
              ⚠️ Estimasi kurang yakin — pastikan foto jelas dan cukup cahaya.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            {saved ? "✅ Tersimpan ke riwayat" : "Tidak tersimpan (login untuk menyimpan riwayat)"}
          </p>
        </div>
      )}
    </div>
  );
}
