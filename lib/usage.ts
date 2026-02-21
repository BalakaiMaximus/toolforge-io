import { createClient, User, Session } from '@supabase/supabase-js';
import { getCurrentUser } from './auth'; // Assuming auth functions are in './auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Anon Key must be provided via environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

const FREE_TIER_LIMIT = 10;

// --- Usage Tracking Functions ---

export async function getUsage(): Promise<{ count: number; limit: number; isPro: boolean }> {
  const { user } = await getCurrentUser();
  if (!user) {
    // For unauthenticated users, fall back to localStorage or a very low limit
    // For simplicity here, assuming unauthenticated users can't use tools or have a very low limit
    // A better approach might be to disallow usage without login or provide a minimal guest access.
    console.warn('User not authenticated, returning default usage.');
    return { count: 0, limit: 0, isPro: false }; // Or a very low guest limit
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // Fetch user profile for 'is_pro' status
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means 'No rows found', which is okay if profile doesn't exist yet
      console.error('Error fetching user profile:', profileError);
    }
    const isPro = profileData?.is_pro || false;

    // Fetch today's usage count
    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('usage_date', today)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error fetching daily usage:', usageError);
      // Return default if error occurs, or throw
      return { count: 0, limit: FREE_TIER_LIMIT, isPro };
    }

    const count = usageData?.count || 0;
    return { count, limit: FREE_TIER_LIMIT, isPro };

  } catch (error: any) {
    console.error('Error in getUsage:', error);
    return { count: 0, limit: FREE_TIER_LIMIT, isPro: false };
  }
}

export async function incrementUsage(): Promise<boolean> {
  const { user } = await getCurrentUser();
  if (!user) {
    console.warn('User not authenticated, cannot increment usage.');
    return false; // Cannot increment if not authenticated
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // First, check if user is Pro
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .single();
    const isPro = profileData?.is_pro || false;

    if (isPro) {
      return true; // Pro users have unlimited usage
    }

    // Fetch current usage to check against limit
    const { data: usageData, error: fetchError } = await supabase
      .from('user_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('usage_date', today)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching usage for increment:', fetchError);
      return false; // Indicate failure
    }

    const currentCount = usageData?.count || 0;

    if (currentCount >= FREE_TIER_LIMIT) {
      return false; // Limit reached
    }

    // Increment usage count in Supabase
    const newCount = currentCount + 1;
    const { error } = await supabase
      .from('user_usage')
      .upsert([{ user_id: user.id, usage_date: today, count: newCount, updated_at: new Date().toISOString() }], { onConflict: 'user_id,usage_date' })
      .select();

    if (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }

    return true; // Success

  } catch (error: any) {
    console.error('Error in incrementUsage:', error);
    return false;
  }
}

// This function might be useful for admin or specific scenarios, or to clear a user's usage
export async function resetUsage(userId?: string, date?: string) {
  // Implement logic to reset usage if needed, e.g., for admin purposes or debugging
  // For now, this is a placeholder.
  console.warn('resetUsage function called but not fully implemented.');
  // Example: If userId and date are provided, delete that specific entry.
  // If only userId, reset for today.
  // If no args, maybe reset for all users/dates (admin action).
}

// You'll also need to ensure that your Supabase project has:
// 1. A 'profiles' table with an 'is_pro' (boolean) column.
// 2. A 'user_usage' table with 'user_id', 'usage_date', and 'count' columns.
// 3. Appropriate RLS policies set up for these tables.
