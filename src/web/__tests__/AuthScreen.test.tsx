import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';

function jsonResponse(body: unknown, ok: boolean): Response {
  return {
    ok,
    status: ok ? 200 : 400,
    json: async () => body,
  } as unknown as Response;
}

function stubFetch(handlers: Record<string, (init?: RequestInit) => Response>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const handler = handlers[url];
    if (!handler) throw new Error(`Unexpected fetch call: ${url}`);
    return handler(init);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function requestedBody(fetchMock: ReturnType<typeof stubFetch>, url: string): unknown {
  const call = fetchMock.mock.calls.find(([input]) => {
    const requestedUrl = typeof input === 'string' ? input : input.toString();
    return requestedUrl === url;
  });
  const init = call?.[1] as RequestInit | undefined;
  return init?.body ? JSON.parse(String(init.body)) : null;
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

describe('AuthScreen', () => {
  it('renders credential inputs without browser-native constraints', async () => {
    stubFetch({ '/api/auth/me': () => jsonResponse({}, false) });

    render(<App />);

    const email = await screen.findByLabelText('Email');
    expect(email).toHaveAttribute('type', 'text');
    expect(email).not.toHaveAttribute('required');

    const password = screen.getByLabelText('Password');
    expect(password).not.toHaveAttribute('required');
    expect(password).not.toHaveAttribute('minlength');
  });

  it('submits unvalidated credentials to the API and shows the returned problem', async () => {
    const fetchMock = stubFetch({
      '/api/auth/me': () => jsonResponse({}, false),
      '/api/auth/login': () =>
        jsonResponse(
          { error: { message: 'Password must include at least one uppercase letter' } },
          false,
        ),
    });

    render(<App />);

    const email = await screen.findByLabelText('Email');
    fireEvent.change(email, { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'weakpassword' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Password must include at least one uppercase letter',
    );
    const requestedUrls = fetchMock.mock.calls.map(([input]) =>
      typeof input === 'string' ? input : input.toString(),
    );
    expect(requestedUrls).toContain('/api/auth/login');
  });

  it('requests a password reset and shows the generic message', async () => {
    const fetchMock = stubFetch({
      '/api/auth/me': () => jsonResponse({}, false),
      '/api/auth/password-reset/request': () =>
        jsonResponse(
          { message: 'If an account exists for that email, we have sent password reset instructions.' },
          true,
        ),
    });

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Forgot password?' }));
    const email = await screen.findByLabelText('Email');
    fireEvent.change(email, { target: { value: 'ada@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'If an account exists for that email, we have sent password reset instructions.',
    );
    expect(requestedBody(fetchMock, '/api/auth/password-reset/request')).toEqual({
      email: 'ada@example.com',
    });
  });

  it('resets the password from the emailed link and returns to sign in', async () => {
    window.history.replaceState(null, '', '/reset-password?token=tok-123');
    const fetchMock = stubFetch({
      '/api/auth/me': () => jsonResponse({}, false),
      '/api/auth/password-reset/confirm': () =>
        jsonResponse({ message: 'Your password has been reset. You can now sign in.' }, true),
    });

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Choose a new password' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'NewPass1!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set new password' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Your password has been reset. You can now sign in.',
    );
    expect(requestedBody(fetchMock, '/api/auth/password-reset/confirm')).toEqual({
      token: 'tok-123',
      password: 'NewPass1!',
    });
    expect(window.location.pathname).toBe('/');
  });

  it('shows the API problem when a reset link is invalid', async () => {
    window.history.replaceState(null, '', '/reset-password?token=expired');
    stubFetch({
      '/api/auth/me': () => jsonResponse({}, false),
      '/api/auth/password-reset/confirm': () =>
        jsonResponse(
          { error: { message: 'This password reset link is invalid or has expired' } },
          false,
        ),
    });

    render(<App />);

    await screen.findByRole('heading', { name: 'Choose a new password' });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'NewPass1!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set new password' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This password reset link is invalid or has expired',
    );
  });
});
