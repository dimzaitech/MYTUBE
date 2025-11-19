'use client';

import { useState } from 'react';
import ApiStatusDynamic from '@/components/features/ApiStatusDynamic';
import ClientOnly from '@/components/ClientOnly';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { KeyRound } from 'lucide-react';

function SettingsTab() {
  const handleSave = () => {
    // Logic to save settings can be added here
    // For now, it just shows an alert
    alert('Pengaturan disimpan! (Fungsionalitas belum diimplementasikan)');
  };
  
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Konfigurasi Kuota API</h3>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="max-requests">Max Kuota per Kunci</Label>
            <Input
              type="number"
              id="max-requests"
              defaultValue={
                process.env.NEXT_PUBLIC_MAX_REQUESTS_PER_KEY || '9000'
              }
              className="bg-input"
            />
            <p className="text-xs text-muted-foreground">
              Batas kuota harian sebelum kunci dianggap habis. (Default: 9000)
            </p>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="reset-hours">Jam Reset Kuota</Label>
            <Input
              type="number"
              id="reset-hours"
              defaultValue={process.env.NEXT_PUBLIC_QUOTA_RESET_HOURS || '24'}
              className="bg-input"
            />
            <p className="text-xs text-muted-foreground">
              Interval dalam jam untuk mereset kuota. (Default: 24)
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center">
        <Button onClick={handleSave} variant="default" size="sm">
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_PROFILE_PASSWORD;
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Password salah!');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>🔒 Akses Terbatas</CardTitle>
            <CardDescription>
              Hanya developer yang bisa mengakses halaman ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                🔑 Masuk
              </Button>
            </form>
            <Button variant="link" size="sm" asChild className="mt-4 w-full">
              <Link href="/">← Kembali ke beranda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-4xl p-4 pt-20 md:p-6 md:pt-24">
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
