import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { MongoClient } from 'mongodb';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const composeProject = `conjuros-environment-${process.pid}`;
const databaseName = 'conjuros_environment_test';
const collectionName = `persistence_${Date.now()}`;

async function runDocker(argumentsList: string[]) {
  try {
    const { stdout, stderr } = await execFileAsync('docker', argumentsList);
    return { code: 0, stdout, stderr };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Docker command failure';
    return { code: 1, stdout: '', stderr: message };
  }
}

async function waitForMongo() {
  let lastError: unknown;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const client = new MongoClient('mongodb://localhost:27017', { serverSelectionTimeoutMS: 1_000 });
    try {
      await client.connect();
      return client;
    } catch (error) {
      lastError = error;
      await client.close();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw lastError;
}

describe('Docker Compose MongoDB persistence', () => {
  it('preserves data after a normal MongoDB service restart', async (context) => {
    const docker = await runDocker(['info']);
    if (docker.code !== 0) {
      context.skip('Docker is unavailable, so Compose persistence verification was skipped. Start Docker and rerun npm run test:docker.');
      return;
    }

    let client: MongoClient | undefined;
    try {
      const start = await runDocker(['compose', '-p', composeProject, 'up', '-d', 'db']);
      if (start.code !== 0) {
        throw new Error(`Docker Compose could not start the local MongoDB service: ${start.stderr}`);
      }

      client = await waitForMongo();
      await client.db(databaseName).collection(collectionName).insertOne({ persisted: true });
      await client.close();
      client = undefined;

      const restart = await runDocker(['compose', '-p', composeProject, 'restart', 'db']);
      expect(restart.code).toBe(0);

      client = await waitForMongo();
      const record = await client.db(databaseName).collection(collectionName).findOne({ persisted: true });
      expect(record).not.toBeNull();
    } finally {
      await client?.close();
      await runDocker(['compose', '-p', composeProject, 'down', '--volumes', '--remove-orphans']);
    }
  });
});