
'use client';

import { useState } from 'react';
import Link from 'next/link';

// NOTE: The ApiStatusDynamic component has been removed as it relied on 
// Radix/ShadCN components that are no longer in use on this page.
// The quota display logic will need to be re-implemented with native HTML.

export default function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState(null); // Placeholder for future use

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        // In a real app, you'd fetch quota info here
      } else {
        setError(data.error || 'Password salah!');
        setPassword('');
      }
    } catch (error) {
      setError('Gagal terhubung ke server. Coba lagi nanti.');
    } finally {
        setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-page" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="login-container" style={{ width: '100%', maxWidth: '400px', padding: '2rem', border: '1px solid #333', borderRadius: '12px', background: '#1a1a1a', textAlign: 'center' }}>
          <h1>🔒 MyTUBE Admin</h1>
          <p style={{ color: '#aaa', margin: '0.5rem 0 1.5rem' }}>
            Masukkan password buat akses kuota.
          </p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group" style={{ textAlign: 'left' }}>
              <label htmlFor="password" className="input-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Password..."
                required
                disabled={isLoading}
                style={{ width: '100%', padding: '0.75rem', background: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white' }}
              />
            </div>
            {error && (
                <div style={{ color: '#ff8a80', background: 'rgba(255, 138, 128, 0.1)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                  {error}
                </div>
            )}
            <button type="submit" className="login-button" disabled={isLoading} style={{ padding: '0.75rem', background: '#fff', color: '#0f0f0f', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLoading ? 'Memverifikasi...' : '🔑 Masuk'}
            </button>
          </form>
           <div style={{ marginTop: '1rem' }}>
              <a href="/" style={{ color: '#aaa', fontSize: '0.9rem' }}>← Kembali ke beranda</a>
            </div>
        </div>
      </div>
    );
  }

  return (
     <div className="profile-page" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="quota-container">
          <h2>📊 Status Kuota API</h2>
          <div style={{ marginTop: '2rem', padding: '2rem', border: '1px solid #333', borderRadius: '12px', background: '#1a1a1a' }}>
             <p style={{color: '#aaa'}}>Tampilan status kuota belum diimplementasikan dengan HTML native.</p>
             <p style={{color: '#aaa', marginTop: '0.5rem'}}>Logika akan ditambahkan di sini.</p>
          </div>
        </div>
         <div style={{ marginTop: '2rem' }}>
          <a href="/" style={{ color: '#aaa', fontSize: '0.9rem' }}>← Kembali ke beranda</a>
        </div>
    </div>
  );
}
