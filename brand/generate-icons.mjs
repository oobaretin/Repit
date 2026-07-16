import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svgPath = path.join(__dirname, 'icon-primary.svg');
const appIconDir = path.join(root, 'ios/App/App/Assets.xcassets/AppIcon.appiconset');
const splashDir = path.join(root, 'ios/App/App/Assets.xcassets/Splash.imageset');
const publicDir = path.join(root, 'public');

await mkdir(publicDir, { recursive: true });

const icon1024 = await sharp(svgPath).resize(1024, 1024).png().toBuffer();
await sharp(icon1024).toFile(path.join(appIconDir, 'AppIcon-512@2x.png'));

const splash2732 = await sharp({
  create: {
    width: 2732,
    height: 2732,
    channels: 4,
    background: { r: 6, g: 9, b: 18, alpha: 1 },
  },
})
  .composite([
    {
      input: await sharp(svgPath).resize(640, 640).png().toBuffer(),
      gravity: 'centre',
    },
  ])
  .png()
  .toBuffer();

for (const name of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
  await sharp(splash2732).toFile(path.join(splashDir, name));
}

await sharp(icon1024).resize(512, 512).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
await copyFile(svgPath, path.join(publicDir, 'icon.svg'));

console.log('Generated AppIcon, splash screens, and public icons.');
