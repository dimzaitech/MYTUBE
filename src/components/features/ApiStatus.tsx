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
};

function ApiStatus() {
  const [status, setStatus] = useState<ApiStatusState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
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
    return <Skeleton className="h-40 w-full mb-6" />;
  }

  if (!status || status.totalKeys === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground bg-card rounded-lg border-2 border-destructive mb-6">
        <h4>🔑 API KEY MANAGER</h4>
        <p className="mt-2">Tidak ada API Key yang valid ditemukan.</p>
        <p className="text-xs mt-1">
          Mohon tambahkan kunci API YouTube di file .env.
        </p>
      </div>
    );
  }

  const getStatusColor = () => {
    const activeRatio = status.activeKeys / status.totalKeys;
    if (activeRatio >= 0.6) return 'border-green-500 text-green-400';
    if (activeRatio >= 0.3) return 'border-orange-500 text-orange-400';
    return 'border-red-500 text-red-400';
  };

  const getStatusBgColor = () => {
    const activeRatio = status.activeKeys / status.totalKeys;
    if (activeRatio >= 0.6) return 'bg-green-500';
    if (activeRatio >= 0.3) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const totalRequests = Object.values(status.requestCounts).reduce(
    (a, b) => a + b,
    0
  );
  const maxRequests = status.totalKeys * 9000; // Asumsi dari kode sebelumnya
  const totalUsagePercent = maxRequests > 0 ? (totalRequests / maxRequests) * 100 : 0;

  return (
    <div
      className={`p-4 bg-card border-2 rounded-lg mb-6 text-sm ${getStatusColor().split(' ')[0]}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className={`font-semibold ${getStatusColor().split(' ')[1]}`}>
          🔑 API KEY MANAGER
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
        <div>
          <p>
            <strong>Status:</strong> Kunci {status.currentKeyIndex + 1} dari{' '}
            {status.totalKeys}
          </p>
          <p>
            <strong>Kunci Aktif:</strong> {status.activeKeys}/{status.totalKeys}
          </p>
        </div>
        <div>
          <strong>Permintaan per Kunci:</strong>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            {Object.entries(status.requestCounts).map(([key, count]) => (
              <span key={key} className="text-muted-foreground">
                K{parseInt(key) + 1}:{' '}
                <strong className="text-foreground">{count}</strong>
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
                className={`w-5 h-5 rounded-full ${
                  status.failedKeys.includes(index)
                    ? 'bg-destructive'
                    : status.currentKeyIndex === index
                    ? 'bg-green-500'
                    : 'bg-muted'
                } ${status.currentKeyIndex === index ? 'ring-2 ring-offset-2 ring-offset-background ring-green-500' : ''}`}
              />
              <small className="text-xs text-muted-foreground">{index + 1}</small>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>Total Penggunaan Kuota</span>
          <span>
            {totalRequests} / {maxRequests}
          </span>
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
