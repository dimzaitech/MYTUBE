'use client';

// This file is no longer in use after removing the login functionality.
// It can be safely deleted or kept for future reference.

const ADMIN_PASSWORD = 'mysecretpassword123';

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
