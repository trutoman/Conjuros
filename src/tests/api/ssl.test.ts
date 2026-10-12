import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildSslOptions } from '../../api/db/ssl';

describe('buildSslOptions', () => {
  it('disables TLS by default', () => {
    expect(buildSslOptions({ mode: 'disable', caPath: null })).toBe(false);
  });

  it('encrypts without verification when only require is set', () => {
    expect(buildSslOptions({ mode: 'require', caPath: null })).toEqual({
      rejectUnauthorized: false,
    });
  });

  it('verifies the server certificate when a CA file is given', () => {
    const directory = mkdtempSync(join(tmpdir(), 'ssl-'));
    const caPath = join(directory, 'ca.pem');
    writeFileSync(caPath, 'test-ca');
    try {
      expect(buildSslOptions({ mode: 'require', caPath })).toEqual({
        ca: 'test-ca',
        rejectUnauthorized: true,
      });
    } finally {
      rmSync(directory, { recursive: true });
    }
  });
});
