export interface CommandResult {
  code: number;
  stdout: string;
  stderr: string;
}

export type CommandRunner = (command: string, argumentsList: string[]) => Promise<CommandResult>;

export function runCommand(command: string, argumentsList: string[], runner?: CommandRunner): Promise<CommandResult>;