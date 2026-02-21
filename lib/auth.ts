import { createClient, User, Session } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Anon Key must be provided via environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function signUp(email: string, password?: string, options?: { emailRedirectTo?: string }) {
  if (!password) {
    // Handle social sign-up if password is not provided
    // Example for Google Auth:
    // const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: options?.emailRedirectTo } });
    // For now, assume email/password or throw error if social not implemented
    throw new Error('Password is required for email/password sign-up. Social sign-up not implemented.')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: options || {}
  })

  if (error) throw error
  return data
}

export async function signIn(email: string, password?: string) {
  if (!password) {
    // Handle social sign-in
    throw new Error('Password is required for email/password sign-in. Social sign-in not implemented.')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<{ user: User | null; session: Session | null }> {
  const { data: { user, session }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching current user:', error);
    // Depending on your error handling strategy, you might want to throw or return nulls
    return { user: null, session: null };
  }
  return { user, session };
}

export async function checkSessionStatus() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  return session;
}

// Function to handle password reset (if needed)
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/auth/update-password',
  });
  if (error) throw error;
  return data;
}

// Function to update password after reset (if needed)
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}
