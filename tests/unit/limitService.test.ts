/**
 * File Purpose: Test daily limit enforcement (per-type limits)
 * Critical Paths:
 *   - Per-type limit detection (hybrid: 7, non-agentic: 7, agentic: unlimited)
 *   - Daily reset logic based on date change
 *   - Blur trigger when limit reached per type
 *   - Button disabling when limit reached per type
 * Edge Cases:
 *   - Midnight boundary crossing
 *   - Timezone changes
 *   - System clock adjustments
 *   - Limit at exactly 7 (boundary) for hybrid/non-agentic
 *   - Limit at 6 (one below boundary)
 *   - Limit at 8 (one above boundary)
 */

import { describe, it, expect } from 'vitest';
import {
  checkLimitReachedForType,
  checkHybridLimitReached,
  checkNonAgenticLimitReached,
  checkAgenticLimitReached,
  incrementTaskCount,
  resetIfNeeded,
  getRemainingForType,
  getHybridRemaining,
  getNonAgenticRemaining,
  getAgenticRemaining,
  HYBRID_DAILY_LIMIT,
  NON_AGENTIC_DAILY_LIMIT,
  shouldShowBlurForType,
  shouldDisableButtonsForType,
  formatDateKey,
  isSameDay,
  DAILY_TASK_LIMIT,
} from '../../src/services/limitService';
import { TaskType } from '../../src/types/task';
import type { LimitState } from '../../src/services/limitService';

