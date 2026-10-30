import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { toStorageError } from './storageErrors';
import type { StorageConfig } from './storage';

// Theme images are never deleted by the application, so this seam has no remove operation.
export interface ThemeImageStorage {
  upload(path: string, body: Buffer, contentType: string): Promise<void>;
  publicUrl(path: string): string;
}

export class SupabaseThemeImageStorage implements ThemeImageStorage {
  private readonly client: SupabaseClient;

  constructor(
    supabaseUrl: string,
    serviceRoleKey: string,
    private readonly bucket: string,
  ) {
    this.client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async upload(path: string, body: Buffer, contentType: string): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, body, { contentType, upsert: false });
    if (error) {
      console.error('Storage rejected a theme image upload', { path, contentType, detail: error.message });
      throw toStorageError(error);
    }
  }

  publicUrl(path: string): string {
    return this.client.storage.from(this.bucket).getPublicUrl(path).data.publicUrl;
  }
}

export class InMemoryThemeImageStorage implements ThemeImageStorage {
  readonly objects = new Map<string, { body: Buffer; contentType: string }>();

  async upload(path: string, body: Buffer, contentType: string): Promise<void> {
    if (this.objects.has(path)) throw new Error('Storage object already exists');
    this.objects.set(path, { body, contentType });
  }

  publicUrl(path: string): string {
    return `https://storage.test/public/${path}`;
  }
}

export function createThemeImageStorage(config: StorageConfig): ThemeImageStorage | null {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) return null;
  return new SupabaseThemeImageStorage(config.supabaseUrl, config.supabaseServiceRoleKey, config.bucket);
}
