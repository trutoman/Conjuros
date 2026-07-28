import { describe, expect, it, vi } from 'vitest';

import { checkDockerAvailability } from '../../../scripts/check-docker.mjs';

describe('checkDockerAvailability', () => {
  it('reports an installation instruction when the Docker CLI is missing', async () => {
    const runner = vi.fn().mockResolvedValue({ code: 1, stdout: '', stderr: 'spawn docker ENOENT' });

    const result = await checkDockerAvailability(runner);

    expect(result).toEqual({
      available: false,
      message: 'Docker CLI is unavailable. Install Docker before starting the local MongoDB service.',
    });
  });

  it('reports a daemon-start instruction when Docker cannot be reached', async () => {
    const runner = vi.fn().mockResolvedValue({
      code: 1,
      stdout: '',
      stderr: 'Cannot connect to the Docker daemon at unix:///var/run/docker.sock',
    });

    const result = await checkDockerAvailability(runner);

    expect(result).toEqual({
      available: false,
      message: 'Docker is installed but unavailable. Start the Docker daemon before starting the local MongoDB service.',
    });
  });
});