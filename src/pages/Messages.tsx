import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Conversation {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fetchConversations, sendMessage, markAsRead } = useMessages(user?.id);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(true);

  // Fetch conversations
  useEffect(() => {
    const loadConversations = async () => {
      setConversationLoading(true);
      const convs = await fetchConversations();
      setConversations(convs);
      setConversationLoading(false);
    };

    if (user) {
      loadConversations();
      const interval = setInterval(loadConversations, 3000);
      return () => clearInterval(interval);
    }
  }, [user, fetchConversations]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !user) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},recipient_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);

        // Mark received messages as read
        const unreadIds = data
          .filter((msg) => msg.recipient_id === user.id && !msg.read)
          .map((msg) => msg.id);

        if (unreadIds.length > 0) {
          await markAsRead(unreadIds);
        }
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedConversation, user, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation || !user) return;

    setLoading(true);
    const success = await sendMessage(selectedConversation, messageInput);
    if (success) {
      setMessageInput('');
      // Reload messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},recipient_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (data) setMessages(data);
    } else {
      toast.error('Failed to send message');
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      <div className="flex-1 flex gap-4 p-4 max-w-6xl mx-auto w-full">
        {/* Conversations List */}
        <div className="w-full md:w-80 border rounded-lg bg-background overflow-y-auto max-h-[calc(100vh-120px)]">
          {conversationLoading ? (
            <div className="p-4 text-center text-muted-foreground flex items-center justify-center h-20">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-3 border-b text-left hover:bg-muted transition ${
                  selectedConversation === conv.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.avatar_url} />
                    <AvatarFallback>{conv.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{conv.full_name}</p>
                      {conv.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 border rounded-lg bg-background flex flex-col max-h-[calc(100vh-120px)]">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4">
                {conversations
                  .filter((c) => c.id === selectedConversation)
                  .map((conv) => (
                    <div key={conv.id} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.avatar_url} />
                        <AvatarFallback>{conv.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{conv.full_name}</p>
                        <p className="text-sm text-muted-foreground">@{conv.username}</p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender_id === user.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="break-words">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !messageInput.trim()}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
