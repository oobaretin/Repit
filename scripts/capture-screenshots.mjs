#!/usr/bin/env node
/**
 * Captures App Store screenshots (1290 × 2796) via Playwright at iPhone Pro Max dimensions.
 * Prerequisite: npm run build
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'screenshots');
const previewPort = 4173;
const baseUrl = `http://127.0.0.1:${previewPort}`;

const DEFAULT_PREFS = {
  'repit-targetReps': '108',
  'repit-delay': '1.5',
  'repit-sound': 'Mala',
  'repit-haptics': 'true',
  'repit-autoFocusLock': 'true',
  'repit-lockOnLeave': 'true',
};

mkdirSync(outDir, { recursive: true });

function startPreview() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', String(previewPort), '--host', '127.0.0.1'], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });

    let ready = false;
    const onData = (chunk) => {
      const text = chunk.toString();
      if (!ready && text.includes('Local:')) {
        ready = true;
        resolve(proc);
      }
    };

    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (!ready) reject(new Error(`vite preview exited with code ${code}`));
    });

    setTimeout(() => {
      if (!ready) reject(new Error('Timed out waiting for vite preview'));
    }, 30_000);
  });
}

async function applyPrefs(page, prefs) {
  await page.evaluate((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      localStorage.setItem(key, value);
    }
  }, { ...DEFAULT_PREFS, ...prefs });
}

async function bypassSubscriptionGate(page) {
  await page.evaluate(() => {
    localStorage.setItem('repit-onboardingComplete', 'true');
    localStorage.setItem('repit-devPremium', 'true');
  });
}

async function loadApp(page, prefs = {}) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await applyPrefs(page, prefs);
  await bypassSubscriptionGate(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
}

async function capture(page, filename) {
  await page.waitForTimeout(400);
  await page.screenshot({
    path: join(outDir, filename),
    type: 'png',
    animations: 'disabled',
  });
  console.log(`  ✓ ${filename}`);
}

async function main() {
  console.log('\nRepit App Store screenshot capture\n');

  const preview = await startPreview();
  const device = devices['iPhone 14 Pro Max'];

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: devices['iPhone 14 Pro Max'].userAgent,
    colorScheme: 'dark',
  });

  await context.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --safe-top: 59px;
        --safe-bottom: 34px;
        --safe-left: 0px;
        --safe-right: 0px;
      }
    `;
    document.documentElement.appendChild(style);
  });

  const page = await context.newPage();

  try {
    console.log('1/6 Hero — idle');
    await loadApp(page);
    await capture(page, '01-hero-idle.png');

    console.log('2/6 Active session (~24/108)');
    await loadApp(page, { 'repit-delay': '0.4', 'repit-autoFocusLock': 'false' });
    await page.getByRole('button', { name: 'Tap to begin' }).click();
    await page.waitForFunction(
      () => {
        const heading = document.querySelector('main h1');
        const n = parseInt(heading?.textContent?.replace(/,/g, '') ?? '0', 10);
        return n >= 24;
      },
      { timeout: 45_000 }
    );
    await page.waitForTimeout(800);
    await capture(page, '02-session-active.png');

    console.log('3/6 Focus lock');
    await loadApp(page, { 'repit-delay': '2', 'repit-autoFocusLock': 'true' });
    await page.getByRole('button', { name: 'Tap to begin' }).click();
    await page.getByRole('button', { name: 'Hold to exit practice mode' }).waitFor({ timeout: 5000 });
    await page.waitForTimeout(500);
    await capture(page, '03-focus-lock.png');

    console.log('4/6 Settings');
    await loadApp(page);
    await page.getByRole('button', { name: 'Open settings' }).click();
    await page.getByRole('heading', { name: 'Tick sound' }).waitFor();
    await page.getByRole('heading', { name: 'Tick sound' }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await capture(page, '04-settings.png');

    console.log('5/6 Session complete');
    await loadApp(page, { 'repit-targetReps': '27', 'repit-delay': '0.5' });
    await page.getByRole('button', { name: 'Tap to begin' }).click();
    await page.getByRole('heading', { name: 'Well done' }).waitFor({ timeout: 25_000 });
    await page.waitForTimeout(500);
    await capture(page, '05-session-complete.png');

    console.log('6/6 Welcome splash (optional)');
    await loadApp(page);
    await page.getByRole('button', { name: 'Open settings' }).click();
    await page.getByRole('button', { name: 'Lock now' }).click();
    await page.getByText('Welcome back').waitFor();
    await page.waitForTimeout(800);
    await capture(page, '06-welcome-splash-optional.png');

    console.log(`\nSaved 6 screenshots to ${outDir}\n`);
  } finally {
    await browser.close();
    preview.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
