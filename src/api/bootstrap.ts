import type { Role } from '@conjuros/contracts';
import type { ThemesService } from './services/themes.service';
import type { UsersRepository } from './repositories/users.repository';

export async function grantAdminRole(users: UsersRepository, adminEmail: string | null): Promise<void> {
  if (!adminEmail) return;
  const user = await users.findByEmail(adminEmail);
  if (user && user.role !== 'admin') {
    await users.setRole(user.id, 'admin' as Role);
  }
}

export async function ensureThemesSeeded(themes: ThemesService): Promise<void> {
  await themes.ensureSeeded();
}

export async function backfillThemeIcons(themes: ThemesService): Promise<void> {
  await themes.backfillIconAssets();
}