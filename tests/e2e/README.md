# E2E Tests for Task Planning Application

## Overview

This directory contains Playwright E2E tests for the Tauri + React task planning application.

## Test Coverage

### Task Creation Flow (5 tests)
- Complete 5-step task creation flow
- Step skipping bug fix verification
- Keyboard navigation through all steps
- Escape key cancellation
- Trajectory input validation

### Actor Management (5 tests)
- Add actor using +Actor button
- Remove actor using -Actor button
- Multiple actor additions and removals
- Alert when removing with no actors
- Actor notes capture during task creation

### Trajectory Editing (2 tests)
- Trajectory match value persistence
- Trajectory display in completion summary

### Daily Limit Enforcement (2 tests)
- Daily task limit enforcement
- Blur effect application

### Bug Fix Verification (4 tests)
- Bug 1: valueClass step not skipped
- Bug 2: Null/undefined handling (no white screen)
- Bug 3: Actor buttons functional
- Bug 4: Trajectory match persists

### Edge Cases (4 tests)
- Empty description rejection
- Special character handling
- Very long descriptions
- Rapid step navigation

## Running Tests

```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (visible browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/taskFlow.spec.ts

# Run specific test
npx playwright test -g "should complete full 5-step task creation flow"

# Debug mode
npm run test:e2e:debug
```

## Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:5173` (Vite dev server)
- Browsers: Chromium, Firefox, WebKit
- Screenshots on failure
- Traces on first retry

## Test Structure

Tests use:
- Data attributes and text-based selectors
- Serial execution mode (for isolation)
- LocalStorage clearing before each test
- Appropriate timeouts for CI environments

## Adding New Tests

1. Add test to `taskFlow.spec.ts` or create new `.spec.ts` file
2. Use `test.describe()` for grouping
3. Include reasoning comments explaining the test
4. Follow existing patterns for setup/teardown
