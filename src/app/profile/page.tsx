'use client';

import ApiStatusDynamic from '@/components/features/ApiStatusDynamic';
import ClientOnly from '@/components/ClientOnly';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Konfigurasi API</h3>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="max-requests">Max Permintaan per Kunci</Label>
            <Input
              type="number"
              id="max-requests"
              defaultValue="9000"
              className="bg-input"
            />
            <p className="text-xs text-muted-foreground">
              Batas permintaan harian sebelum kunci dianggap habis.
            </p>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="reset-hours">Jam Reset Kuota</Label>
            <Input
              type="number"
              id="reset-hours"
              defaultValue="24"
              className="bg-input"
            />
             <p className="text-xs text-muted-foreground">
              Interval dalam jam untuk mereset jumlah penggunaan semua kunci.
            </p>
          </div>
        </div>
      </div>
       <div className="mt-6 text-center">
        <Button variant="default" size="sm">
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ClientOnly>
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">📊 Pengaturan & Kuota</h1>
          <p className="text-muted-foreground">
            Kelola kunci API dan pantau sisa kuota harian.
          </p>
        </div>

        <Tabs defaultValue="quota" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quota">📈 Status Kuota</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Pengaturan</TabsTrigger>
          </TabsList>
          <TabsContent value="quota" className="mt-6">
            <ApiStatusDynamic />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button variant="link" size="sm" asChild>
            <Link href="/">← Kembali ke beranda</Link>
          </Button>
        </div>
      </div>
    </ClientOnly>
  );
}
