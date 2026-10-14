export interface UserProfile {
  id: string;
  name: string;
  email: string;
  birthdate?: {
    day: string;
    month: string;
    year: string;
  };
  provider: 'developer' | 'google' | 'facebook' | 'github' | 'credentials';
  favoriteGenres?: string[];
  createdAt: string;
  isDeveloper?: boolean;
}

interface StoredAccount {
  user: UserProfile;
  passwordHash: string;
}

const CURRENT_USER_KEY = 'spotis_current_user';
const ACCOUNTS_DB_KEY = 'spotis_registered_accounts';

const DEV_ACCOUNT: UserProfile = {
  id: 'dev-fzpedia-01',
  name: 'FZ Pedia [Developer]',
  email: 'fzpedia@dev.id',
  provider: 'developer',
  isDeveloper: true,
  createdAt: new Date().toISOString(),
  favoriteGenres: ['Pop', 'DJ / EDM', 'Rock', 'Akustik / Indie', 'Sunda Pop'],
};

export function getRegisteredAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export function registerUser(
  name: string,
  emailOrName: string,
  birthdate: { day: string; month: string; year: string },
  password: string
): { success: boolean; message: string; user?: UserProfile } {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Browser teu dirojong' };
  }

  const accounts = getRegisteredAccounts();
  const existing = accounts.find(
    (a) =>
      a.user.email.toLowerCase() === emailOrName.toLowerCase() ||
      a.user.name.toLowerCase() === name.toLowerCase()
  );

  if (existing) {
    return {
      success: false,
      message: 'Nami atanapi email ieu parantos kadaptar!',
    };
  }

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name,
    email: emailOrName,
    birthdate,
    provider: 'credentials',
    createdAt: new Date().toISOString(),
    favoriteGenres: [],
  };

  accounts.push({
    user: newUser,
    passwordHash: password, // client storage mock
  });

  localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(accounts));
  return {
    success: true,
    message: 'Akun parantos hasil didaftarkeun!',
    user: newUser,
  };
}

export function loginUser(
  identifier: string,
  password: string
): { success: boolean; message: string; user?: UserProfile } {
  const cleanId = identifier.trim().toLowerCase();

  // Developer bypass account
  if (cleanId === 'fzpedia@dev.id') {
    setCurrentUser(DEV_ACCOUNT);
    return {
      success: true,
      message: 'Wilujeng sumping, Developer FZ Pedia!',
      user: DEV_ACCOUNT,
    };
  }

  const accounts = getRegisteredAccounts();
  const found = accounts.find(
    (a) =>
      a.user.email.toLowerCase() === cleanId ||
      a.user.name.toLowerCase() === cleanId
  );

  if (!found) {
    return {
      success: false,
      message: 'Akun henteu kapendak. Mangga parios deui nami/email anjeun atanapi daftar.',
    };
  }

  if (found.passwordHash !== password) {
    return {
      success: false,
      message: 'Kecap konci (password) lepat!',
    };
  }

  setCurrentUser(found.user);
  return {
    success: true,
    message: `Wilujeng sumping deui, ${found.user.name}!`,
    user: found.user,
  };
}

export function loginDeveloper(): UserProfile {
  setCurrentUser(DEV_ACCOUNT);
  return DEV_ACCOUNT;
}

export function loginSocial(provider: 'google' | 'facebook' | 'github'): UserProfile {
  const names = {
    google: 'Wargi SpotiS (Google)',
    facebook: 'Wargi SpotiS (Facebook)',
    github: 'Wargi SpotiS (GitHub)',
  };

  const user: UserProfile = {
    id: `${provider}-${Date.now()}`,
    name: names[provider],
    email: `${provider}_user@spotis.app`,
    provider,
    createdAt: new Date().toISOString(),
    favoriteGenres: [],
  };

  setCurrentUser(user);
  return user;
}

export function saveUserGenres(genres: string[]): void {
  const current = getCurrentUser();
  if (current) {
    current.favoriteGenres = genres;
    setCurrentUser(current);
  }
}
