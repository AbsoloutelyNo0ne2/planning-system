/**
 * @fileoverview Trajectory Service - Supabase Backend
 *
 * PURPOSE:
 * Provides CRUD operations for trajectory using Supabase.
 * Replaces fileService.ts with cloud-backed persistence.
 *
 * WHY THIS EXISTS:
 * - Enables AI agents to access trajectory via Supabase API
 * - Provides real-time sync across devices
 * - Handles offline caching
 *
 * LAYER STATUS: Layer 4 Complete
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Trajectory } from '../types/trajectory';

// SECTION: Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rstjrsnwmajdmhhmbwmm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// REASONING: UUID constants for each user type (trajectory isolation)
// > Same pattern as supabaseService.ts for consistency
export const USER_IDS = {
  personal: '00000000-0000-0000-0000-000000000001',
  showcase: '00000000-0000-0000-0000-000000000002',
} as const;

export type UserType = keyof typeof USER_IDS;

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
export type TrajectoryResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// SECTION: Database Types
interface TrajectoryRow {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// SECTION: CRUD Operations

/**
 * Get the current trajectory for the user
 * REASONING: Fetch single trajectory row, convert to Trajectory type
 */
async function getTrajectory(userType: UserType): Promise<TrajectoryResult<Trajectory | null>> {
  const supabase = getSupabase();
  const userId = USER_IDS[userType];

  try {
    const { data, error } = await supabase
      .from('trajectories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single<TrajectoryRow>();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - trajectory not set yet
        return { success: true, data: null };
      }
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: true, data: null };
    }

    const trajectory: Trajectory = {
      id: data.id,
      text: data.content,
      createdAt: Date.parse(data.created_at),
      lastUpdated: Date.parse(data.updated_at)
    };

    return { success: true, data: trajectory };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch trajectory'
    };
  }
}

/**
 * Set a new trajectory
 * REASONING: Insert new trajectory row
 */
async function setTrajectory(content: string, userType: UserType): Promise<TrajectoryResult<Trajectory>> {
  const supabase = getSupabase();
  const userId = USER_IDS[userType];

  try {
    // First delete any existing trajectory for this user
    await supabase
      .from('trajectories')
      .delete()
      .eq('user_id', userId);

    // Insert new trajectory
    const { data, error } = await supabase
      .from('trajectories')
      .insert({
        user_id: userId,
        content: content
      })
      .select()
      .single<TrajectoryRow>();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'No data returned from insert' };
    }

    const trajectory: Trajectory = {
      id: data.id,
      text: data.content,
      createdAt: Date.parse(data.created_at),
      lastUpdated: Date.parse(data.updated_at)
    };

    return { success: true, data: trajectory };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set trajectory'
    };
  }
}

/**
 * Update existing trajectory
 * REASONING: Update the most recent trajectory row
 */
async function updateTrajectory(content: string, userType: UserType): Promise<TrajectoryResult<Trajectory>> {
  const supabase = getSupabase();
  const userId = USER_IDS[userType];

  try {
    // Get the most recent trajectory
    const { data: existing, error: fetchError } = await supabase
      .from('trajectories')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single<{ id: string }>();

    if (fetchError || !existing) {
      // No existing trajectory, create one
      return setTrajectory(content, userType);
    }

    // Update existing
    const { data, error } = await supabase
      .from('trajectories')
      .update({ content: content })
      .eq('id', existing.id)
      .select()
      .single<TrajectoryRow>();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'No data returned from update' };
    }

    const trajectory: Trajectory = {
      id: data.id,
      text: data.content,
      createdAt: Date.parse(data.created_at),
      lastUpdated: Date.parse(data.updated_at)
    };

    return { success: true, data: trajectory };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update trajectory'
    };
  }
}

/**
 * Subscribe to trajectory changes
 * REASONING: Real-time sync for trajectory updates
 */
function subscribeToTrajectory(callback: (trajectory: Trajectory | null) => void, userType: UserType): () => void {
  const supabase = getSupabase();
  const userId = USER_IDS[userType];

  const channel = supabase
    .channel('trajectory-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trajectories',
        filter: `user_id=eq.${userId}`
      },
      async () => {
        // Fetch fresh data on any change
        const result = await getTrajectory(userType);
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
export const trajectoryService = {
  getTrajectory,
  setTrajectory,
  updateTrajectory,
  subscribeToTrajectory
};
