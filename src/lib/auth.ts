import { supabase } from './supabase';
import { useAuthStore } from '../store/authStore';

const ADMIN_CACHE_MS = 15_000;
const ADMIN_CHECK_TIMEOUT_MS = 8_000;
let adminCache: { userId: string; isAdmin: boolean; at: number } | null = null;

function getCachedAdmin(userId: string): boolean | null {
  if (!adminCache || adminCache.userId !== userId) return null;
  if (Date.now() - adminCache.at > ADMIN_CACHE_MS) {
    adminCache = null;
    return null;
  }
  return adminCache.isAdmin;
}

function setCachedAdmin(userId: string, isAdmin: boolean) {
  adminCache = { userId, isAdmin, at: Date.now() };
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// appforenglish: admin_users table (id = user id, is_admin). RLS allows auth.uid() = id.
export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  const cached = getCachedAdmin(userId);
  if (cached !== null) return cached;

  const run = async (): Promise<boolean> => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[auth] admin_users:', error.message);
      return false;
    }
    return data?.is_admin === true;
  };

  let result = await withTimeout(run(), ADMIN_CHECK_TIMEOUT_MS, false);
  if (!result) {
    await new Promise((r) => setTimeout(r, 300));
    result = await withTimeout(run(), ADMIN_CHECK_TIMEOUT_MS, false);
  }

  setCachedAdmin(userId, result);
  return result;
};

export const verifyAdmin = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  return checkAdminStatus(user.id);
};

const INIT_AUTH_TIMEOUT_MS = 12_000;

export const initializeAuth = async () => {
  const { setUser, setIsAdmin, setIsLoading } = useAuthStore.getState();
  setIsLoading(true);

  const done = () => {
    useAuthStore.getState().setIsLoading(false);
  };

  try {
    const res = await withTimeout(
      supabase.auth.getSession(),
      INIT_AUTH_TIMEOUT_MS,
      { data: { session: null }, error: null },
    );
    const session = res?.data?.session ?? null;

    if (!session?.user) {
      setUser(null);
      setIsAdmin(false);
      done();
      return;
    }

    setUser(session.user);
    const isAdmin = await checkAdminStatus(session.user.id);
    setIsAdmin(isAdmin);
  } catch (e) {
    console.error('[auth] init error', e);
    setUser(null);
    setIsAdmin(false);
  } finally {
    done();
  }
};

export const setupAuthListener = () => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'INITIAL_SESSION') return;

    const { setUser, setIsAdmin } = useAuthStore.getState();

    if (!session?.user) {
      adminCache = null;
      setUser(null);
      setIsAdmin(false);
      return;
    }

    setUser(session.user);
    const isAdmin = await checkAdminStatus(session.user.id);
    setIsAdmin(isAdmin);
  });
};
