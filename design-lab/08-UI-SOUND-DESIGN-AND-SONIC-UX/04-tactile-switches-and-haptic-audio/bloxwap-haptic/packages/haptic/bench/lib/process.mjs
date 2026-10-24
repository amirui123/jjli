import { spawn } from 'node:child_process';
import { mkdtemp, open, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
export async function run(file, args, options) {
  // File-backed output also works in restricted hosts with unavailable pipe capture.
  const directory = await mkdtemp(join(tmpdir(), 'haptic-bench-'));
  const output = join(directory, 'stdout');
  const handle = await open(output, 'w');
  try {
    await new Promise((resolve, reject) => {
      const child = spawn(file, args, { ...options, stdio: ['ignore', handle.fd, 'inherit'] });
      child.on('error', reject);
      child.on('close', (code, signal) => code === 0 ? resolve() : reject(Error(`${file} exited ${code ?? signal}`)));
    });
    return await readFile(output, 'utf8');
  } finally {
    await handle.close();
    await rm(directory, { recursive: true, force: true });
  }
}
