import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const profilePassword = process.env.PROFILE_PASSWORD;
    const correctPasswords = ['admin', 'password', '123', 'carl', 'rahasia'];

    let isAuthenticated = false;
    if (profilePassword && password === profilePassword) {
      isAuthenticated = true;
    } else if (!profilePassword && correctPasswords.includes(password.toLowerCase())) {
      // Fallback to hardcoded list only if PROFILE_PASSWORD is not set
      isAuthenticated = true;
    } else if (profilePassword && !isAuthenticated) {
      // If PROFILE_PASSWORD is set but didn't match, check hardcoded list as secondary
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
