'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import apiKeyManager from '@/services/apiKeyManager';
import { Button } from '../ui/button';
import ClientOnly from '../ClientOnly';

type ApiStatusState = ReturnType<typeof apiKeyManager.getStatus>;

function ApiStatusContent() {
  const [status, setStatus] = useState<ApiStatusState>({
    currentKey: 1,
    totalKeys: 0,
    usedCounts: {},
  });

  useEffect(() => {
    // Initial status and then set interval
    setStatus(apiKeyManager.getStatus());
    const interval = setInterval(() => {
      setStatus(apiKeyManager.getStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all API key usage counts?')) {
      apiKeyManager.resetAllCounts();
      setStatus(apiKeyManager.getStatus());
    }
  };

  if (status.totalKeys === 0) {
     return (
      <div className="p-4 text-center text-muted-foreground bg-card rounded-lg border-2 border-destructive mb-6">
        <h4>🔑 API KEY MANAGER</h4>
        <p className="mt-2">Tidak ada API Key yang valid ditemukan.</p>
        <p className="text-xs mt-1">
          Mohon tambahkan kunci API YouTube di file .env dengan prefix NEXT_PUBLIC_.
        </p>
      </div>
    );
  }

  const totalUsage = Object.values(status.usedCounts).reduce((a, b) => a + b, 0);
  const maxUsage = status.totalKeys * 9000;
  const usagePercent = maxUsage > 0 ? (totalUsage / maxUsage) * 100 : 0;
  
  const getStatusBgColor = () => {
    if (usagePercent > 80) return 'bg-destructive';
    if (usagePercent > 50) return 'bg-orange-500';
    return 'bg-green-500';
  }


  return (
    <div className="p-4 bg-card border rounded-lg mb-6 text-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">🔑 API KEY MANAGER</h4>
        <Button size="sm" variant="destructive" onClick={handleReset}>
          Reset Counts
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
         <div>
          <p><strong>Status:</strong> <span className="text-green-400">Key {status.currentKey}</span> dari {status.totalKeys}</p>
          <p><strong>Kunci Aktif:</strong> {status.totalKeys}/{status.totalKeys}</p>
        </div>
        <div>
            <strong>Permintaan per Kunci:</strong>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {Object.entries(status.usedCounts).map(([key, count]) => (
                <span key={key} className="text-muted-foreground">
                    K{parseInt(key) + 1}: <strong className="text-foreground">{count}</strong>
                </span>
                ))}
            </div>
        </div>
      </div>
      
      <div className="mb-4">
        <strong className="text-xs">Distribusi Kunci:</strong>
        <div className="flex gap-2 mt-2 flex-wrap">
          {Array.from({ length: status.totalKeys }).map((_, index) => {
            const count = status.usedCounts[index] || 0;
            const isCurrent = status.currentKey - 1 === index;
            const isExhausted = count > 8000;
            
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-1"
                title={`Kunci ${index + 1}: ${count} permintaan`}
              >
                <div
                  className={`w-5 h-5 rounded-full ${
                    isExhausted ? 'bg-destructive' : isCurrent ? 'bg-green-500' : 'bg-muted'
                  } ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-background ring-green-500' : ''}`}
                />
                <small className="text-xs text-muted-foreground">{index + 1}</small>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>Total Penggunaan Kuota</span>
          <span>{totalUsage} / {maxUsage > 0 ? maxUsage : 'N/A'}</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getStatusBgColor()}`}
            style={{ width: `${usagePercent}%`, transition: 'width 0.5s' }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ApiStatus() {
  return (
    <ClientOnly fallback={<Skeleton className="h-48 w-full mb-6" />}>
      <ApiStatusContent />
    </ClientOnly>
  );
}
