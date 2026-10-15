import { NextRequest, NextResponse } from 'next/server';
import { UserAccount } from '@/lib/types';

// Pre-seeded developer account
const DEV_ACCOUNT: UserAccount = {
  id: 'dev-fzpedia',
  name: 'fzpedia',
  email: 'fzpedia@dev.id',
  password: 'dev',
  birthDate: '2008-08-08',
  role: 'developer',
  avatar: '/images/profile-dev.jpeg',
  favoriteGenres: ['DJ & Remix', 'Pop Hits', 'Hip-Hop & Rap', 'EDM & Club', 'Rock & Metal'],
  createdAt: new Date().toISOString(),
};

// In-memory persistent database across requests
let userDatabase: Record<string, UserAccount> = {
  'fzpedia@dev.id': DEV_ACCOUNT,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (email && userDatabase[email.toLowerCase()]) {
    const user = { ...userDatabase[email.toLowerCase()] };
    delete user.password;
    return NextResponse.json({ success: true, user });
  }

  // Return non-sensitive list
  const users = Object.values(userDatabase).map((u) => {
    const copy = { ...u };
    delete copy.password;
    return copy;
  });

  return NextResponse.json({ success: true, users });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, name, email, password, birthDate, favoriteGenres } = body;

    if (action === 'dev-login') {
      const dev = { ...DEV_ACCOUNT };
      delete dev.password;
      return NextResponse.json({ success: true, user: dev, message: 'Selamat datang, Developer fzpedia!' });
    }

    if (action === 'social-login') {
      const provider = body.provider || 'Google';
      const socialEmail = body.email || `user_${Date.now()}@${provider.toLowerCase()}.com`;
      const socialName = body.name || `Pengguna ${provider}`;

      let existing = userDatabase[socialEmail.toLowerCase()];
      if (!existing) {
        existing = {
          id: `social_${Date.now()}`,
          name: socialName,
          email: socialEmail,
          role: 'user',
          avatar: body.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          favoriteGenres: [],
          createdAt: new Date().toISOString(),
        };
        userDatabase[socialEmail.toLowerCase()] = existing;
      }

      const safeUser = { ...existing };
      delete safeUser.password;
      return NextResponse.json({ success: true, user: safeUser });
    }

    if (action === 'register') {
      if (!name || !password) {
        return NextResponse.json({ success: false, error: 'Nama dan kata sandi wajib diisi!' }, { status: 400 });
      }

      // Generate clean email or use provided
      const accountEmail = email?.trim() || `${name.toLowerCase().replace(/\s+/g, '_')}@spotis.user`;
      const key = accountEmail.toLowerCase();

      if (userDatabase[key]) {
        return NextResponse.json(
          { success: false, error: 'Nama / Email ini sudah terdaftar. Silakan langsung masuk!' },
          { status: 409 }
        );
      }

      const newUser: UserAccount = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: accountEmail,
        password: password,
        birthDate: birthDate || '',
        role: accountEmail === 'fzpedia@dev.id' ? 'developer' : 'user',
        avatar: accountEmail === 'fzpedia@dev.id' ? '/images/profile-dev.jpeg' : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
        favoriteGenres: [],
        createdAt: new Date().toISOString(),
      };

      userDatabase[key] = newUser;

      const safeUser = { ...newUser };
      delete safeUser.password;
      return NextResponse.json({
        success: true,
        user: safeUser,
        message: 'Akun berhasil terdaftar! Silakan masuk menggunakan nama dan kata sandi Anda.',
      });
    }

    if (action === 'login') {
      const lookup = (name || email || '').trim().toLowerCase();

      // Check special developer account shortcut
      if (lookup === 'fzpedia@dev.id' || lookup === 'fzpedia') {
        const dev = { ...DEV_ACCOUNT };
        delete dev.password;
        return NextResponse.json({ success: true, user: dev, message: 'Masuk sebagai Developer berhasil!' });
      }

      // Check existing accounts by email or name
      const foundUser = Object.values(userDatabase).find(
        (u) =>
          u.email.toLowerCase() === lookup ||
          u.name.toLowerCase() === lookup ||
          u.email.toLowerCase() === `${lookup}@spotis.user`
      );

      if (!foundUser) {
        return NextResponse.json(
          { success: false, error: 'Akun tidak ditemukan! Silakan daftar terlebih dahulu.' },
          { status: 404 }
        );
      }

      if (foundUser.password && password && foundUser.password !== password) {
        return NextResponse.json(
          { success: false, error: 'Kata sandi salah! Silakan periksa kembali.' },
          { status: 401 }
        );
      }

      const safeUser = { ...foundUser };
      delete safeUser.password;
      return NextResponse.json({ success: true, user: safeUser, message: 'Berhasil masuk!' });
    }

    if (action === 'update-genres') {
      const userEmail = (email || '').toLowerCase();
      if (userDatabase[userEmail]) {
        userDatabase[userEmail].favoriteGenres = favoriteGenres || [];
        const safeUser = { ...userDatabase[userEmail] };
        delete safeUser.password;
        return NextResponse.json({ success: true, user: safeUser });
      }
      return NextResponse.json({ success: false, error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenal' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
