import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export function useProfileEdit(userId: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update profile info
  const updateProfile = async (
    fullName: string,
    username: string
  ): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      // Check if username is already taken (by another user)
      if (username.trim()) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.trim())
          .neq('id', userId)
          .single();

        if (existingUser) {
          setError('Username is already taken');
          setLoading(false);
          return false;
        }
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          username: username.trim(),
        })
        .eq('id', userId);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  return {
    updateProfile,
    loading,
    error,
  };
}
