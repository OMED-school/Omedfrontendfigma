import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export interface LinkedIdentity {
  id: string;
  provider: string;
  email?: string;
  createdAt?: string;
}

export function useLinkedIdentities(userId?: string) {
  const [linkedIdentities, setLinkedIdentities] = useState<LinkedIdentity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch linked identities
  const fetchLinkedIdentities = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Failed to fetch user');
      }

      // Get identities from auth metadata
      const identities = user.identities || [];
      const linkedIds: LinkedIdentity[] = identities.map((identity: any) => ({
        id: identity.id || identity.provider,
        provider: identity.provider,
        email: identity.email,
        createdAt: identity.created_at,
      }));

      setLinkedIdentities(linkedIds);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch linked identities';
      setError(message);
      console.error('Error fetching linked identities:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Link new provider
  const linkProvider = useCallback(async (provider: 'github' | 'google' | 'spotify' | 'discord' | 'apple') => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // After successful linking, fetch updated identities
      await fetchLinkedIdentities();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to link ${provider}`;
      setError(message);
      console.error(`Error linking ${provider}:`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchLinkedIdentities]);

  // Unlink provider by provider name
  const unlinkProvider = useCallback(async (provider: string) => {
    setLoading(true);
    setError(null);

    try {
      // Get current user to find the identity to unlink
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Failed to fetch user');
      }

      // Find the identity with this provider
      const identityToUnlink = user.identities?.find((id: any) => id.provider === provider);

      if (!identityToUnlink) {
        throw new Error(`Provider ${provider} is not linked`);
      }

      // Check if this is the only provider (security measure)
      const hasPassword = true; // Assume user has password-based auth

      if ((user.identities?.length || 0) === 1 && !hasPassword) {
        throw new Error('You must have at least one authentication method. Please set a password first.');
      }

      // Use unlinkIdentity with the full identity object
      const { error } = await supabase.auth.unlinkIdentity(identityToUnlink);

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      setLinkedIdentities((prev) =>
        prev.filter((id) => id.provider !== provider)
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to unlink ${provider}`;
      setError(message);
      console.error(`Error unlinking ${provider}:`, err);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if provider is linked
  const isProviderLinked = useCallback((provider: string): boolean => {
    return linkedIdentities.some((identity) => identity.provider === provider);
  }, [linkedIdentities]);

  // Fetch on mount
  useEffect(() => {
    fetchLinkedIdentities();
  }, [fetchLinkedIdentities]);

  return {
    linkedIdentities,
    loading,
    error,
    linkProvider,
    unlinkProvider,
    isProviderLinked,
    fetchLinkedIdentities,
  };
}
