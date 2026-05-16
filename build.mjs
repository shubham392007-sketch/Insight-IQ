import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

console.log('Running vite build...');
execSync('npx vite build', { stdio: 'inherit' });

console.log('Restructuring dist folder for Vercel...');
const clientDir = path.join('dist', 'client');
const serverDir = path.join('dist', 'server');

if (fs.existsSync(clientDir)) {
  const files = fs.readdirSync(clientDir);
  for (const file of files) {
    const src = path.join(clientDir, file);
    const dest = path.join('dist', file);
    fs.renameSync(src, dest);
  }
  fs.rmSync(clientDir, { recursive: true, force: true });
  
  if (fs.existsSync(serverDir)) {
    fs.rmSync(serverDir, { recursive: true, force: true });
  }
}

console.log('Build complete! Ready for Vercel deployment.');
