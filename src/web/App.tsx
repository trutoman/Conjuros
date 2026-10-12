import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AuthenticatedUserProfile } from '@conjuros/contracts';
import { CollectionPage } from './pages/CollectionPage';
import { useThemePreference } from './hooks/useThemePreference';
import { useSiteTheme } from './hooks/useSiteTheme';
import { ThemeIconsContext } from './components/ThemeIconsContext';

const queryClient = new QueryClient();

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    error?: { message?: string };
  } | null;
  return body?.error?.message ?? fallback;
}

function AuthScreen({
  onAuthenticated,
  onForgotPassword,
  notice,
}: {
  onAuthenticated: (user: AuthenticatedUserProfile) => void;
  onForgotPassword: () => void;
  notice: string;
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
      setError(await readErrorMessage(response, 'Could not authenticate'));
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
              type="text"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {notice && (
            <p role="status" className="field-success">
              {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
          <button type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
        {mode === 'login' && (
          <button className="quiet" onClick={onForgotPassword}>
            Forgot password?
          </button>
        )}
        <button className="quiet" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Create an account' : 'I already have an account'}
        </button>
      </section>
    </main>
  );
}

function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    const response = await fetch('/api/auth/password-reset/request', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      setError(await readErrorMessage(response, 'Could not request a password reset'));
      return;
    }
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setMessage(body?.message ?? 'Check your email for password reset instructions.');
  }
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">PRIVATE COLLECTION</p>
        <h1>Reset your password</h1>
        <p>Enter your email and we will send you a reset link.</p>
        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="text"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          {message && (
            <p role="status" className="field-success">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
          <button type="submit">Send reset link</button>
        </form>
        <button className="quiet" onClick={onBack}>
          Back to sign in
        </button>
      </section>
    </main>
  );
}

function ResetPasswordScreen({
  token,
  onComplete,
}: {
  token: string;
  onComplete: () => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/auth/password-reset/confirm', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    if (!response.ok) {
      setError(await readErrorMessage(response, 'Could not reset your password'));
      return;
    }
    onComplete();
  }
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">PRIVATE COLLECTION</p>
        <h1>Choose a new password</h1>
        <p>Enter a new password for your account.</p>
        <form onSubmit={submit}>
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
          <button type="submit">Set new password</button>
        </form>
      </section>
    </main>
  );
}

function readResetToken(): string {
  if (window.location.pathname !== '/reset-password') return '';
  return new URLSearchParams(window.location.search).get('token') ?? '';
}

function Application() {
  const [authenticated, setAuthenticated] = useState<AuthenticatedUserProfile | null | undefined>(
    undefined,
  );
  const [authView, setAuthView] = useState<'auth' | 'forgot'>('auth');
  const [notice, setNotice] = useState('');
  const [resetToken, setResetToken] = useState(readResetToken);
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
  function completeReset() {
    window.history.replaceState(null, '', '/');
    setResetToken('');
    setAuthView('auth');
    setNotice('Your password has been reset. You can now sign in.');
  }
  if (authenticated === undefined) return <main className="auth-shell">Loading...</main>;
  if (!authenticated) {
    if (resetToken) return <ResetPasswordScreen token={resetToken} onComplete={completeReset} />;
    if (authView === 'forgot') return <ForgotPasswordScreen onBack={() => setAuthView('auth')} />;
    return (
      <AuthScreen
        onAuthenticated={setAuthenticated}
        onForgotPassword={() => setAuthView('forgot')}
        notice={notice}
      />
    );
  }
  return (
    <ThemeIconsContext.Provider value={siteTheme.icons}>
      <CollectionPage
        currentUserLabel={currentUserLabel}
        theme={themePreference.theme}
        onThemeChange={themePreference.setTheme}
        role={authenticated.role}
        tagPalette={siteTheme.palette}
        onSignOut={() => void signOut()}
      />
    </ThemeIconsContext.Provider>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Application />
    </QueryClientProvider>
  );
}
