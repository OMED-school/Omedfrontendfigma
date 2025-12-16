import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  isOnline: boolean;
  lastMessage?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function useMessages(currentUserId: string, recipientId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recipientId) {
      fetchMessages();

      // Subscribe to real-time messages
      const subscription = supabase
        .channel(`messages_${currentUserId}_${recipientId}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `sender_id=eq.${recipientId},recipient_id=eq.${currentUserId}` 
          },
          () => fetchMessages()
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUserId, recipientId]);

  async function fetchMessages() {
    if (!recipientId) return;

    try {
      // Fetch messages between current user and recipient
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username, full_name)
        `)
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const mappedMessages: ChatMessage[] = (messagesData || []).map((msg: any) => ({
        id: msg.id,
        sender: msg.sender?.full_name || msg.sender?.username || 'Unknown',
        senderId: msg.sender_id,
        content: msg.content,
        timestamp: formatTime(msg.created_at),
        isCurrentUser: msg.sender_id === currentUserId,
      }));

      setMessages(mappedMessages);
      setError(null);

      // Mark messages as read
      if (messagesData && messagesData.length > 0) {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('recipient_id', currentUserId)
          .eq('sender_id', recipientId)
          .eq('read', false);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(content: string) {
    if (!recipientId) {
      throw new Error('No recipient selected');
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          recipient_id: recipientId,
          content,
          read: false,
        });

      if (error) throw error;

      // Refetch to update UI
      await fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  }

  return { messages, loading, error, sendMessage, refetch: fetchMessages };
}

export function useChatUsers(currentUserId: string) {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentUserId]);

  async function fetchUsers() {
    try {
      // Fetch all users except current user
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUserId);

      if (usersError) throw usersError;

      // Fetch last messages for each user
      const usersWithMessages = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('content, created_at')
            .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${user.id}),and(sender_id.eq.${user.id},recipient_id.eq.${currentUserId})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: user.id,
            name: user.full_name || user.username,
            isOnline: false, // TODO: Implement online status
            lastMessage: lastMessageData?.content,
          };
        })
      );

      setUsers(usersWithMessages);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }

  // New methods for friend messaging
  const fetchConversations = async (): Promise<Conversation[]> => {
    if (!currentUserId) return [];

    try {
      const { data: messageData } = await supabase
        .from('messages')
        .select('sender_id, recipient_id, content, created_at, read')
        .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      const conversationMap = new Map<string, Conversation>();

      for (const msg of messageData || []) {
        const otherUserId = msg.sender_id === currentUserId ? msg.recipient_id : msg.sender_id;
        
        if (!conversationMap.has(otherUserId)) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          conversationMap.set(otherUserId, {
            id: otherUserId,
            username: profile?.username || 'Unknown',
            full_name: profile?.full_name || 'Unknown',
            avatar_url: profile?.avatar_url,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unreadCount: msg.recipient_id === currentUserId && !msg.read ? 1 : 0,
          });
        } else {
          const conv = conversationMap.get(otherUserId)!;
          if (msg.recipient_id === currentUserId && !msg.read) {
            conv.unreadCount = (conv.unreadCount || 0) + 1;
          }
        }
      }

      return Array.from(conversationMap.values());
    } catch (err) {
      console.error('Error fetching conversations:', err);
      return [];
    }
  };

  const sendMessage = async (recipientId: string, content: string): Promise<boolean> => {
    if (!currentUserId || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          recipient_id: recipientId,
          content: content.trim(),
        });

      return !error;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  };

  const markAsRead = async (messageIds: string[]): Promise<boolean> => {
    if (!currentUserId || messageIds.length === 0) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);

      return !error;
    } catch (err) {
      console.error('Error marking as read:', err);
      return false;
    }
  };

  return { users, loading, error, refetch: fetchUsers, fetchConversations, sendMessage, markAsRead };
}
