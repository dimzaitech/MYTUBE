'use client';
import { Search, Youtube, Settings } from 'lucide-react';
import Link from 'next/link';
import { useQueue } from '@/context/QueueContext';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function HeaderContent() {
  const { selectedVideo } = useQueue();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(urlSearchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (query) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/');
    }
  };
  
  if (selectedVideo) {
    return null; // Header disembunyikan saat video player aktif
  }

  return (
    <header className="app-header">
       <Link href="/" className="flex items-center gap-2 font-semibold">
        <h1 className="app-title">MyTUBE</h1>
      </Link>
      
      <form onSubmit={handleSearch} className="search-bar">
        <input
          name="q"
          placeholder="Cari..."
          className="search-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="search-button">
          <Search className="h-5 w-5" />
        </button>
      </form>
       <div className="flex items-center gap-1">
          <Link href="/profile" title="Pengaturan & Kuota" className="p-2">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
    </header>
  );
}


export default function Header() {
  return <HeaderContent />
}
