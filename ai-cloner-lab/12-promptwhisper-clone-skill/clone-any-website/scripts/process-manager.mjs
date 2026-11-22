import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function waitForUrl(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = 'no response';
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(Math.min(2000, timeoutMs)) });
      if (response.status < 500) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await delay(100);
  }
  throw new Error(`Local runtime did not become ready at ${url} within ${timeoutMs}ms (${lastError})`);
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === 'win32') {
    await new Promise((resolve) => {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      killer.once('exit', resolve);
      killer.once('error', resolve);
    });
  } else {
    try { process.kill(-child.pid, 'SIGTERM'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
    await Promise.race([new Promise((resolve) => child.once('exit', resolve)), delay(3000)]);
    if (child.exitCode === null) {
      try { process.kill(-child.pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
    }
  }
}

export async function startCloneRuntime(config) {
  if (!config.clone.start_command) throw new Error('clone.start_command is required unless --skip-start-command is used');
  await access(config.paths.working_directory);
  const output = [];
  const child = spawn(config.clone.start_command, {
    cwd: config.paths.working_directory,
    shell: true,
    detached: process.platform !== 'win32',
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const collect = (chunk) => {
    output.push(chunk.toString());
    if (output.join('').length > 20000) output.splice(0, output.length, output.join('').slice(-20000));
  };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  let earlyExit = null;
  child.once('exit', (code, signal) => { earlyExit = { code, signal }; });
  try {
    await Promise.race([
      waitForUrl(config.clone.url, config.clone.startup_timeout_ms),
      new Promise((_, reject) => child.once('exit', (code, signal) => reject(new Error(`clone.start_command exited before readiness (code=${code}, signal=${signal})`)))),
    ]);
  } catch (error) {
    await stopProcess(child);
    throw new Error(error.message);
  }
  return {
    pid: child.pid,
    earlyExit,
    stop: () => stopProcess(child),
    output: () => output.join('').trim(),
  };
}
