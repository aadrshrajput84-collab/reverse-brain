import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getReverseDirection,
  getOppositeColor,
  getOppositeNumber,
  calculateScore,
  getSpeedTimeLimit,
  getExpectedReverseSequence,
  validateMemoryStep,
  canClaimDailyReward,
  generateDailyRound,
  COLOR_DEFS,
  getCognitiveRank,
} from './rules';
import { Direction } from './types';

test('direction reversal is bidirectional and exact', () => {
  assert.equal(getReverseDirection('UP'), 'DOWN');
  assert.equal(getReverseDirection('DOWN'), 'UP');
  assert.equal(getReverseDirection('LEFT'), 'RIGHT');
  assert.equal(getReverseDirection('RIGHT'), 'LEFT');
});

test('color reversal maps symmetrically across all defined pairs', () => {
  assert.equal(getOppositeColor('cyan'), 'magenta');
  assert.equal(getOppositeColor('magenta'), 'cyan');
  assert.equal(getOppositeColor('yellow'), 'blue');
  assert.equal(getOppositeColor('blue'), 'yellow');
  assert.equal(getOppositeColor('green'), 'purple');
  assert.equal(getOppositeColor('purple'), 'green');
});

test('number reversal correctly maps complement pairs summing to 10', () => {
  assert.equal(getOppositeNumber(1), 9);
  assert.equal(getOppositeNumber(9), 1);
  assert.equal(getOppositeNumber(2), 8);
  assert.equal(getOppositeNumber(8), 2);
  assert.equal(getOppositeNumber(3), 7);
  assert.equal(getOppositeNumber(7), 3);
  assert.equal(getOppositeNumber(4), 6);
  assert.equal(getOppositeNumber(6), 4);
  assert.equal(getOppositeNumber(5), 5);
});

test('score calculation scales fairly with combo streaks', () => {
  // Combo 0-2: 1x (10 pts)
  assert.equal(calculateScore(10, 0), 10);
  assert.equal(calculateScore(10, 2), 10);
  // Combo 3-5: 1.5x (15 pts)
  assert.equal(calculateScore(10, 3), 15);
  // Combo 6-8: 2x (20 pts)
  assert.equal(calculateScore(10, 6), 20);
});

test('speed time limit reduces appropriately with a floor safeguard', () => {
  assert.equal(getSpeedTimeLimit(0), 2.5);
  assert.equal(getSpeedTimeLimit(5), 2.25);
  assert.equal(getSpeedTimeLimit(10), 2.0);
  assert.equal(getSpeedTimeLimit(15), 1.75);
  assert.equal(getSpeedTimeLimit(100), 0.75); // hit 0.75s floor
});

test('memory reverse sequence validation works accurately', () => {
  const sequence: Direction[] = ['UP', 'RIGHT', 'DOWN'];
  const expectedReverse = getExpectedReverseSequence(sequence);
  assert.deepEqual(expectedReverse, ['DOWN', 'RIGHT', 'UP']);

  // First input is correct (DOWN)
  const step1 = validateMemoryStep(sequence, ['DOWN']);
  assert.equal(step1.isCorrectSoFar, true);
  assert.equal(step1.isCompleted, false);

  // Second input is correct (RIGHT)
  const step2 = validateMemoryStep(sequence, ['DOWN', 'RIGHT']);
  assert.equal(step2.isCorrectSoFar, true);
  assert.equal(step2.isCompleted, false);

  // Third input completes sequence (UP)
  const step3 = validateMemoryStep(sequence, ['DOWN', 'RIGHT', 'UP']);
  assert.equal(step3.isCorrectSoFar, true);
  assert.equal(step3.isCompleted, true);

  // Wrong input fails immediately
  const stepFail = validateMemoryStep(sequence, ['UP']);
  assert.equal(stepFail.isCorrectSoFar, false);
});

test('daily reward claim gating prevents same-day duplicates', () => {
  assert.equal(canClaimDailyReward('2026-11-04', '2026-11-05'), true);
  assert.equal(canClaimDailyReward('2026-11-05', '2026-11-05'), false);
  assert.equal(canClaimDailyReward(null, '2026-11-05'), true);
});

test('daily challenge generates valid deterministically seeded rounds', () => {
  const round0 = generateDailyRound(0, '2026-11-05');
  const round0Repeat = generateDailyRound(0, '2026-11-05');
  assert.deepEqual(round0, round0Repeat);
  assert.ok(round0.options.includes(round0.correctAnswer));
});

test('cognitive rank categorizes scores and combos with high fidelity', () => {
  const rankGodlike = getCognitiveRank(96, 12);
  assert.equal(rankGodlike.rank, 'S+');

  const rankMaster = getCognitiveRank(92, 4);
  assert.equal(rankMaster.rank, 'S');

  const rankExpert = getCognitiveRank(85, 3);
  assert.equal(rankExpert.rank, 'A');

  const rankAdept = getCognitiveRank(70, 2);
  assert.equal(rankAdept.rank, 'B');

  const rankApprentice = getCognitiveRank(50, 1);
  assert.equal(rankApprentice.rank, 'C');
});

test('daily challenge completion awards coins once per calendar date and prevents duplicates', async () => {
  const { completeDailyChallenge } = await import('../utils/storage.ts');
  const baseStats = {
    coins: 100,
    highScores: { classic: 0, color: 0, number: 0, speed: 0, memory: 0, daily: 0 },
    gamesPlayed: 0,
    totalCorrectAnswers: 0,
    bestCombo: 0,
    unlockedThemes: ['violet' as const],
    equippedTheme: 'violet' as const,
    lastDailyCompletedDate: null,
    dailyStreak: 0,
    soundEnabled: true,
    bgmEnabled: true,
    vibrationEnabled: true,
    mobileFrameMode: false,
  };

  // First completion on 2026-11-05
  const res1 = completeDailyChallenge(baseStats, '2026-11-05', 100);
  assert.equal(res1.coinsAwarded, 100);
  assert.equal(res1.stats.coins, 200);
  assert.equal(res1.stats.lastDailyCompletedDate, '2026-11-05');
  assert.equal(res1.stats.dailyStreak, 1);

  // Second completion on the SAME date (2026-11-05) -> must award 0 coins, keep streak intact
  const res2 = completeDailyChallenge(res1.stats, '2026-11-05', 100);
  assert.equal(res2.coinsAwarded, 0);
  assert.equal(res2.stats.coins, 200); // no extra coins!
  assert.equal(res2.stats.dailyStreak, 1); // streak not broken!

  // Next day completion on 2026-11-06 -> streak increments to 2
  const res3 = completeDailyChallenge(res2.stats, '2026-11-06', 100);
  assert.equal(res3.coinsAwarded, 100);
  assert.equal(res3.stats.coins, 300);
  assert.equal(res3.stats.dailyStreak, 2);
});


