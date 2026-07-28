import { describe, expect, it, vi } from 'vitest';

import { runCommand } from '../../../scripts/process-command.mjs';

describe('runCommand', () => {
  it('returns successful command output from the injected runner', async () => {
    const runner = vi.fn().mockResolvedValue({ code: 0, stdout: 'Docker version\n', stderr: '' });

    const result = await runCommand('docker', ['version', '--format', '{{.Server.Version}}'], runner);

    expect(runner).toHaveBeenCalledWith('docker', ['version', '--format', '{{.Server.Version}}']);
    expect(result).toEqual({ code: 0, stdout: 'Docker version\n', stderr: '' });
  });

  it('returns failed command output from the injected runner', async () => {
    const runner = vi.fn().mockResolvedValue({ code: 1, stdout: '', stderr: 'Cannot connect to the Docker daemon' });

    const result = await runCommand('docker', ['info'], runner);

    expect(result).toEqual({ code: 1, stdout: '', stderr: 'Cannot connect to the Docker daemon' });
  });
});