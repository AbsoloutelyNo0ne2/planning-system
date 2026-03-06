# ADR-002: Data Storage — JSON Files vs SQLite vs Other Storage

## Status
Accepted

## Context
<!-- 
What is the issue that we're seeing that is motivating this decision or change?
Intent: Document why we need to choose a storage mechanism.
Content will include:
- Application needs persistent storage for tasks, actors, trajectory
- Data is local-only (no cloud sync)
- Data structures are relatively simple (tasks, actors, completed tasks)
- Need to support daily limit state
-->

The application needs to persist data locally without cloud dependencies. Data includes:
- Tasks (description, value class, type, trajectory match, actor notes, timestamps)
- Completed/archived tasks
- Actor definitions
- Current trajectory
- Daily limit state

Key requirements from specification:
- Local-only storage (no cloud)
- JSON file storage mentioned as preference
- Simple data relationships (no complex joins)
- Must support atomic writes to prevent corruption
- Data must be human-readable for debugging

## Decision
<!-- 
What is the change that we're proposing or have agreed to implement?
Intent: State the chosen storage approach clearly.
Content will include:
- JSON files in a data/ directory
- One file per entity type
- Atomic write pattern (write to temp, then rename)
- Tauri file system commands for Rust bridge
-->

We will use **JSON files** stored in a local `data/` directory, with one file per entity type:
- `tasks.json` — Active tasks
- `completed.json` — Archived completed tasks
- `actors.json` — Actor definitions
- `trajectory.json` — Current trajectory
- `limit.json` — Daily limit state

**Storage Pattern:**
- Atomic writes: Write to temporary file, then rename to target
- Pretty-printed JSON for human readability
- UTF-8 encoding
- Files stored in application data directory (via Tauri path API)

**Implementation:**
- TypeScript services (`fileService.ts`) handle serialization/deserialization
- Tauri Rust commands handle actual file system operations
- Error handling for corrupted files (backup/restore)

## Consequences
<!-- 
What becomes easier or more difficult to do because of this change?
Intent: Document practical impacts of JSON file storage.
Content will include:
- Easy to debug and inspect data
- No schema migrations needed
- Potential performance issues with large files
- Atomic write complexity
-->

**Positive Consequences:**
- **Human-readable data**: JSON can be inspected and edited manually for debugging
- **Simple backup**: Files can be copied, versioned with git, synced via Dropbox
- **No schema migrations**: Schema changes are just code changes
- **Zero dependency**: No external database to install or manage
- **Fast reads**: Entire dataset loaded into memory (acceptable for < 10k tasks)
- **Easy testing**: Test fixtures are just JSON files
- **Framework agnostic**: Data format not tied to any ORM or database

**Negative Consequences:**
- **No query language**: Must load entire file to filter; complex queries require manual filtering
- **No transactions**: Application-level coordination needed for multi-file consistency
- **File size limits**: Large task history could impact load times
- **Concurrency**: Single-user only (acceptable for personal tool)
- **Corruption risk**: Power loss during write could corrupt file (mitigated by atomic writes)
- **No indexing**: Sorting and filtering are O(n) operations

**Mitigations for Negative Consequences:**
- **Atomic writes**: Write to `.tmp` file, then rename (atomic on most filesystems)
- **Regular backups**: Keep last N versions of each file
- **Data pruning**: Archive old completed tasks to separate file
- **In-memory caching**: Zustand stores hold working data; files are persistence only

## Alternatives Considered
<!-- 
List at least 2 alternatives with specific trade-offs.
Intent: Show evaluation of other storage options.
Content will include:
- SQLite: structured but adds dependency
- LocalStorage: simple but size-limited
- IndexedDB: browser-based but not file-based
-->

### Alternative 1: SQLite (via Tauri SQLite plugin or libsql)
**Description:** Use SQLite as the embedded database for structured storage.

**Pros:**
- ACID transactions ensure data integrity
- SQL queries for complex filtering and sorting
- Indexing for performance on large datasets
- Schema enforcement
- Single file for all data (or structured files)
- Battle-tested, widely used

**Cons:**
- Additional dependency (SQLite library ~1MB)
- Schema migrations required for changes
- More complex setup (connection management, SQL queries)
- Not human-readable without SQLite browser tool
- Requires Rust SQLite bindings or JavaScript WASM version

