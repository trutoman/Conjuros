import { spawn } from 'node:child_process';

function runProcess(command, argumentsList) {
  return new Promise((resolve) => {
    const child = spawn(command, argumentsList, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (error) => {
      resolve({ code: 1, stdout, stderr: error.message });
    });
    child.on('close', (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

export function runCommand(command, argumentsList, runner = runProcess) {
  return runner(command, argumentsList);
}