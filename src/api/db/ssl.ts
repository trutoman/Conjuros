import { readFileSync } from 'node:fs';
import type { ConnectionOptions } from 'node:tls';

export interface DatabaseSslSettings {
  mode: 'disable' | 'require';
  caPath: string | null;
}

// `require` always encrypts; the server certificate is verified only when a CA file is supplied.
export function buildSslOptions(settings: DatabaseSslSettings): ConnectionOptions | false {
  if (settings.mode === 'disable') {
    return false;
  }
  if (settings.caPath) {
    return { ca: readFileSync(settings.caPath, 'utf8'), rejectUnauthorized: true };
  }
  return { rejectUnauthorized: false };
}
