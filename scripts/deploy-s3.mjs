#!/usr/bin/env node
/**
 * Build the Vite app and sync dist/ to an S3 bucket for static hosting.
 * Requires: AWS CLI installed and configured (aws configure).
 *
 * Usage:
 *   BUCKET_NAME=my-website-bucket node scripts/deploy-s3.mjs
 *   Or set BUCKET_NAME in .env (optional; script does not load .env by default)
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const bucket = process.env.BUCKET_NAME;

if (!bucket) {
  console.error('Error: BUCKET_NAME is required.');
  console.error('Example: BUCKET_NAME=my-website-bucket node scripts/deploy-s3.mjs');
  process.exit(1);
}

console.log('Building frontend...');
execSync('npm run build', { cwd: root, stdio: 'inherit' });

const dist = join(root, 'dist');
if (!existsSync(dist)) {
  console.error('Error: dist/ folder not found after build.');
  process.exit(1);
}

console.log(`Syncing dist/ to s3://${bucket}...`);
execSync(`aws s3 sync "${dist}" s3://${bucket} --delete`, { stdio: 'inherit' });

console.log('Done. Enable static website hosting on the bucket and set Error document to index.html for client-side routing.');
