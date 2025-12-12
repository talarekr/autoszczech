import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidates = [
  path.join(__dirname, 'dist', 'index.js'),
  path.join(__dirname, 'dist', 'src', 'index.js'),
  path.join(__dirname, 'dist', 'backend', 'src', 'index.js'),
];

const entry = candidates.find((candidate) => existsSync(candidate));

if (!entry) {
  console.error('No compiled backend entrypoint found. Tried:', candidates.join(', '));
  process.exit(1);
}

const resolved = path.relative(process.cwd(), entry);
console.log(`Starting backend from ${resolved}`);

const { pathToFileURL } = await import('node:url');
await import(pathToFileURL(entry));
