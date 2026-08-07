#!/usr/bin/env node
/**
 * Tier-1 browser QA via Playwright (production preview build).
 * Run: npm run qa:browser
 */
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const previewPort = 4173;
const baseUrl = `http://127.0.0.1:${previewPort}`;

const PASS = [];
const FAIL = [];

function assert(name, condition) {
  if (condition) PASS.push(name);
  else FAIL.push(name);
}

function startPreview() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', String(previewPort), '--host', '127.0.0.1'], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
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
  }, prefs);
}

async function loadApp(page, prefs = {}) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await applyPrefs(page, {
    'repit-onboardingComplete': 'true',
    'repit-devPremium': 'true',
    'repit-targetReps': '108',
    'repit-delay': '1.5',
    'repit-sound': 'Mala',
    'repit-sessionStats': JSON.stringify({ totalSessions: 2, totalReps: 216, lastSessionAt: null }),
    'repit-sessionHistory': JSON.stringify([]),
    ...prefs,
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
}

async function main() {
  console.log('\nRepit browser QA (Tier 1)\n');

  const preview = await startPreview();
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
    await loadApp(page);
    const idleHeading = page.locator('main h1').first();
    assert('Idle shows target reps (108)', (await idleHeading.textContent())?.includes('108'));
    assert('Adjust practice pill visible', await page.getByText('Adjust practice').isVisible());

    await page.getByRole('button', { name: 'Open settings' }).click();
    await page.getByRole('heading', { name: 'Settings' }).waitFor();
    assert('Settings opens', await page.getByLabel('Mantra or intention').isVisible());
    assert('Rep presets visible', await page.getByRole('button', { name: '108' }).isVisible());
    await page.getByRole('button', { name: 'Back to timer' }).click();

    await loadApp(page, { 'repit-autoFocusLock': 'false' });
    await page.getByRole('button', { name: 'Tap to begin' }).click();
    await page.waitForFunction(
      () => {
        const h = document.querySelector('main h1');
        return h && h.textContent !== '108' && h.textContent !== '0';
      },
      { timeout: 5000 },
    );
    assert('Session starts and rep increments', true);
    assert(
      'Session bar hidden while running',
      !(await page.getByRole('button', { name: 'Restart session' }).isVisible()),
    );

    await page.getByRole('button', { name: /Tap to pause/i }).click();
    assert(
      'Session bar visible when paused',
      await page.getByRole('button', { name: 'Restart session' }).isVisible(),
    );

    // Onboarding rhythm demo
    await loadApp(page, { 'repit-onboardingComplete': 'false', 'repit-devPremium': 'true' });
    assert('Onboarding step 1 headline', await page.getByText('Japa & mala, simplified').isVisible());
    await page.getByRole('button', { name: 'Continue' }).click();
    assert('Onboarding rhythm step copy', await page.getByText('Feel the rhythm').isVisible());
    assert(
      'Onboarding live demo visible',
      await page.locator('.onboarding-rhythm-preview').isVisible(),
    );

    // Paywall when starting session after free tier
    await loadApp(page, {
      'repit-devPremium': 'false',
      'repit-sessionStats': JSON.stringify({ totalSessions: 1, totalReps: 108, lastSessionAt: null }),
      'repit-everPremium': 'false',
    });
    await page.getByRole('button', { name: /Tap to begin/i }).click();
    assert('Paywall after first session', await page.getByText('You finished your first session').isVisible());
    assert('Paywall lists Flower of Life', await page.getByText(/Flower of Life/i).isVisible());
  } finally {
    await browser.close();
    preview.kill('SIGTERM');
  }

  console.log(`  Passed: ${PASS.length}`);
  PASS.forEach((n) => console.log(`    ✓ ${n}`));

  if (FAIL.length) {
    console.log(`\n  Failed: ${FAIL.length}`);
    FAIL.forEach((n) => console.log(`    ✗ ${n}`));
    process.exit(1);
  }

  console.log('\n  All browser checks passed.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
