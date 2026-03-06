# Known Issues

## Pre-existing Issues (Not Fixed)
- fileService.test.ts: Concurrent read/write test fails (not related to our fixes)

## Code Review Warnings (Minor)
1. TaskInput.tsx: Redundant condition at line 516
2. actorStore.ts: Duplicate state setting in error path
3. trajectoryStore.ts: [FIXED] Missing isLoading reset

## Future Improvements
- Add component-level error boundaries
- Add retry logic for persistence failures
- Optimize re-render performance
- Add keyboard shortcuts documentation
