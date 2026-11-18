import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('📦 Validating Manifest V3 extension bundle in dist/...');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist/ directory does not exist. Run "npm run build" first.');
  process.exit(1);
}

// Ensure manifest.json exists in dist
const manifestSrc = path.resolve(rootDir, 'public/manifest.json');
const manifestDest = path.resolve(distDir, 'manifest.json');

if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, manifestDest);
  console.log('✅ manifest.json copied to dist/manifest.json');
} else {
  console.warn('⚠️ public/manifest.json not found!');
}

// Ensure icons folder exists in dist
const iconsSrc = path.resolve(rootDir, 'public/icons');
const iconsDest = path.resolve(distDir, 'icons');
if (fs.existsSync(iconsSrc)) {
  if (!fs.existsSync(iconsDest)) {
    fs.mkdirSync(iconsDest, { recursive: true });
  }
  for (const file of fs.readdirSync(iconsSrc)) {
    fs.copyFileSync(path.resolve(iconsSrc, file), path.resolve(iconsDest, file));
  }
  console.log('✅ Extension icons copied to dist/icons/');
}

console.log('\n🎉 Extension packaging complete!');
console.log('👉 To load in Chromium/Chrome/Brave:');
console.log('   1. Navigate to chrome://extensions');
console.log('   2. Enable "Developer mode" (top right)');
console.log('   3. Click "Load unpacked" and select: /home/tgy/Projects/Dplan/dist');
console.log('\n👉 To load in Firefox:');
console.log('   1. Navigate to about:debugging#/runtime/this-firefox');
console.log('   2. Click "Load Temporary Add-on..."');
console.log('   3. Select: /home/tgy/Projects/Dplan/dist/manifest.json\n');
