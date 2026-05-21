#!/usr/bin/env node
/**
 * Capacitor CLI wrapper (bypasses bin/node engine check when using Node 16 locally).
 * Prefer Node 20+ via `nvm use` — see .nvmrc
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliEntry = join(__dirname, '../node_modules/@capacitor/cli/dist/index.js');
const args = process.argv.slice(2);

const child = spawn(process.execPath, [cliEntry, ...args], {
  stdio: 'inherit',
  cwd: join(__dirname, '..'),
});

child.on('exit', (code) => process.exit(code ?? 1));
