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

function stubFetch(handlers: Record<string, () => Response>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    const handler = handlers[url];
    if (!handler) throw new Error(`Unexpected fetch call: ${url}`);
    return handler();
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
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
});
