import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  profile?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export function useFriends(userId: string | undefined) {
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's accepted friends
  const fetchFriends = async () => {
    if (!userId) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('friends')
        .select(`
          *,
          profile:friend_id (username, full_name, avatar_url)
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (fetchError) throw fetchError;
      setFriends(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fetch pending friend requests (incoming)
  const fetchPendingRequests = async () => {
    if (!userId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('friends')
        .select(`
          *,
          profile:user_id (username, full_name, avatar_url)
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (fetchError) throw fetchError;
      setPendingRequests(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Send friend request
  const sendFriendRequest = async (friendId: string): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'pending',
        });

      if (insertError) throw insertError;
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    try {
      // Update incoming request to accepted
      const { error: updateError } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .eq('friend_id', userId);

      if (updateError) throw updateError;

      // Also create reverse friendship
      const { data: request } = await supabase
        .from('friends')
        .select('user_id')
        .eq('id', requestId)
        .single();

      if (request) {
        await supabase
          .from('friends')
          .insert({
            user_id: userId,
            friend_id: request.user_id,
            status: 'accepted',
          })
          .single();
      }

      await fetchPendingRequests();
      await fetchFriends();
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // Reject friend request
  const rejectFriendRequest = async (requestId: string): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId);

      if (deleteError) throw deleteError;

      await fetchPendingRequests();
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // Remove friend
  const removeFriend = async (friendId: string): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    try {
      // Delete both directions
      await supabase.from('friends').delete().match({ user_id: userId, friend_id: friendId });
      await supabase.from('friends').delete().match({ user_id: friendId, friend_id: userId });

      await fetchFriends();
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // Check if users are friends
  const areFriends = async (otherUserId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { data } = await supabase
        .from('friends')
        .select('*')
        .match({ user_id: userId, friend_id: otherUserId, status: 'accepted' })
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFriends();
      fetchPendingRequests();
    }
  }, [userId]);

  return {
    friends,
    pendingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    areFriends,
    loading,
    error,
    refetch: () => {
      fetchFriends();
      fetchPendingRequests();
    },
  };
}