**Rejected because:**
1. The specification explicitly prefers JSON file storage
2. Data complexity doesn't justify SQL (no complex joins, no relational constraints)
3. Overkill for personal tool with simple data model
4. Adds complexity without significant benefit for this use case

### Alternative 2: LocalStorage / IndexedDB (via browser APIs)
**Description:** Use browser storage APIs available in the Tauri WebView.

**Pros:**
- Zero setup, built into browser
- IndexedDB has good capacity (hundreds of MB)
- Asynchronous API

**Cons:**
- **LocalStorage:** Limited to ~5-10MB, synchronous (blocks UI)
- **IndexedDB:** Complex API, not file-based (hard to backup externally)
- Data not easily accessible outside the app
- No atomic write guarantees
- Harder to debug (requires browser DevTools)

**Rejected because:**
1. User explicitly wants JSON file storage
2. Files are easier to backup, version, and inspect
3. LocalStorage size limits are too restrictive
4. IndexedDB complexity without file-based benefits

### Alternative 3: Tauri Store Plugin (key-value)
**Description:** Use Tauri's official store plugin for simple key-value persistence.

**Pros:**
- Official Tauri plugin, well-supported
- Simple API (get/set)
- Handles file paths automatically
- JSON serialization built-in

**Cons:**
- Key-value only (no structured queries)
- All data in single file
- Less control over file organization
- Still need to handle serialization for complex objects

**Rejected because:**
1. User preference for separate JSON files
2. Want explicit file organization (one file per entity)
3. Direct file access gives more control for debugging

### Alternative 4: Markdown Files (one file per task)
**Description:** Store each task as a separate Markdown file with YAML frontmatter.

**Pros:**
- Human-readable and editable
- Natural fit for note-taking style
- Git-friendly (diffs show individual task changes)
- Photos/screenshots could be stored alongside

**Cons:**
- File system overhead with many small files
- Slower to load (directory scanning)
- Complex sorting requires loading all files
- No atomic multi-task operations

**Rejected because:**
1. Overhead of file-per-task is unnecessary
2. Sorting and filtering become expensive
3. Daily limit tracking would require scanning multiple files
4. JSON batch operations are simpler

---

## Layer Compliance
- **Layer 1 (Headers):** ✅ Document header with purpose stated
- **Layer 2 (Structure):** ✅ All sections (Status, Context, Decision, Consequences, Alternatives)
- **Layer 3 (Intent):** ✅ Comments indicate what each section will contain

## Quality Self-Assessment

### Acceptance Criteria Verification

1. **All 4 ADR files created with proper format**
   - This file: ADR-002 ✅
   - Other files will be created in parallel

2. **Each ADR presents at least 2 alternatives with trade-offs**
   - ✅ 4 alternatives presented (SQLite, LocalStorage/IndexedDB, Tauri Store, Markdown)
   - Each with detailed Pros/Cons and rejection reasons

3. **Decisions reference specific technical requirements from the project**
   - ✅ References: JSON file preference, local-only requirement, human-readable need, atomic write need
   - Specific files listed (tasks.json, completed.json, etc.)

4. **Consequences section is substantive**
   - ✅ Separated into Positive, Negative with Mitigations
   - Specific technical consequences (O(n) operations, corruption risk, etc.)

5. **All files have Layer 1-3 content**
   - ✅ Layer 1: Header comment explaining document purpose
   - ✅ Layer 2: All required sections present
   - ✅ Layer 3: HTML comments indicating section intent

### Confidence Rating: **High**

**Explanation:** The JSON file decision is straightforward because:
- User explicitly prefers JSON file storage
- Data model is simple (no complex relationships)
- Human readability is a requirement
- Atomic write pattern is well-understood

### Known Gaps / Uncertainties

1. **Exact file paths:** Will use Tauri path API for app data directory, but exact location is platform-dependent
2. **Backup strategy:** How many versions to keep not specified (recommend 10)
3. **Corruption recovery:** Basic error handling planned, but full recovery strategy not detailed
4. **Performance threshold:** At what task count should we consider SQLite? (recommend 10,000+)

### Layer Compliance Confirmation
- ✅ Layer 1: File header with document purpose
- ✅ Layer 2: Complete document structure with all headings
- ✅ Layer 3: Intent comments in each major section

### Doubts / Questions

None. This ADR is ready for review.
