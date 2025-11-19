'use client';

import ApiStatusDynamic from '@/components/features/ApiStatusDynamic';
import ClientOnly from '@/components/ClientOnly';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  return (
    <ClientOnly>
      <div className="p-4 md:p-6">
        <ApiStatusDynamic />
         <div className="mt-6 text-center">
            <Button variant="link" size="sm" asChild>
              <Link href="/">← Kembali ke beranda</Link>
            </Button>
          </div>
      </div>
    </ClientOnly>
  );
}
