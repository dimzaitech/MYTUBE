'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ApiStatusDynamic = dynamic(() => import('./ApiStatus'), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full mb-6" />,
});

export default ApiStatusDynamic;
