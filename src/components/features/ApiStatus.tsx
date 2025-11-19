'use client';

import { useState, useEffect } from 'react';
import apiKeyManager from '@/services/apiKeyManager';
import { Button } from '../ui/button';
import ClientOnly from '../ClientOnly';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

type ApiStatusState = ReturnType<typeof apiKeyManager.getStatus>;

function ApiKeyCard({
  index,
  isActive,
  used,
  limit,
  status,
  nextResetHours,
  percentage,
}: {
  index: number;
  isActive: boolean;
  used: number;
  limit: number;
  status: 'active' | 'exhausted';
  nextResetHours: number;
  percentage: number;
}) {
  const isExhausted = status === 'exhausted';

  const getStatusColor = () => {
    if (isExhausted) return 'bg-destructive';
    if (percentage > 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div
      className={`rounded-lg border bg-card p-4 text-card-foreground shadow-sm ${
        isActive ? 'border-primary ring-2 ring-primary' : ''
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          API Key {index + 1}
        </span>
        <Badge
          variant={isExhausted ? 'destructive' : 'default'}
          className={
            isExhausted
              ? 'bg-destructive/20 text-destructive'
              : 'bg-green-500/20 text-green-400'
          }
        >
          {isExhausted ? (
            <AlertCircle className="mr-1 h-3 w-3" />
          ) : (
            <CheckCircle className="mr-1 h-3 w-3" />
          )}
          {isExhausted ? 'Habis' : 'Aktif'}
        </Badge>
      </div>

      <div className="mb-2 flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
        <span className="font-semibold text-foreground">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${getStatusColor()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        {isActive && !isExhausted && (
          <span className="font-medium text-green-400">Sedang Digunakan</span>
        )}
        {percentage > 80 && !isExhausted && (
          <span className="font-medium text-orange-500">
            ⚠️ Kuota hampir habis
          </span>
        )}
        <span className="flex-grow text-right">
          Reset dalam ~{nextResetHours} jam
        </span>
      </div>
    </div>
  );
}

function ApiStatusContent() {
  const [status, setStatus] = useState<ApiStatusState | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = () => {
    setStatus(apiKeyManager.getStatus());
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStatus();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleReset = () => {
    if (
      confirm(
        'Anda yakin ingin mereset semua hitungan penggunaan kunci API? Tindakan ini tidak bisa dibatalkan.'
      )
    ) {
      apiKeyManager.resetAllCounts();
      fetchStatus();
    }
  };
  
  if (!status) {
     return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      );
  }


  if (status.totalKeys === 0) {
    return (
      <div className="rounded-lg border-2 border-destructive bg-card p-4 text-center text-muted-foreground">
        <h4 className="font-semibold">🔑 Tidak Ada Kunci API</h4>
        <p className="mt-2 text-sm">
          Tidak ada API Key YouTube yang valid ditemukan di file .env.
        </p>
        <p className="mt-1 text-xs">
          Mohon tambahkan dengan prefix NEXT_PUBLIC_YOUTUBE_API_KEY_...
        </p>
      </div>
    );
  }

  const totalUsagePercent =
    status.totalLimit > 0 ? (status.totalUsed / status.totalLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <h3 className="mb-1 text-lg font-medium">Ringkasan Kuota</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Total penggunaan kuota dari semua kunci API.
        </p>
        <div className="mb-1 flex justify-between text-sm">
          <span>Total Penggunaan</span>
          <span>
            {status.totalUsed.toLocaleString()} /{' '}
            {status.totalLimit.toLocaleString()}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              totalUsagePercent > 80
                ? 'bg-destructive'
                : totalUsagePercent > 50
                ? 'bg-orange-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${totalUsagePercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {status.keys.map((key) => (
          <ApiKeyCard key={key.index} {...key} />
        ))}
      </div>

      <div className="flex flex-col gap-2 justify-center pt-4 sm:flex-row">
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          {isRefreshing ? 'Menyegarkan...' : 'Segarkan Status'}
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
