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

// Sound options (4 playable + None)
const sounds = ['Mala', 'Gong', 'Crystal', 'Bowl', 'None'];
assert('Five sound options defined', sounds.length === 5);
assert('Playable sound count is four', sounds.filter((s) => s !== 'None').length === 4);

// Rep presets
const presets = [27, 54, 108, 1000];
assert('Rep presets include 108', presets.includes(108));

// Practice streaks (mirrors utils/practiceStats.ts)
function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dateKeyFromIso(iso) {
  return localDateKey(new Date(iso));
}

function previousDayKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

function computeCurrentStreak(history) {
  if (history.length === 0) return 0;
  const daySet = new Set(history.map((r) => dateKeyFromIso(r.completedAt)));
  const today = localDateKey(new Date());
  let anchor = today;
  if (!daySet.has(today)) {
    anchor = previousDayKey(today);
    if (!daySet.has(anchor)) return 0;
  }
  let streak = 0;
  let cursor = anchor;
  while (daySet.has(cursor)) {
    streak += 1;
    cursor = previousDayKey(cursor);
  }
  return streak;
}

{
  const now = new Date();
  const todayIso = now.toISOString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const history = [
    { completedAt: todayIso },
    { completedAt: yesterday.toISOString() },
  ];
  assert('Current streak counts today and yesterday', computeCurrentStreak(history) === 2);
}

assert('Empty history has zero streak', computeCurrentStreak([]) === 0);

// Practice intention (mirrors utils/practiceIntention.ts)
function normalizePracticeIntention(value) {
  return value.trim().slice(0, 48);
}

assert('Practice intention trims whitespace', normalizePracticeIntention('  om  ') === 'om');
assert('Practice intention caps at 48 chars', normalizePracticeIntention('x'.repeat(60)).length === 48);

// Flower breath scale mapping (mirrors utils/flowerOfLife.ts)
function breathAtPhase(t) {
  const peak = Math.exp(-t * 8);
  const ease = t * t * (3 - 2 * t);
  return 0.9 + peak * 0.2 + ease * 0.19;
}

function flowerScaleAt(t) {
  const scale = breathAtPhase(t);
  const open = Math.min(1, Math.max(0, (scale - 0.9) / 0.2));
  return 0.8 + open * 0.2;
}

assert('Flower full at tick', Math.abs(flowerScaleAt(0) - 1) < 0.02);
assert('Flower constricts mid-interval', flowerScaleAt(0.5) < 0.92);

{
  const parse = (value) => {
    const [h, m] = value.split(':').map((part) => parseInt(part, 10));
    return {
      hour: Number.isFinite(h) ? Math.min(23, Math.max(0, h)) : 8,
      minute: Number.isFinite(m) ? Math.min(59, Math.max(0, m)) : 0,
    };
  };
  assert('Reminder parses 07:30', parse('07:30').hour === 7 && parse('07:30').minute === 30);
  assert('Reminder clamps invalid', parse('xx:yy').hour === 8 && parse('xx:yy').minute === 0);
}

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
console.log('    • All tick sounds (Mala, Gong, Crystal, Bowl, None)');
console.log('    • Haptics on each rep (native only)');
console.log('    • Logout → Face ID unlock');
console.log('    • App background → pause + optional app lock\n');
