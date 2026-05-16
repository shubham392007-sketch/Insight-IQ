import { execSync } from 'child_process';

console.log('Running Vite SPA build for Vercel...');
execSync('npx vite build --config vite.config.spa.ts', { stdio: 'inherit' });
console.log('Build complete! Ready for Vercel deployment.');
