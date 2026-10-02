import { execFile } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import { createDatabase } from '../../api/db/client';
import { runMigrations } from '../../api/db/migrate';
import { PostgresUsersRepository } from '../../api/repositories/users.repository';

const execFileAsync = promisify(execFile);
const composeProject = `conjuros-environment-${process.pid}`;
const postgresUser = 'conjuros_environment';
const postgresPassword = 'conjuros_environment_password';
const postgresDatabase = 'conjuros_environment_test';
const databaseUrl = `postgres://${postgresUser}:${postgresPassword}@localhost:5432/${postgresDatabase}`;
const testEmail = `persistence-${Date.now()}@example.com`;

const composeEnvironment = {
  ...process.env,
  POSTGRES_USER: postgresUser,
  POSTGRES_PASSWORD: postgresPassword,
  POSTGRES_DB: postgresDatabase,
  SESSION_SECRET: 'docker-compose-test-session-secret-000000000000',
};

async function runDocker(argumentsList: string[]) {
  try {
    const { stdout, stderr } = await execFileAsync('docker', argumentsList, { env: composeEnvironment });
    return { code: 0, stdout, stderr };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Docker command failure';
    return { code: 1, stdout: '', stderr: message };
  }
}

async function connectWithRetry(): Promise<ReturnType<typeof createDatabase>> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const connection = createDatabase(databaseUrl);
    try {
      await connection.pool.query('SELECT 1');
      return connection;
    } catch (error) {
      lastError = error;
      await connection.pool.end();
      await delay(500);
    }
  }

  throw lastError;
}

describe('Docker Compose PostgreSQL persistence', () => {
  it('preserves data after a normal PostgreSQL service restart', async (context) => {
    const docker = await runDocker(['info']);
    if (docker.code !== 0) {
      context.skip('Docker is unavailable, so Compose persistence verification was skipped. Start Docker and rerun npm run test:docker.');
      return;
    }

    try {
      const start = await runDocker(['compose', '-p', composeProject, 'up', '-d', '--wait', '--wait-timeout', '120', 'db']);
      if (start.code !== 0) {
        throw new Error(`Docker Compose could not start the local PostgreSQL service: ${start.stderr}`);
      }

      const first = await connectWithRetry();
      await runMigrations(first.db);
      const created = await new PostgresUsersRepository(first.db).create(testEmail, 'hashed-password');
      await first.pool.end();

      const restart = await runDocker(['compose', '-p', composeProject, 'restart', 'db']);
      expect(restart.code).toBe(0);

      const second = await connectWithRetry();
      const found = await new PostgresUsersRepository(second.db).findByEmail(testEmail);
      await second.pool.end();

      expect(found?.id).toBe(created.id);
    } finally {
      await runDocker(['compose', '-p', composeProject, 'down', '--volumes', '--remove-orphans']);
    }
  });
});
