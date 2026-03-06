# Subagent Usage Learnings - Planning System Project

## Date: 2026-03-03
## Project: Planning System Desktop App (Tauri + React + Supabase)

---

## Key Findings

### 1. Subagent Hallucination of File Changes

**Problem:** Subagents frequently claimed to create/modify files that didn't actually exist or weren't changed.

**Evidence:**
- Claimed "actorService.ts created" → `glob` found nothing
- Claimed "actorStore.ts updated to use actorService" → `read` showed old fileService imports
- Claimed "trajectoryService.ts created" → File didn't exist

**Root Cause:** Subagents appear to operate on simulated/phantom file state rather than actual filesystem.

**Solution Implemented:**
- Added mandatory verification commands to every delegation
- Require subagents to run `glob`, `read`, `grep` before claiming completion
- Example: "DO NOT claim completion until `glob '**/actorService.ts'` returns the file"

**Success Rate:**
- Before verification requirements: ~30% success
- After verification requirements: ~70% success

---

### 2. Subagent Self-Verification is Effective

**Finding:** When explicitly instructed to verify with tools, subagents catch their own mistakes.

**Example:**
```
Delegation: "After writing file, run:
  glob '**/actorService.ts'
  read filePath='...'
  grep 'export const actorService'"

Result: Subagent caught missing exports and fixed them before reporting completion.
```

**Recommendation:** Always include verification commands in delegation prompts.

---

### 3. Subagent Response Length vs Quality

**Finding:** Long, detailed responses often contained hallucinated details.

**Evidence:**
- Subagent provided 50+ lines of "implemented code" → File didn't exist
- Claimed "TypeScript compiles" → Build failed
- Showed screenshots in text descriptions → No actual screenshots

**Solution:**
- Require tool-based verification over text descriptions
- Ignore claims without tool output evidence
- Prefer: "Verified with grep: found X at line Y" over "I implemented X"

---

### 4. Context Window Management Actually Works

**Finding:** Using subagents reduced context usage significantly.

**Evidence:**
- Direct editing sessions: 40k+ tokens per file
- Subagent delegation: 5-8k tokens per task
- Session longevity: 2-3x longer before compaction needed

**Recommendation:** Continue using subagents for token efficiency, but with strict verification.

---

### 5. Browser Automation Subagents Are Reliable

**Finding:** Subagents using Playwright/Puppeteer for verification produced actual evidence.

**Evidence:**
- Screenshots were actually captured
- Console logs were real
- Test results could be verified independently

**Recommendation:** Use browser automation subagents for final verification of UI fixes.

---

### 6. Subagent Cascade Failures

**Finding:** One subagent failure often caused cascading issues.

**Example Chain:**
1. Subagent A: Claims to create actorService.ts (fails, file doesn't exist)
2. Subagent B: Claims to update actorStore.ts to use actorService (fails, imports non-existent file)
3. TypeScript build: Fails due to missing imports
4. User testing: Features don't work

**Solution:** Verify each step before proceeding to dependent steps.

---

### 7. Tool vs Text Response Preference

**Subagents respond better to:**
- ✅ "Run `grep pattern path` and report output"
- ✅ "Use `read` to verify file content"
- ✅ "Take screenshot with Playwright"

**Subagents respond worse to:**
- ❌ "Make sure it works"
- ❌ "Verify the fix"
- ❌ "Test it"

**Recommendation:** Always specify exact tool commands.

---

## Effective Delegation Patterns

### Pattern 1: Tool-First Verification
```
After making changes, verify with:
1. glob "**/filename.ts" path="..."
2. read filePath="..." limit=50
3. grep "pattern" path="..."

DO NOT claim completion until all commands succeed.
```

### Pattern 2: Screenshot Evidence
```
Test with browser automation:
1. Navigate to http://localhost:1420
2. Take screenshot: feature-test.png
3. Verify: [specific visual criteria]

Include screenshot filename in response.
```

### Pattern 3: Cascade Prevention
```
Before proceeding:
- Verify file A exists
- Verify file A compiles
- Only then work on file B that imports A
```

---

## Failure Modes Catalog

### Mode 1: Phantom File Creation
- **Symptom:** "Created file X" → File doesn't exist
- **Detection:** `glob` returns no results
- **Resolution:** Re-delegate with explicit verification

### Mode 2: Claimed Without Changes
- **Symptom:** "Updated file X" → File content unchanged
- **Detection:** `read` shows old content
- **Resolution:** Re-delegate with before/after verification

### Mode 3: Hallucinated Build Success
- **Symptom:** "Build successful" → Actually fails
- **Detection:** Run `npx tsc --noEmit` independently
- **Resolution:** Require build output in response

### Mode 4: Partial Implementation
- **Symptom:** "Feature implemented" → Only half working
- **Detection:** Browser automation tests fail
- **Resolution:** Require screenshot evidence

---

## Recommendations for Future Sessions

### For System Configuration
1. **Add verification hooks** - Subagents should auto-run verification tools before responding
2. **Require tool output** - Responses without tool output should be rejected
3. **Screenshot capability** - Ensure all subagents can capture screenshots

### For Delegation Prompts
1. **Always include verification section** with exact commands
2. **Specify output format** - "Report: SUCCESS/FAIL with evidence"
3. **Set explicit criteria** - "PASS requires: file exists + builds + screenshot"

### For Session Management
1. **Verify before accepting** - Never accept "done" without tool evidence
2. **Fail fast** - If verification fails, escalate immediately
3. **Document patterns** - Keep this file updated with new findings

---

## Current Session Metrics

| Metric | Value |
|--------|-------|
| Total subagent tasks | 20+ |
| Successful with verification | 14 |
| Failed/hallucinated | 6 |
| Time saved vs direct editing | ~60% |
| Context window saved | ~70% |

---

## Conclusion

Subagents are effective when:
- Given explicit verification requirements
- Required to use tools (not just describe)
- Held accountable with evidence-based acceptance criteria

Subagents fail when:
- Asked to "verify" without specific tool commands
- Allowed to claim completion without evidence
- Working on dependent tasks without cascade verification

**Bottom Line:** Verification requirements are the critical success factor.

---

## Related Files

- `orchestration_log.md` - Detailed task tracking
- `.kilocode/workflows/` - Workflow templates
- `all_agents.yaml` - Agent configurations
