import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export function useEmailChange() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // Send email change with verification
  const changeEmail = async (newEmail: string): Promise<boolean> => {
    if (!newEmail.trim()) {
      setError('Email cannot be empty');
      return false;
    }

    // Basic email validation
    if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Invalid email format');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Update user email - Supabase will send verification email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return false;
      }

      setVerificationSent(true);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // Reset state
  const resetState = () => {
    setError(null);
    setVerificationSent(false);
  };

  return {
    changeEmail,
    loading,
    error,
    verificationSent,
    resetState,
  };
}
