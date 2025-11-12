import { supabase } from './supabaseClient';
import type { UserRole, Profile } from './types';

export type { UserRole };

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: UserRole;
  avatar?: string;
  joinDate: string;
}

class SupabaseAuthService {
  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      name: profile.full_name || profile.username,
      username: profile.username,
      role: profile.role,
      avatar: profile.avatar_url || undefined,
      joinDate: new Date(profile.join_date).toISOString().split('T')[0],
    };

    return { user, token: data.session?.access_token || '' };
  }

  async signup(data: {
    email: string;
    password: string;
    name: string;
    username: string;
  }): Promise<{ user: User; token: string }> {
    // First, sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Signup failed');
    }

    // Create profile (this should be handled by a database trigger in production)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: data.username,
        full_name: data.name,
        role: 'student', // New users are students by default
        join_date: new Date().toISOString(),
        reputation: 0,
      })
      .select()
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    const user: User = {
      id: authData.user.id,
      email: authData.user.email!,
      name: data.name,
      username: data.username,
      role: 'student',
      joinDate: new Date().toISOString().split('T')[0],
    };

    return { user, token: authData.session?.access_token || '' };
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();

    if (error || !authUser) {
      return null;
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      id: authUser.id,
      email: authUser.email!,
      name: profile.full_name || profile.username,
      username: profile.username,
      role: profile.role,
      avatar: profile.avatar_url || undefined,
      joinDate: new Date(profile.join_date).toISOString().split('T')[0],
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  // Get demo credentials (for login screen)
  getDemoCredentials() {
    return {
      student: { email: 'student@school.edu', password: 'password' },
      teacher: { email: 'teacher@school.edu', password: 'password' },
      principal: { email: 'principal@school.edu', password: 'password' },
    };
  }
}

export const authService = new SupabaseAuthService();
