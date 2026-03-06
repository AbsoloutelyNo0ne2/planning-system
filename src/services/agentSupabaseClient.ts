/**
 * @fileoverview Agent Supabase Client
 *
 * PURPOSE:
 * Initializes a Supabase client with service role key for AI agent access.
 * This client bypasses RLS policies and has full read/write access to tasks.
 *
 * WHY THIS EXISTS:
 * - Agents need unrestricted access to tasks without user authentication
 * - Service role key bypasses RLS, enabling programmatic task management
 * - Separate from frontend anon key client to maintain security boundaries
 *
 * LAYER STATUS: Layer 4 Complete
 * NEXT: Layer 5 - Connection pooling, retry logic
 */

// REASONING: Import Supabase client
// > Why @supabase/supabase-js? Official client with TypeScript support
// > Why createClient? Standard initialization pattern
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// SECTION: Configuration
// REASONING: Service role key from environment
// > Why AGENT_SUPABASE_SERVICE_KEY? Clear naming distinguishes from anon key
// > Why process.env? Agents run in Node.js environment, not browser
// > Why not VITE_ prefix? This is server-side, not client-side
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rstjrsnwmajdmhhmbwmm.supabase.co';
const SERVICE_ROLE_KEY = process.env.AGENT_SUPABASE_SERVICE_KEY;

// REASONING: Validate configuration on load
// > Why throw on missing key? Agents cannot function without proper auth
// > Why check before creating client? Fail fast with clear error message
if (!SERVICE_ROLE_KEY) {
  throw new Error(
    'AGENT_SUPABASE_SERVICE_KEY not configured. ' +
    'Agents require a service role key to bypass RLS. ' +
    'Set the AGENT_SUPABASE_SERVICE_KEY environment variable.'
  );
}

// REASONING: Create client with service role
// > Why service role? Bypasses RLS policies, full access to tasks table
// > Why no auth persistence? Agents don't need session management
// > Why no realtime? Agents poll or use explicit callbacks
export const agentSupabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
  {
    auth: {
      // REASONING: Disable auto-refresh for service role
      // > Why? Service role doesn't have a refreshable session
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// SECTION: Health Check
// REASONING: Verify connection on initialization
// > Why async IIFE? Check connection without blocking exports
// > Why catch? Log but don't throw - connection might recover
(async function verifyConnection(): Promise<void> {
  try {
    const { error } = await agentSupabase.from('tasks').select('id').limit(1);
    if (error) {
      console.warn('[AgentSupabase] Connection warning:', error.message);
    } else {
      console.log('[AgentSupabase] Connection verified');
    }
  } catch (err) {
    console.warn('[AgentSupabase] Connection check failed:', err);
  }
})();

// SECTION MAP:
// Lines 1-18: File header and documentation
// Lines 21-24: Imports
// Lines 27-40: Configuration and validation
// Lines 43-56: Client initialization
// Lines 59-73: Health check
