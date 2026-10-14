import { NextRequest, NextResponse } from 'next/server';
import { UserAccount } from '@/lib/types';

// Pre-seeded developer account
const DEV_ACCOUNT: UserAccount = {
  id: 'dev-fzpedia',
  name: 'fzpedia',
  email: 'fzpedia@dev.id',
  password: 'dev',
  birthDate: '1998-01-01',
  role: 'developer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  favoriteGenres: ['DJ & Remix', 'Pop', 'Hip-Hop & Rap', 'EDM & Club', 'Rock'],
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
      return NextResponse.json({ success: true, user: dev, message: 'Wilujeng sumping Developer fzpedia!' });
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
        return NextResponse.json({ success: false, error: 'Nami sareng kecap konci kedah dieusian!' }, { status: 400 });
      }

      // Generate clean email or use provided
      const accountEmail = email?.trim() || `${name.toLowerCase().replace(/\s+/g, '_')}@spotis.user`;
      const key = accountEmail.toLowerCase();

      if (userDatabase[key]) {
        return NextResponse.json(
          { success: false, error: 'Nami / Email ieu parantos kadaptar. Mangga lebet langsung!' },
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
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
        favoriteGenres: [],
        createdAt: new Date().toISOString(),
      };

      userDatabase[key] = newUser;

      const safeUser = { ...newUser };
      delete safeUser.password;
      return NextResponse.json({
        success: true,
        user: safeUser,
        message: 'Akun parantos hasil kadaptar! Mangga lebet nganggo akun anjeun.',
      });
    }

    if (action === 'login') {
      const lookup = (name || email || '').trim().toLowerCase();

      // Check special developer account shortcut
      if (lookup === 'fzpedia@dev.id' || lookup === 'fzpedia') {
        const dev = { ...DEV_ACCOUNT };
        delete dev.password;
        return NextResponse.json({ success: true, user: dev, message: 'Masuk salaku Developer hasil!' });
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
          { success: false, error: 'Akun henteu kapendak! Mangga daftar heula.' },
          { status: 404 }
        );
      }

      if (foundUser.password && password && foundUser.password !== password) {
        return NextResponse.json(
          { success: false, error: 'Kecap konci lepat! Mangga parios deui.' },
          { status: 401 }
        );
      }

      const safeUser = { ...foundUser };
      delete safeUser.password;
      return NextResponse.json({ success: true, user: safeUser, message: 'Lebet hasil!' });
    }

    if (action === 'update-genres') {
      const userEmail = (email || '').toLowerCase();
      if (userDatabase[userEmail]) {
        userDatabase[userEmail].favoriteGenres = favoriteGenres || [];
        const safeUser = { ...userDatabase[userEmail] };
        delete safeUser.password;
        return NextResponse.json({ success: true, user: safeUser });
      }
      return NextResponse.json({ success: false, error: 'Panganggo henteu kapendak' }, { status: 404 });
    }

    return NextResponse.json({ success: false, error: 'Aksi teu dikenal' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
