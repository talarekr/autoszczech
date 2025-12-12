import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidates = [
  path.join(__dirname, 'index.js'),
  path.join(__dirname, 'src', 'index.js'),
  path.join(__dirname, 'backend', 'src', 'index.js'),
];

const entry = candidates.find((candidate) => existsSync(candidate));

if (!entry) {
  console.error('No compiled backend entrypoint found. Tried:', candidates.join(', '));
  process.exit(1);
}

const resolved = path.relative(process.cwd(), entry);
console.log(`Starting backend from ${resolved}`);

await import(pathToFileURL(entry).href);
