'use client';

import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ApiKeyManager from '@/services/apiKeyManager';
import { Button } from '../ui/button';

type ApiStatusState = ReturnType<ApiKeyManager['getStatus']>;

function ApiStatus() {
  const [status, setStatus] = useState<ApiStatusState | null>(null);
  const [loading, setLoading] = useState(true);
  
  const apiKeyManager = useMemo(() => {
    // Pastikan ini hanya berjalan di klien
    if (typeof window === 'undefined') return null;
    const manager = new ApiKeyManager();
    manager.initialize();
    return manager;
  }, []);

  useEffect(() => {
    if (!apiKeyManager) {
        setLoading(true);
        return;
    };
    
    // Initial status fetch
    setStatus(apiKeyManager.getStatus());
    setLoading(false);
    
    const statusInterval = setInterval(() => {
      setStatus(apiKeyManager.getStatus());
    }, 5000);

    return () => {
        clearInterval(statusInterval);
    };
  }, [apiKeyManager]);

  const handleManualReset = () => {
    if (apiKeyManager?.manualReset()) {
      setStatus(apiKeyManager.getStatus());
    }
  };

  const handleForceSwitch = () => {
    apiKeyManager?.forceSwitchKey();
    setStatus(apiKeyManager.getStatus());
  };
  
  if (loading || !status) {
    return <Skeleton className="h-48 w-full mb-6" />;
  }

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

  const getStatusColor = () => {
    if (status.totalKeys === 0) return 'border-red-500 text-red-400';
    const activeRatio = status.activeKeys / status.totalKeys;
    if (activeRatio >= 0.6) return 'border-green-500 text-green-400';
    if (activeRatio >= 0.3) return 'border-orange-500 text-orange-400';
    return 'border-red-500 text-red-400';
  };

  const getStatusBgColor = () => {
    if (status.totalKeys === 0) return 'bg-red-500';
    const activeRatio = status.activeKeys / status.totalKeys;
    if (activeRatio >= 0.6) return 'bg-green-500';
    if (activeRatio >= 0.3) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const totalRequests = Object.values(status.requestCounts).reduce((a, b) => a + b, 0);
  const maxRequests = apiKeyManager ? status.totalKeys * apiKeyManager.maxRequestsPerKey : 0;
  const totalUsagePercent = maxRequests > 0 ? (totalRequests / maxRequests) * 100 : 0;

  return (
    <div className={`p-4 bg-card border-2 rounded-lg mb-6 text-sm ${getStatusColor().split(' ')[0]}`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className={`font-semibold ${getStatusColor().split(' ')[1]}`}>🔑 API KEY MANAGER</h4>
        <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleForceSwitch}>Switch Key</Button>
            <Button size="sm" variant="destructive" onClick={handleManualReset}>Reset All</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
        <div>
          <p><strong>Status:</strong> Key {status.currentKeyIndex + 1} of {status.totalKeys}</p>
          <p><strong>Kunci Aktif:</strong> {status.activeKeys}/{status.totalKeys}</p>
          <p><strong>Reset Berikutnya:</strong> {status.hoursUntilReset} jam lagi</p>
        </div>
        <div>
            <strong>Permintaan per Kunci:</strong>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {Object.entries(status.requestCounts).map(([key, count]) => (
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
          {Array.from({ length: status.totalKeys }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1"
              title={`Kunci ${index + 1}: ${status.requestCounts[index] || 0} permintaan`}
            >
              <div
                className={`w-5 h-5 rounded-full ${status.failedKeys.includes(index) ? 'bg-destructive' : 'bg-muted'} ${status.currentKeyIndex === index ? 'ring-2 ring-offset-2 ring-offset-background ring-green-500' : ''}`}
              />
              <small className="text-xs text-muted-foreground">{index + 1}</small>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>Total Penggunaan Kuota</span>
          <span>{totalRequests} / {maxRequests > 0 ? maxRequests : 'N/A'}</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getStatusBgColor()}`}
            style={{ width: `${totalUsagePercent}%`, transition: 'width 0.5s' }}
          />
        </div>
      </div>
    </div>
  );
}

export default ApiStatus;
