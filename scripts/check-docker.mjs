import { pathToFileURL } from 'node:url';
import { runCommand } from './process-command.mjs';

export async function checkDockerAvailability(runner = runCommand) {
  const result = await runner('docker', ['info']);
  if (result.code === 0) {
    return { available: true, message: 'Docker is available.' };
  }

  if (result.stderr.includes('ENOENT') || result.stderr.includes('not found')) {
    return {
      available: false,
      message: 'Docker CLI is unavailable. Install Docker before starting the local MongoDB service.',
    };
  }

  return {
    available: false,
    message: 'Docker is installed but unavailable. Start the Docker daemon before starting the local MongoDB service.',
  };
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  const result = await checkDockerAvailability();
  if (result.available) {
    console.info(result.message);
  } else {
    console.error(result.message);
    process.exitCode = 1;
  }
}