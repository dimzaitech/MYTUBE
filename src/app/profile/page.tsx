'use client';

import ApiStatusDynamic from '@/components/features/ApiStatusDynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ProfilePage() {
  // Autentikasi sederhana, bisa diganti dengan logic yang lebih canggih
  const isAuthenticated = true;
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  if (!isAuthenticated) {
    return (
      <div className="flex h-full flex-1 items-center justify-center rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Akses Ditolak</h1>
          <p className="text-muted-foreground">
            Anda tidak memiliki izin untuk melihat halaman ini.
          </p>
        </div>
      </div>
    );
  }

  // Data dummy untuk statistik
  const stats = {
    totalRequests: '1,247',
    activeKeys: '5/5',
    status: 'Healthy',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={userAvatar?.imageUrl}
                alt="Admin"
                data-ai-hint={userAvatar?.imageHint}
              />
              <AvatarFallback className="text-2xl">A</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">Admin</CardTitle>
              <p className="text-muted-foreground">Owner</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Permintaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalRequests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kunci Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">
              {stats.activeKeys}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{stats.status}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <ApiStatusDynamic />
      </div>
    </div>
  );
}
