'use client';

import { useState, useEffect } from 'react';
import apiKeyManager from '@/services/apiKeyManager';
import { Button } from '../ui/button';
import ClientOnly from '../ClientOnly';
import { Skeleton } from '../ui/skeleton';

type ApiStatusState = ReturnType<typeof apiKeyManager.getStatus>;

function ApiKeyCard({
  index,
  isActive,
  usage,
  limit,
}: {
  index: number;
  isActive: boolean;
  usage: number;
  limit: number;
}) {
  const usagePercent = limit > 0 ? (usage / limit) * 100 : 0;
  const isExhausted = usage >= limit;

  const getStatusColor = () => {
    if (isExhausted) return 'bg-destructive';
    if (usagePercent > 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${
        isActive ? 'border-primary ring-2 ring-primary' : 'bg-card'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          API Key {index + 1}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isExhausted
              ? 'bg-destructive/20 text-destructive'
              : 'bg-green-500/20 text-green-400'
          }`}
        >
          {isExhausted ? '🔴 Habis' : '🟢 Aktif'}
        </span>
      </div>

      <div className="mb-2 flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">
          {usage.toLocaleString()} / {limit.toLocaleString()}
        </span>
        <span className="font-semibold text-foreground">
          {Math.round(usagePercent)}%
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${getStatusColor()}`}
          style={{ width: `${usagePercent}%` }}
        ></div>
      </div>

      {isActive && !isExhausted && (
         <div className="mt-3 text-center text-xs text-green-400">
          Sedang Digunakan
        </div>
      )}
       {usagePercent > 80 && !isExhausted && (
        <div className="mt-3 text-center text-xs text-orange-500">
           ⚠️ Kuota hampir habis
        </div>
       )}
    </div>
  );
}

function ApiStatusContent() {
  const [status, setStatus] = useState<ApiStatusState>({
    currentKey: 1,
    totalKeys: 0,
    usedCounts: {},
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = () => {
    setStatus(apiKeyManager.getStatus());
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // refresh periodically
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStatus();
    setTimeout(() => setIsRefreshing(false), 500);
  };
  
  const handleReset = () => {
    if (confirm('Anda yakin ingin mereset semua hitungan penggunaan kunci API? Tindakan ini tidak bisa dibatalkan.')) {
      apiKeyManager.resetAllCounts();
      fetchStatus();
    }
  };

  if (status.totalKeys === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground bg-card rounded-lg border-2 border-destructive">
        <h4 className="font-semibold">🔑 Tidak Ada Kunci API</h4>
        <p className="mt-2 text-sm">
          Tidak ada API Key YouTube yang valid ditemukan di file .env.
        </p>
        <p className="text-xs mt-1">
          Mohon tambahkan dengan prefix NEXT_PUBLIC_YOUTUBE_API_KEY_...
        </p>
      </div>
    );
  }

  const totalUsage = Object.values(status.usedCounts).reduce(
    (a, b) => a + b,
    0
  );
  const totalLimit = status.totalKeys * 9000;
  const totalUsagePercent =
    totalLimit > 0 ? (totalUsage / totalLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <h3 className="mb-1 text-lg font-medium">Ringkasan Kuota</h3>
        <p className="text-sm text-muted-foreground mb-4">Total penggunaan kuota dari semua kunci API.</p>
        <div className="flex justify-between text-sm mb-1">
          <span>Total Penggunaan</span>
          <span>
            {totalUsage.toLocaleString()} / {totalLimit.toLocaleString()}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              totalUsagePercent > 80 ? 'bg-destructive' : totalUsagePercent > 50 ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${totalUsagePercent}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: status.totalKeys }).map((_, index) => (
          <ApiKeyCard
            key={index}
            index={index}
            isActive={status.currentKey - 1 === index}
            usage={status.usedCounts[index] || 0}
            limit={9000} // Approximate daily limit
          />
        ))}
      </div>

       <div className="flex flex-col sm:flex-row gap-2 justify-center pt-4">
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? 'Menyegarkan...' : '🔄 Segarkan Status'}
        </Button>
         <Button onClick={handleReset} variant="destructive">
          Reset Semua Kuota
        </Button>
      </div>
    </div>
  );
}

export default function ApiStatus() {
  return (
    <ClientOnly
      fallback={
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      }
    >
      <ApiStatusContent />
    </ClientOnly>
  );
}
