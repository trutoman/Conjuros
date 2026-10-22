import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { toStorageError } from './storageErrors';

export interface AttachmentStorage {
  upload(path: string, body: Buffer, contentType: string): Promise<void>;
  createSignedUrl(path: string, expiresInSeconds: number, downloadName: string): Promise<string>;
  remove(paths: string[]): Promise<void>;
}

export interface StorageConfig {
  supabaseUrl: string | null;
  supabaseServiceRoleKey: string | null;
  bucket: string;
}

export class SupabaseAttachmentStorage implements AttachmentStorage {
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
      console.error('Storage rejected an upload', { path, contentType, detail: error.message });
      throw toStorageError(error);
    }
  }

  async createSignedUrl(
    path: string,
    expiresInSeconds: number,
    downloadName: string,
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresInSeconds, { download: downloadName });
    if (error || !data) {
      const detail = error?.message ?? 'no signed URL returned';
      console.error('Storage could not sign a download', { path, detail });
      throw toStorageError(error ?? detail);
    }
    return data.signedUrl;
  }

  async remove(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    const { error } = await this.client.storage.from(this.bucket).remove(paths);
    if (error) {
      console.error('Storage could not remove objects', { paths, detail: error.message });
      throw toStorageError(error);
    }
  }
}

export class InMemoryAttachmentStorage implements AttachmentStorage {
  readonly objects = new Map<string, { body: Buffer; contentType: string }>();

  async upload(path: string, body: Buffer, contentType: string): Promise<void> {
    if (this.objects.has(path)) throw new Error('Storage object already exists');
    this.objects.set(path, { body, contentType });
  }

  async createSignedUrl(
    path: string,
    expiresInSeconds: number,
    downloadName: string,
  ): Promise<string> {
    if (!this.objects.has(path)) throw new Error('Storage object not found');
    const query = new URLSearchParams({ expires: String(expiresInSeconds), download: downloadName });
    return `https://storage.test/object/sign/${path}?${query.toString()}`;
  }

  async remove(paths: string[]): Promise<void> {
    for (const path of paths) this.objects.delete(path);
  }
}

export function createAttachmentStorage(config: StorageConfig): AttachmentStorage | null {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) return null;
  return new SupabaseAttachmentStorage(
    config.supabaseUrl,
    config.supabaseServiceRoleKey,
    config.bucket,
  );
}
