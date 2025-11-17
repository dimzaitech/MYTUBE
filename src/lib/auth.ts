'use client';

// Ganti dengan password yang lebih aman di aplikasi production
const ADMIN_PASSWORD = 'admin123';

export class SimpleAuth {
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('admin_authenticated') === 'true';
  }

  static login(password: string): boolean {
    if (password === ADMIN_PASSWORD) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_authenticated', 'true');
      }
      return true;
    }
    return false;
  }

  static logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_authenticated');
    }
  }
}
