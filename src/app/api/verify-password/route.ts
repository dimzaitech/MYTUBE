
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const profilePassword = process.env.PROFILE_PASSWORD;
    const correctPasswords = ['admin', 'password', '123', 'carl', 'rahasia'];

    let isAuthenticated = false;

    // Prioritas utama: Periksa variabel environment
    if (profilePassword) {
      if (password === profilePassword) {
        isAuthenticated = true;
      }
    } else {
      // Fallback ke daftar password hardcoded jika var env tidak di-set
      if (correctPasswords.includes(password.toLowerCase())) {
        isAuthenticated = true;
      }
    }

    if (isAuthenticated) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Password salah' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
