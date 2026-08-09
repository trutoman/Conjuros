import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AuthenticatedUserProfile } from '@conjuros/contracts';
import { CollectionPage } from './pages/CollectionPage';
import { useThemePreference } from './hooks/useThemePreference';
import { useSiteTheme } from './hooks/useSiteTheme';

const queryClient = new QueryClient();

function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (user: AuthenticatedUserProfile) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    const response = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      setError(body?.error?.message ?? 'Could not authenticate');
      return;
    }
    const body = (await response.json().catch(() => null)) as {
      user?: AuthenticatedUserProfile;
    } | null;
    if (!body?.user) {
      setError('Could not authenticate');
      return;
    }
    onAuthenticated(body.user);
  }
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">PRIVATE COLLECTION</p>
        <h1>Conjuros</h1>
        <p>Keep commands and useful links close at hand.</p>
        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={12}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
          <button type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
        <button className="quiet" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Create an account' : 'I already have an account'}
        </button>
      </section>
    </main>
  );
}

function Application() {
  const [authenticated, setAuthenticated] = useState<AuthenticatedUserProfile | null | undefined>(
    undefined,
  );
  const ready = authenticated !== null && authenticated !== undefined;
  const themePreference = useThemePreference(authenticated?.theme ?? 'light', ready);
  const siteTheme = useSiteTheme(ready, themePreference.settledTheme);
  const currentUserLabel = authenticated?.email.split('@')[0] ?? '';
  useEffect(() => {
    void fetch('/api/auth/me', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          setAuthenticated(null);
          return;
        }
        const body = (await response.json().catch(() => null)) as {
          user?: AuthenticatedUserProfile;
        } | null;
        setAuthenticated(body?.user ?? null);
      })
      .catch(() => setAuthenticated(null));
  }, []);
  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    queryClient.clear();
    setAuthenticated(null);
  }
  if (authenticated === undefined) return <main className="auth-shell">Loading...</main>;
  if (!authenticated) return <AuthScreen onAuthenticated={setAuthenticated} />;
  return (
    <CollectionPage
      currentUserLabel={currentUserLabel}
      theme={themePreference.theme}
      onThemeChange={themePreference.setTheme}
      role={authenticated.role}
      tagPalette={siteTheme.palette}
      onSignOut={() => void signOut()}
    />
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Application />
    </QueryClientProvider>
  );
}
