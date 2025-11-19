
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Use a hardcoded list for simplicity as requested, but environment variable is better practice
    const correctPasswords = ['admin', 'password', '123', 'carl', 'rahasia'];
    const profilePassword = process.env.PROFILE_PASSWORD;

    let isAuthenticated = false;
    if (profilePassword && password === profilePassword) {
        isAuthenticated = true;
    } else if (correctPasswords.includes(password.toLowerCase())) {
        isAuthenticated = true;
    }

    if (isAuthenticated) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Password salah' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
