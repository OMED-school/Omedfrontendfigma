import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import { Send, User, Search } from "lucide-react";
import { cn } from "./ui/utils";
import { useAuth } from "../contexts/AuthContext";
import { useChatUsers, useMessages } from "../hooks/useMessages";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users and messages using Supabase hooks
  const { users, loading: usersLoading } = useChatUsers(user?.id || '');
  const { messages, sendMessage, loading: messagesLoading } = useMessages(
    user?.id || '',
    selectedUserId || undefined
  );

  const filteredUsers = users.filter(chatUser =>
    chatUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      try {
        await sendMessage(newMessage);
        setNewMessage("");
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
      }
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[600px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Messages</DialogTitle>
          <DialogDescription>
            Chat with other students about ideas and proposals. Select a user to start or continue a conversation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* User List */}
          <div className="w-1/3 border-r bg-muted/20">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[calc(600px-120px)]">
              <div className="p-2 space-y-1">
                {filteredUsers.map((chatUser) => (
                  <Card
                    key={chatUser.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-accent",
                      selectedUserId === chatUser.id && "bg-accent"
                    )}
                    onClick={() => setSelectedUserId(chatUser.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          {chatUser.isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{chatUser.name}</p>
                          {chatUser.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {chatUser.lastMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedUserId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {selectedUser?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedUser?.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.isCurrentUser && "flex-row-reverse"
                        )}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={cn(
                          "max-w-[70%] space-y-1",
                          message.isCurrentUser && "items-end"
                        )}>
                          <div className={cn(
                            "rounded-lg p-3",
                            message.isCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Select a user to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}