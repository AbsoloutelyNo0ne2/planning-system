/**
 * @fileoverview Actor Service - Supabase Backend
 *
 * PURPOSE:
 * Provides CRUD operations for actors using Supabase.
 * Enables persistence of competitor/tracked entity data.
 *
 * WHY THIS EXISTS:
 * - Enables AI agents to access actors via Supabase API
 * - Provides real-time sync across devices
 * - Handles offline caching
 *
 * LAYER STATUS: Layer 4 Complete
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Actor } from '../types/actor';

// SECTION: Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rstjrsnwmajdmhhmbwmm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// SECTION: Supabase Client
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: { params: { eventsPerSecond: 10 } },
      auth: { storage: localStorage, autoRefreshToken: true, persistSession: true }
    });
  }
  return supabaseInstance;
}

// SECTION: Result Types
export type ActorResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// SECTION: Database Types
interface ActorRow {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  created_at: string;
}

// SECTION: CRUD Operations

/**
 * Get all actors for the current user
 * REASONING: Fetch all actor rows, convert to Actor type array
 */
async function getActors(): Promise<ActorResult<Actor[]>> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('actors')
      .select('*')
      .eq('user_id', DEFAULT_USER_ID)
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    const actors: Actor[] = (data || []).map((row: ActorRow) => ({
      id: row.id,
      name: row.name,
      notes: row.notes || undefined,
      createdAt: Date.parse(row.created_at)
    }));

    return { success: true, data: actors };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch actors'
    };
  }
}

/**
 * Create a new actor
 * REASONING: Insert new actor row with the provided name
 */
async function createActor(name: string): Promise<ActorResult<Actor>> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('actors')
      .insert({
        user_id: DEFAULT_USER_ID,
        name: name.trim()
      })
      .select()
      .single<ActorRow>();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'No data returned from insert' };
    }

    const actor: Actor = {
      id: data.id,
      name: data.name,
      notes: data.notes || undefined,
      createdAt: Date.parse(data.created_at)
    };

    return { success: true, data: actor };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create actor'
    };
  }
}

/**
 * Update an actor's name
 * REASONING: Update the actor row with the specified id
 */
async function updateActor(id: string, name: string): Promise<ActorResult<Actor>> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('actors')
      .update({ name: name.trim() })
      .eq('id', id)
      .eq('user_id', DEFAULT_USER_ID)
      .select()
      .single<ActorRow>();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Actor not found' };
    }

    const actor: Actor = {
      id: data.id,
      name: data.name,
      notes: data.notes || undefined,
      createdAt: Date.parse(data.created_at)
    };

    return { success: true, data: actor };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update actor'
    };
  }
}

/**
 * Delete an actor
 * REASONING: Delete the actor row with the specified id
 */
async function deleteActor(id: string): Promise<ActorResult<void>> {
  const supabase = getSupabase();

  try {
    const { error } = await supabase
      .from('actors')
      .delete()
      .eq('id', id)
      .eq('user_id', DEFAULT_USER_ID);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete actor'
    };
  }
}

/**
 * Subscribe to actor changes
 * REASONING: Real-time sync for actor updates
 */
function subscribeToActors(callback: (actors: Actor[]) => void): () => void {
  const supabase = getSupabase();

  const channel = supabase
    .channel('actor-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'actors',
        filter: `user_id=eq.${DEFAULT_USER_ID}`
      },
      async () => {
        // Fetch fresh data on any change
        const result = await getActors();
        if (result.success) {
          callback(result.data);
        }
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
    supabase.removeChannel(channel);
  };
}

// SECTION: Public API
export const actorService = {
  getActors,
  createActor,
  updateActor,
  deleteActor,
  subscribeToActors
};
