import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import AppSidebar from '@/components/layout/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'MyTUBE',
  description: 'A YouTube clone built with Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <SidebarProvider>
          <div className="flex min-h-screen w-full flex-col">
            <Header />
            <div className="flex flex-1">
              <AppSidebar />
              <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <Suspense fallback={<div>Memuat...</div>}>
                  {children}
                </Suspense>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
