import { createServer } from 'node:net';
import { pathToFileURL } from 'node:url';
import { runCommand } from './process-command.mjs';

const DEV_PORTS = [3000, 5173];

function canBindTo(port, host) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', (error) => {
      resolve(error.code !== 'EADDRINUSE');
    });
    server.once('close', () => resolve(true));
    server.listen(port, host, () => server.close());
  });
}

export async function probePortAvailable(port) {
  return (await canBindTo(port, '0.0.0.0')) && (await canBindTo(port, '::'));
}

function parseListeners(output) {
  const listeners = new Map();
  for (const line of output.split('\n')) {
    const fields = line.trim().split(/\s+/);
    if (fields[0] !== 'LISTEN') {
      continue;
    }
    const localAddress = fields[3];
    if (!localAddress?.includes(':')) {
      continue;
    }
    const port = Number(localAddress.substring(localAddress.lastIndexOf(':') + 1));
    if (!Number.isInteger(port) || port <= 0 || listeners.has(port)) {
      continue;
    }
    const pidMatch = line.match(/pid=(\d+)/);
    const processMatch = line.match(/users:\(\("([^"]+)"/);
    listeners.set(port, { pid: pidMatch ? Number(pidMatch[1]) : undefined, process: processMatch?.[1] });
  }
  return listeners;
}

async function findPortHolders(runner = runCommand) {
  const result = await runner('ss', ['-ltnp']);
  if (result.code !== 0) {
    return new Map();
  }
  const holders = new Map();
  for (const [port, listener] of parseListeners(result.stdout)) {
    let command;
    if (listener.pid) {
      const processResult = await runner('ps', ['-o', 'cmd=', '-p', String(listener.pid)]);
      command = processResult.code === 0 ? processResult.stdout.trim() : undefined;
    }
    holders.set(port, { ...listener, command });
  }
  return holders;
}

export async function checkDevPorts(ports = DEV_PORTS, dependencies = { probePortAvailable, runner: runCommand }) {
  const busy = [];
  for (const port of ports) {
    if (!(await dependencies.probePortAvailable(port))) {
      busy.push(port);
    }
  }
  if (busy.length === 0) {
    return { ok: true, message: `Development ports ${ports.join(', ')} are free.` };
  }
  const holders = await findPortHolders(dependencies.runner);
  const lines = busy.map((port) => {
    const holder = holders.get(port);
    if (!holder?.pid) {
      return `Port ${port} is already in use.`;
    }
    const detail = holder.command ?? holder.process;
    return detail
      ? `Port ${port} is already in use by pid ${holder.pid} (${detail}).`
      : `Port ${port} is already in use by pid ${holder.pid}.`;
  });
  lines.push('Stop the conflicting process (for example a previous dev session) and rerun this command.');
  return { ok: false, message: lines.join('\n') };
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  const result = await checkDevPorts();
  if (result.ok) {
    console.info(result.message);
  } else {
    console.error(result.message);
    process.exitCode = 1;
  }
}
