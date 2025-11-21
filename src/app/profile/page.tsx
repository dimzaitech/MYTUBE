
'use client'

import { useState, useEffect } from 'react';
import ApiStatusDynamic from '@/components/features/ApiStatusDynamic';

export default function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cek status otentikasi dari session storage saat komponen dimuat
  useEffect(() => {
    if (sessionStorage.getItem('mytube_authenticated') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        // Simpan status login di session storage agar tetap login saat refresh
        sessionStorage.setItem('mytube_authenticated', 'true');
      } else {
        const data = await response.json();
        setError(data.error || 'Password salah.');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-page">
        <div className="login-container">
          <h1>🔒 MyTUBE Admin</h1>
          <p>Hanya developer yang bisa mengakses halaman ini.</p>
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="password-input" className="input-label">
                Password
              </label>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Masukkan password..."
                disabled={isLoading}
              />
            </div>
            {error && <p style={{ color: '#ff4444', fontSize: '14px', textAlign: 'center', marginTop: '15px' }}>{error}</p>}
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Memverifikasi...' : '🔑 Masuk'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
     <div className="profile-page">
       <div className="profile-header">
        <h1>📊 Pengaturan & Kuota</h1>
        <p>Kelola API keys dan pantau sisa kuota</p>
      </div>
       <ApiStatusDynamic />
    </div>
  )
}
