import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import { Send, User, Search } from "lucide-react";
import { cn } from "./ui/utils";

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  isOnline: boolean;
  lastMessage?: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockUsers: ChatUser[] = [
  { id: "1", name: "Alex Chen", isOnline: true, lastMessage: "Great idea about the library!" },
  { id: "2", name: "Sarah Wilson", isOnline: false, lastMessage: "Thanks for the feedback" },
  { id: "3", name: "Mike Johnson", isOnline: true, lastMessage: "When is the next meeting?" },
  { id: "4", name: "Emma Davis", isOnline: true, lastMessage: "I voted on your proposal" },
];

const mockMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "Alex Chen",
    content: "Hey! I saw your idea about improving the cafeteria menu. Really interesting points!",
    timestamp: "2:30 PM",
    isCurrentUser: false,
  },
  {
    id: "2",
    sender: "You",
    content: "Thanks! I think having more healthy options would really make a difference.",
    timestamp: "2:32 PM",
    isCurrentUser: true,
  },
  {
    id: "3",
    sender: "Alex Chen",
    content: "Absolutely. Have you considered proposing a student survey to gather more input?",
    timestamp: "2:35 PM",
    isCurrentUser: false,
  },
  {
    id: "4",
    sender: "You",
    content: "That's a great idea! I'll add that to my proposal.",
    timestamp: "2:37 PM",
    isCurrentUser: true,
  },
];

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>("1");
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // In a real app, this would send the message to the backend
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

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
                {filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-accent",
                      selectedUser === user.id && "bg-accent"
                    )}
                    onClick={() => setSelectedUser(user.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{user.name}</p>
                          {user.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {user.lastMessage}
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
            {selectedUser ? (
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
                        {mockUsers.find(u => u.id === selectedUser)?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {mockUsers.find(u => u.id === selectedUser)?.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {mockMessages.map((message) => (
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