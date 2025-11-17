'use client';

import { useState, useEffect } from 'react';
import { getStatus } from '@/services/apiKeyManager';
import { Skeleton } from '@/components/ui/skeleton';

type ApiStatusState = {
  currentKeyIndex: number;
  totalKeys: number;
  activeKeys: number;
  requestCounts: Record<number, number>;
  failedKeys: number[];
  apiKeys: string[];
};

function ApiStatus() {
  const [status, setStatus] = useState<ApiStatusState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // The return value from getStatus is a JSON string
        const statusString = await getStatus();
        const currentStatus: ApiStatusState = JSON.parse(statusString);
        setStatus(currentStatus);
      } catch (error) {
        console.error('Failed to fetch API status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Update setiap 5 detik

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (!status || status.totalKeys === 0) {
    return (
      <div className="group-data-[collapsible=icon]:hidden p-2 text-xs text-center text-muted-foreground bg-muted rounded-md">
        Tidak ada API Key.
      </div>
    );
  }

  const getStatusColor = () => {
    const activeRatio = status.activeKeys / status.totalKeys;
    if (activeRatio >= 0.6) return 'border-green-500';
    if (activeRatio >= 0.3) return 'border-orange-500';
    return 'border-red-500';
  };

  return (
    <div
      className={`group-data-[collapsible=icon]:hidden p-2 bg-card border-2 rounded-lg ${getStatusColor()}`}
    >
      <h4 className="text-sm font-semibold mb-1">🔑 Status Kunci API</h4>
      <p className="text-xs text-muted-foreground">
        Aktif: {status.activeKeys}/{status.totalKeys} | Saat ini: Kunci{' '}
        {status.currentKeyIndex + 1}
      </p>
      <div className="flex gap-1.5 mt-2">
        {status.apiKeys?.map((_, index) => (
          <div
            key={index}
            className="h-3 w-3 rounded-full"
            style={{
              backgroundColor: status.failedKeys.includes(index)
                ? 'hsl(var(--destructive))'
                : status.currentKeyIndex === index
                ? 'hsl(var(--primary))'
                : 'hsl(var(--muted))',
            }}
            title={`Kunci ${index + 1}: ${
              status.requestCounts[index] || 0
            } permintaan`}
          />
        ))}
      </div>
    </div>
  );
}

export default ApiStatus;
