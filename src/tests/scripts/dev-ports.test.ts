import type { AddressInfo } from 'node:net';
import { createServer } from 'node:net';
import { describe, expect, it, vi } from 'vitest';

import { checkDevPorts, probePortAvailable } from '../../../scripts/check-ports.mjs';

describe('checkDevPorts', () => {
  it('reports free development ports', async () => {
    const dependencies = {
      probePortAvailable: vi.fn().mockResolvedValue(true),
      runner: vi.fn(),
    };

    const result = await checkDevPorts([3000, 5173], dependencies);

    expect(result).toEqual({
      ok: true,
      message: 'Development ports 3000, 5173 are free.',
    });
  });

  it('names the process holding a busy port', async () => {
    const dependencies = {
      probePortAvailable: vi.fn().mockResolvedValue(false),
      runner: vi.fn().mockImplementation((command: string, argumentsList: string[]) => {
        if (command === 'ss' && argumentsList.includes('-ltnp')) {
          return Promise.resolve({
            code: 0,
            stdout: [
              'State  Recv-Q Send-Q Local Address:Port Peer Address:Port Process',
              'LISTEN 0 511 127.0.0.1:5173 0.0.0.0:* users:(("MainThread",pid=31192,fd=24))',
            ].join('\n'),
            stderr: '',
          });
        }
        return Promise.resolve({ code: 0, stdout: 'node vite.js\n', stderr: '' });
      }),
    };

    const result = await checkDevPorts([3000, 5173], dependencies);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('Port 3000 is already in use.');
    expect(result.message).toContain('Port 5173 is already in use by pid 31192 (node vite.js).');
    expect(result.message).toContain('Stop the conflicting process');
  });

  it('reports busy ports without a holder when ss is unavailable', async () => {
    const dependencies = {
      probePortAvailable: vi.fn().mockResolvedValue(false),
      runner: vi.fn().mockResolvedValue({ code: 1, stdout: '', stderr: 'ss: command not found' }),
    };

    const result = await checkDevPorts([3000], dependencies);

    expect(result).toEqual({
      ok: false,
      message: 'Port 3000 is already in use.\nStop the conflicting process (for example a previous dev session) and rerun this command.',
    });
  });
});

describe('probePortAvailable', () => {
  it('detects a port held by an active listener and reports it free after release', async () => {
    const server = createServer();
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const address = server.address() as AddressInfo;

    await expect(probePortAvailable(address.port)).resolves.toBe(false);

    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await expect(probePortAvailable(address.port)).resolves.toBe(true);
  });
});
