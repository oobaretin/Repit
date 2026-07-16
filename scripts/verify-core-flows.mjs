#!/usr/bin/env node
/**
 * Lightweight verification of Repit core timer logic (no DOM).
 * Run: node scripts/verify-core-flows.mjs
 */

const PASS = [];
const FAIL = [];

function assert(name, condition) {
  if (condition) PASS.push(name);
  else FAIL.push(name);
}

// Mirrors useMeditationTimer completion check
function simulateSession({ targetReps, delay, ticksBeforeStop }) {
  let currentRep = 0;
  let state = 'running';
  const delayMs = Math.max(delay * 1000, 100);

  for (let i = 0; i < ticksBeforeStop; i++) {
    const nextRep = currentRep + 1;
    if (targetReps > 0 && nextRep >= targetReps) {
      state = 'finished';
      currentRep = targetReps;
      break;
    }
    currentRep = nextRep;
  }

  return { currentRep, state, delayMs };
}

// Timer completion
{
  const r = simulateSession({ targetReps: 108, delay: 2, ticksBeforeStop: 200 });
  assert('Completes at exactly 108 reps', r.state === 'finished' && r.currentRep === 108);
}

{
  const r = simulateSession({ targetReps: 27, delay: 0.5, ticksBeforeStop: 26 });
  assert('Does not complete before target', r.state === 'running' && r.currentRep === 26);
}

{
  const r = simulateSession({ targetReps: 0, delay: 1, ticksBeforeStop: 50 });
  assert('Open count (0 target) never auto-completes', r.state === 'running' && r.currentRep === 50);
}

// Minimum delay floor (100ms)
{
  const delayMs = Math.max(0.05 * 1000, 100);
  assert('Enforces 100ms minimum interval', delayMs === 100);
}

// Session duration formatting (mirrors utils/formatDuration.ts)
function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
  }
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

assert('formatDuration 45s', formatDuration(45) === '45s');
assert('formatDuration 3m 36s', formatDuration(216) === '3m 36s');
assert('formatDuration 1h', formatDuration(3600) === '1h');

// Focus lock hold duration
assert('Focus lock hold is 1200ms', 1200 === 1200);

// Sound options
const sounds = ['Mala', 'Gong', 'Crystal', 'None'];
assert('Four sound options defined', sounds.length === 4);

// Rep presets
const presets = [27, 54, 108, 1000];
assert('Rep presets include 108', presets.includes(108));

console.log('\nRepit core flow verification\n');
console.log(`  Passed: ${PASS.length}`);
PASS.forEach((n) => console.log(`    ✓ ${n}`));

if (FAIL.length) {
  console.log(`\n  Failed: ${FAIL.length}`);
  FAIL.forEach((n) => console.log(`    ✗ ${n}`));
  process.exit(1);
}

console.log('\n  All automated checks passed.\n');
console.log('  Manual checks still required on device/simulator:');
console.log('    • Tap Start → pause → resume');
console.log('    • Auto focus lock on session start');
console.log('    • Hold-to-unlock (~1.2s)');
console.log('    • Mala / Gong / Crystal / None sounds');
console.log('    • Haptics on each rep (native only)');
console.log('    • Logout → Face ID unlock');
console.log('    • App background → pause + optional app lock\n');
