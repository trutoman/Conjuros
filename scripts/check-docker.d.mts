import type { CommandRunner } from './process-command.mjs';

export interface DockerAvailability {
  available: boolean;
  message: string;
}

export function checkDockerAvailability(runner?: CommandRunner): Promise<DockerAvailability>;