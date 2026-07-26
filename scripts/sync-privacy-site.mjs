#!/usr/bin/env node
/**
 * Copies privacy policy assets from docs/ into privacy-site/
 * for optional manual deploys. GitHub Pages deploys directly from docs/.
 */
import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'privacy-site');

mkdirSync(out, { recursive: true });

for (const file of ['index.html', 'icon.svg', '.nojekyll']) {
  cpSync(join(root, 'docs', file), join(out, file));
}

console.log('Synced privacy-site/ from docs/ (workflow unchanged)');
