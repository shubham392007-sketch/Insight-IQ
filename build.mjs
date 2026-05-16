import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

console.log('Running vite build...');
execSync('npx vite build', { stdio: 'inherit' });

console.log('Restructuring dist folder for Vercel Build Output API...');
const clientDir = path.join('dist', 'client');
const vercelOutputDir = path.join('.vercel', 'output');
const vercelStaticDir = path.join(vercelOutputDir, 'static');

if (fs.existsSync(clientDir)) {
  fs.mkdirSync(vercelStaticDir, { recursive: true });
  
  // Copy all files from dist/client to .vercel/output/static
  const files = fs.readdirSync(clientDir);
  for (const file of files) {
    const src = path.join(clientDir, file);
    const dest = path.join(vercelStaticDir, file);
    fs.cpSync(src, dest, { recursive: true });
  }
  
  // Write Vercel routing configuration
  const vercelConfig = {
    version: 3,
    routes: [
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html" }
    ]
  };
  fs.writeFileSync(
    path.join(vercelOutputDir, 'config.json'),
    JSON.stringify(vercelConfig, null, 2)
  );

  console.log('Successfully generated .vercel/output for Vercel deployment!');
}
