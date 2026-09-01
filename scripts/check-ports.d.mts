import type { CommandRunner } from './process-command.mjs';

export interface PortCheckDependencies {
  probePortAvailable: (port: number) => Promise<boolean>;
  runner: CommandRunner;
}

export interface PortCheckResult {
  ok: boolean;
  message: string;
}

export function probePortAvailable(port: number): Promise<boolean>;

export function checkDevPorts(ports?: number[], dependencies?: PortCheckDependencies): Promise<PortCheckResult>;