describe('LimitService', () => {
  describe('checkHybridLimitReached', () => {
    it('should return false when hybridCompletedToday is 0', () => {
      const state = createMockLimitState({ hybridCompletedToday: 0 });
      const result = checkHybridLimitReached(state, new Date());
      expect(result).toBe(false);
    });

    it('should return false when hybridCompletedToday is 6', () => {
      const state = createMockLimitState({ hybridCompletedToday: 6 });
      const result = checkHybridLimitReached(state, new Date());
      expect(result).toBe(false);
    });

    it('should return true when hybridCompletedToday is 7', () => {
      const state = createMockLimitState({ hybridCompletedToday: 7 });
      const result = checkHybridLimitReached(state, new Date());
      expect(result).toBe(true);
    });

    it('should return true when hybridCompletedToday exceeds 7', () => {
      const state = createMockLimitState({ hybridCompletedToday: 10 });
      const result = checkHybridLimitReached(state, new Date());
      expect(result).toBe(true);
    });
  });

  describe('checkNonAgenticLimitReached', () => {
    it('should return false when nonAgenticCompletedToday is 0', () => {
      const state = createMockLimitState({ nonAgenticCompletedToday: 0 });
      const result = checkNonAgenticLimitReached(state, new Date());
      expect(result).toBe(false);
    });

    it('should return false when nonAgenticCompletedToday is 6', () => {
      const state = createMockLimitState({ nonAgenticCompletedToday: 6 });
      const result = checkNonAgenticLimitReached(state, new Date());
      expect(result).toBe(false);
    });

    it('should return true when nonAgenticCompletedToday is 7', () => {
      const state = createMockLimitState({ nonAgenticCompletedToday: 7 });
      const result = checkNonAgenticLimitReached(state, new Date());
      expect(result).toBe(true);
    });
  });

  describe('checkAgenticLimitReached', () => {
    it('should always return false (unlimited)', () => {
      const state = createMockLimitState({ agenticCompletedToday: 999 });
      const result = checkAgenticLimitReached(state, new Date());
      expect(result).toBe(false);
    });
  });

  describe('checkLimitReachedForType', () => {
    it('should check hybrid limit for HYBRID type', () => {
      const state = createMockLimitState({ hybridCompletedToday: 7 });
      const result = checkLimitReachedForType(state, new Date(), TaskType.HYBRID);
      expect(result).toBe(true);
    });

    it('should check non-agentic limit for NON_AGENTIC type', () => {
      const state = createMockLimitState({ nonAgenticCompletedToday: 7 });
      const result = checkLimitReachedForType(state, new Date(), TaskType.NON_AGENTIC);
      expect(result).toBe(true);
    });

    it('should return false for AGENTIC type', () => {
      const state = createMockLimitState({ agenticCompletedToday: 999 });
      const result = checkLimitReachedForType(state, new Date(), TaskType.AGENTIC);
      expect(result).toBe(false);
    });
  });

  describe('incrementTaskCount', () => {
    it('should increment hybridCompletedToday for HYBRID type', () => {
      const state = createMockLimitState({ hybridCompletedToday: 3 });
      const result = incrementTaskCount(state, new Date(), TaskType.HYBRID);
      expect(result.hybridCompletedToday).toBe(4);
    });

    it('should increment nonAgenticCompletedToday for NON_AGENTIC type', () => {
      const state = createMockLimitState({ nonAgenticCompletedToday: 2 });
      const result = incrementTaskCount(state, new Date(), TaskType.NON_AGENTIC);
      expect(result.nonAgenticCompletedToday).toBe(3);
    });

    it('should increment agenticCompletedToday for AGENTIC type', () => {
      const state = createMockLimitState({ agenticCompletedToday: 5 });
      const result = incrementTaskCount(state, new Date(), TaskType.AGENTIC);
      expect(result.agenticCompletedToday).toBe(6);
    });

    it('should set hybridLimitReached when reaching hybrid limit', () => {
      const state = createMockLimitState({ hybridCompletedToday: 6, hybridLimitReached: false });
      const result = incrementTaskCount(state, new Date(), TaskType.HYBRID);
      expect(result.hybridCompletedToday).toBe(7);
      expect(result.hybridLimitReached).toBe(true);
    });

    it('should set nonAgenticLimitReached when reaching non-agentic limit', () => {
      const state = createMockLimitState({ nonAgenticCompletedToday: 6, nonAgenticLimitReached: false });
      const result = incrementTaskCount(state, new Date(), TaskType.NON_AGENTIC);
      expect(result.nonAgenticCompletedToday).toBe(7);
      expect(result.nonAgenticLimitReached).toBe(true);
    });

    it('should reset counters if date has changed', () => {
      const state = createMockLimitState({
        hybridCompletedToday: 5,
        lastResetDate: '2024-01-14'
      });
      const currentDate = new Date('2024-01-15');
      const result = incrementTaskCount(state, currentDate, TaskType.HYBRID);
      // Should reset then increment: 0 + 1 = 1
      expect(result.hybridCompletedToday).toBe(1);
      expect(result.lastResetDate).toBe('2024-01-15');
    });
  });

  describe('resetIfNeeded', () => {
    it('should reset when date has changed to next day', () => {
      const state = createMockLimitState({
        lastResetDate: '2024-01-14',
        hybridCompletedToday: 5,
        nonAgenticCompletedToday: 3
      });
      const currentDate = new Date('2024-01-15');
      const result = resetIfNeeded(state, currentDate);
      expect(result.hybridCompletedToday).toBe(0);
      expect(result.nonAgenticCompletedToday).toBe(0);
      expect(result.agenticCompletedToday).toBe(0);
      expect(result.lastResetDate).toBe('2024-01-15');
    });

    it('should not reset when date is same day', () => {
      const state = createMockLimitState({
        lastResetDate: '2024-01-15',
        hybridCompletedToday: 5
      });
      const currentDate = new Date('2024-01-15');
      const result = resetIfNeeded(state, currentDate);
      expect(result.hybridCompletedToday).toBe(5);
      expect(result.lastResetDate).toBe('2024-01-15');
    });

    it('should reset at midnight boundary', () => {
      const state = createMockLimitState({
        lastResetDate: '2024-01-15',
        hybridCompletedToday: 7,
        hybridLimitReached: true
      });
      const currentDate = new Date('2024-01-16');
      const result = resetIfNeeded(state, currentDate);
      expect(result.hybridCompletedToday).toBe(0);
      expect(result.hybridLimitReached).toBe(false);
    });

    it('should handle year boundary (Dec 31 to Jan 1)', () => {
      const state = createMockLimitState({
        lastResetDate: '2023-12-31',
        hybridCompletedToday: 5
      });
      const currentDate = new Date('2024-01-01');
      const result = resetIfNeeded(state, currentDate);
      expect(result.hybridCompletedToday).toBe(0);
      expect(result.lastResetDate).toBe('2024-01-01');
    });
  });

  describe('getHybridRemaining', () => {
    it('should return 7 when no hybrid tasks completed', () => {
      const state = createMockLimitState({ hybridCompletedToday: 0 });
      const result = getHybridRemaining(state, new Date());
      expect(result).toBe(7);
    });

    it('should return 1 when 6 hybrid tasks completed', () => {
      const state = createMockLimitState({ hybridCompletedToday: 6 });
      const result = getHybridRemaining(state, new Date());
      expect(result).toBe(1);
    });

    it('should return 0 when 7 hybrid tasks completed', () => {
      const state = createMockLimitState({ hybridCompletedToday: 7 });
      const result = getHybridRemaining(state, new Date());
      expect(result).toBe(0);
    });

    it('should return 0 when more than 7 hybrid tasks completed', () => {
      const state = createMockLimitState({ hybridCompletedToday: 10 });
      const result = getHybridRemaining(state, new Date());
      expect(result).toBe(0);
    });
  });

  describe('getNonAgenticRemaining', () => {
    it('should return 7 when no non-agentic tasks completed', () => {
      const state = createMockLimitState({ nonAgenticCompletedToday: 0 });
      const result = getNonAgenticRemaining(state, new Date());
      expect(result).toBe(7);
    });

    it('should return 0 when 7 non-agentic tasks completed', () => {
      const state = createMockLimitState({ nonAgenticCompletedToday: 7 });
      const result = getNonAgenticRemaining(state, new Date());
      expect(result).toBe(0);
    });
  });

  describe('getAgenticRemaining', () => {
    it('should return Infinity (unlimited)', () => {
      const state = createMockLimitState({ agenticCompletedToday: 999 });
      const result = getAgenticRemaining(state, new Date());
      expect(result).toBe(Infinity);
    });
  });

  describe('getRemainingForType', () => {
    it('should return hybrid remaining for HYBRID type', () => {
      const state = createMockLimitState({ hybridCompletedToday: 3 });
      const result = getRemainingForType(state, new Date(), TaskType.HYBRID);
      expect(result).toBe(4);
    });

    it('should return non-agentic remaining for NON_AGENTIC type', () => {
      const state = createMockLimitState({ nonAgenticCompletedToday: 2 });
      const result = getRemainingForType(state, new Date(), TaskType.NON_AGENTIC);
      expect(result).toBe(5);
    });

    it('should return Infinity for AGENTIC type', () => {
      const state = createMockLimitState({ agenticCompletedToday: 999 });
      const result = getRemainingForType(state, new Date(), TaskType.AGENTIC);
      expect(result).toBe(Infinity);
    });
  });

  describe('shouldShowBlurForType', () => {
    it('should return true when hybrid limit reached', () => {
      const state = createMockLimitState({ hybridCompletedToday: 7 });
      const result = shouldShowBlurForType(state, new Date(), TaskType.HYBRID);
      expect(result).toBe(true);
    });

    it('should return false when hybrid limit not reached', () => {
      const state = createMockLimitState({ hybridCompletedToday: 3 });
      const result = shouldShowBlurForType(state, new Date(), TaskType.HYBRID);
      expect(result).toBe(false);
    });
  });

  describe('shouldDisableButtonsForType', () => {
    it('should return true when non-agentic limit reached', () => {
      const state = createMockLimitState({ nonAgenticCompletedToday: 7 });
      const result = shouldDisableButtonsForType(state, new Date(), TaskType.NON_AGENTIC);
      expect(result).toBe(true);
    });

    it('should return false for agentic (unlimited)', () => {
      const state = createMockLimitState({ agenticCompletedToday: 999 });
      const result = shouldDisableButtonsForType(state, new Date(), TaskType.AGENTIC);
      expect(result).toBe(false);
    });
  });

  describe('formatDateKey', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-03-15');
      const result = formatDateKey(date);
      expect(result).toBe('2024-03-15');
    });

    it('should pad single digit months and days', () => {
      const date = new Date('2024-01-05');
      const result = formatDateKey(date);
      expect(result).toBe('2024-01-05');
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date('2024-03-15T10:00:00');
      const date2 = new Date('2024-03-15T20:00:00');
      const result = isSameDay(date1, date2);
      expect(result).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2024-03-15');
      const date2 = new Date('2024-03-16');
      const result = isSameDay(date1, date2);
      expect(result).toBe(false);
    });
  });

  describe('Constants', () => {
    it('HYBRID_DAILY_LIMIT should be 7', () => {
      expect(HYBRID_DAILY_LIMIT).toBe(7);
    });

    it('NON_AGENTIC_DAILY_LIMIT should be 7', () => {
      expect(NON_AGENTIC_DAILY_LIMIT).toBe(7);
    });

    it('DAILY_TASK_LIMIT should be 7 (equals HYBRID_DAILY_LIMIT)', () => {
      expect(DAILY_TASK_LIMIT).toBe(7);
    });
  });
});

// Test helper for creating mock LimitState with per-type counters
function createMockLimitState(overrides: Partial<LimitState> = {}): LimitState {
  const today = new Date().toISOString().split('T')[0];
  return {
    agenticCompletedToday: 0,
    hybridCompletedToday: 0,
    nonAgenticCompletedToday: 0,
    lastResetDate: today,
    hybridLimitReached: false,
    nonAgenticLimitReached: false,
    ...overrides
  };
}
