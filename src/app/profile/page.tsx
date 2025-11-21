
'use client';

import { useState, useEffect } from 'react';
import ApiStatusDynamic from '@/components/features/ApiStatusDynamic';

export default function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Cek status otentikasi dari session storage saat komponen dimuat
  useEffect(() => {
    if (sessionStorage.getItem('mytube_authenticated') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="profile-page">
      {!isAuthenticated ? (
        <div className="login-container">
          <h1>🔒 MyTUBE Admin</h1>
          <form onSubmit={handleLogin}>
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
            {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center', marginBottom: '16px' }}>{error}</p>}
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Memverifikasi...' : '🔑 Masuk'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{width: '100%', maxWidth: '900px', margin: '0 auto', padding: '24px'}}>
           <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center'}}>Dashboard Admin</h1>
           <ApiStatusDynamic />
        </div>
      )}
    </div>
  );
}
