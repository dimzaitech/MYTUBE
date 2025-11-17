'use client';

import { useState, useEffect } from 'react';
import ApiStatusDynamic from '@/components/features/ApiStatusDynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SimpleAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import ClientOnly from '@/components/ClientOnly';
import Link from 'next/link';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (SimpleAuth.login(password)) {
      window.location.reload(); // Refresh halaman untuk menampilkan konten profil
    } else {
      setError('Password yang Anda masukkan salah.');
      setPassword('');
    }
  };

  return (
    <ClientOnly>
      <div className="flex min-h-[calc(100vh-12rem)] flex-1 items-center justify-center rounded-lg">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl">
              <Lock className="mx-auto mb-2 h-8 w-8" />
              Admin Login
            </CardTitle>
            <p className="pt-1 text-sm text-muted-foreground">
              Masukkan password untuk mengakses panel admin.
            </p>
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
                  required
                  placeholder="Masukkan password"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Button variant="link" size="sm" asChild>
                <Link href="/">← Kembali ke beranda</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientOnly>
  );
}

function ProfileContent() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  const handleLogout = () => {
    SimpleAuth.logout();
    window.location.reload(); // Refresh untuk menampilkan form login
  };

  const stats = {
    totalRequests: '1,247',
    activeKeys: '5/5',
    status: 'Healthy',
  };

  return (
    <ClientOnly>
      <div className="space-y-4 md:space-y-6">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <Avatar className="h-12 w-12 md:h-16 md:w-16">
                  <AvatarImage
                    src={userAvatar?.imageUrl}
                    alt="Admin"
                    data-ai-hint={userAvatar?.imageHint}
                  />
                  <AvatarFallback className="text-lg md:text-2xl">
                    A
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg md:text-2xl">Admin</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Owner • API Manager
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                size="sm"
                className="text-xs md:text-sm"
              >
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        <ApiStatusDynamic />
      </div>
    </ClientOnly>
  );
}

export default function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsAuthenticated(SimpleAuth.isAuthenticated());
  }, []);

  if (!isClient) {
    return null; // Atau tampilkan skeleton loading
  }

  return isAuthenticated ? <ProfileContent /> : <LoginForm />;
}
