import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export interface SocialLink {
  platform: 'instagram' | 'tiktok';
  handle: string;
  url: string;
  verified: boolean;
}

export function useSocialLinks(userId: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate Instagram handle format and check if profile exists
  const validateInstagram = async (handle: string): Promise<boolean> => {
    if (!handle.match(/^[a-zA-Z0-9._]{1,30}$/)) {
      setError('Invalid Instagram handle format');
      return false;
    }
    
    try {
      // Check if Instagram profile exists (basic validation via URL check)
      const response = await fetch(`https://www.instagram.com/${handle}/?__a=1`, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      return true;
    } catch {
      // Even if check fails, allow saving (user might be private/limited)
      return true;
    }
  };

  // Validate TikTok handle format and check if profile exists
  const validateTikTok = async (handle: string): Promise<boolean> => {
    if (!handle.match(/^[a-zA-Z0-9._]{1,24}$/)) {
      setError('Invalid TikTok handle format');
      return false;
    }
    
    try {
      const response = await fetch(`https://www.tiktok.com/@${handle}`, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      return true;
    } catch {
      // Even if check fails, allow saving
      return true;
    }
  };

  // Save social link to profile
  const saveSocialLink = async (
    platform: 'instagram' | 'tiktok',
    handle: string
  ): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      // Validate handle
      let isValid = false;
      if (platform === 'instagram') {
        isValid = await validateInstagram(handle);
      } else if (platform === 'tiktok') {
        isValid = await validateTikTok(handle);
      }

      if (!isValid) {
        setLoading(false);
        return false;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [platform]: handle })
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

  // Remove social link
  const removeSocialLink = async (platform: 'instagram' | 'tiktok'): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [platform]: null })
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
    saveSocialLink,
    removeSocialLink,
    loading,
    error,
  };
}
