import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center space-y-6 bg-background p-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          404 - Halaman Tidak Ditemukan
        </h1>
        <p className="max-w-md text-muted-foreground">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
