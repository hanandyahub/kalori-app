"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getFoodLogs } from "@/lib/food-log";
import type { FoodLogEntry } from "@/lib/types";

export default function RiwayatPage() {
  const { user, isLoaded } = useUser();
  const [logs, setLogs] = useState<FoodLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getFoodLogs(user.id)
      .then(setLogs)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat riwayat"));
  }, [user]);

  if (isLoaded && !user) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <p className="text-muted-foreground">Login dulu untuk melihat riwayat.</p>
      </main>
    );
  }

  const totalToday = (logs ?? [])
    .filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, l) => sum + l.totalCalories, 0);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-12">
      <h1 className="text-2xl font-bold">Riwayat Kalori</h1>

      <div className="rounded-2xl bg-card border border-border px-6 py-4 text-center">
        <div className="text-sm text-muted-foreground">Total hari ini</div>
        <div className="text-2xl font-bold text-primary">{Math.round(totalToday)} kkal</div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!logs && !error && <p className="text-muted-foreground text-sm">Memuat...</p>}
      {logs && logs.length === 0 && (
        <p className="text-muted-foreground text-sm">Belum ada riwayat. Yuk foto makananmu di halaman utama.</p>
      )}

      <div className="w-full max-w-lg flex flex-col gap-3">
        {logs?.map((log) => (
          <div key={log.id} className="rounded-xl bg-card border border-border p-4 flex gap-3 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={log.imageDataUrl} alt={log.summary} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{log.summary}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(log.createdAt).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="font-semibold text-primary whitespace-nowrap">
              {Math.round(log.totalCalories)} kkal
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
