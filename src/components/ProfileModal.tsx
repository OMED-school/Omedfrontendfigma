import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { User, Calendar, Trophy, MessageSquare, ThumbsUp, Instagram, Music, UserPlus, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  username: string;
  joinDate: string;
  totalIdeas: number;
  totalVotes: number;
  totalComments: number;
  reputation: number;
  recentIdeas: Array<{
    id: string;
    title: string;
    votes: number;
    category: string;
    timeAgo: string;
  }>;
  recentComments: Array<{
    id: string;
    ideaTitle: string;
    content: string;
    timeAgo: string;
  }>;
  userId?: string;
  instagram?: string;
  tiktok?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export function ProfileModal({ isOpen, onClose, profile }: ProfileModalProps) {
  const { user } = useAuth();
  const { sendFriendRequest, friends } = useFriends(user?.id);
  const [isFriend, setIsFriend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile.userId && user?.id !== profile.userId) {
      const isFriendAlready = friends.some((f) => f.friend_id === profile.userId);
      setIsFriend(isFriendAlready);
    }
  }, [profile.userId, friends, user?.id]);

  const handleAddFriend = async () => {
    if (!profile.userId) return;
    setIsLoading(true);
    const success = await sendFriendRequest(profile.userId);
    if (success) {
      toast.success('Friend request sent!');
      setIsFriend(true);
    } else {
      toast.error('Failed to send friend request');
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            View profile information, stats, and activity.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Profile Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{profile.name}</h3>
                <p className="text-muted-foreground">@{profile.username}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Joined {profile.joinDate}
                  </span>
                </div>
              </div>
            </div>

            {user?.id !== profile.userId && (
              <Button
                size="sm"
                onClick={handleAddFriend}
                disabled={isLoading || isFriend}
                className="shrink-0"
              >
                {isFriend ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Friends
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Friend
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Social Links */}
          {(profile.instagram || profile.tiktok) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-semibold">Social Links</p>
                <div className="flex gap-3">
                  {profile.instagram && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`https://instagram.com/${profile.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  {profile.tiktok && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`https://tiktok.com/@${profile.tiktok}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Music className="h-4 w-4 mr-2" />
                        TikTok
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{profile.totalIdeas}</div>
                <div className="text-sm text-muted-foreground">Ideas</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{profile.totalVotes}</div>
                <div className="text-sm text-muted-foreground">Votes</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{profile.totalComments}</div>
                <div className="text-sm text-muted-foreground">Comments</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <div className="text-2xl font-bold">{profile.reputation}</div>
                </div>
                <div className="text-sm text-muted-foreground">Reputation</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity */}
          <Tabs defaultValue="ideas" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ideas">Recent Ideas</TabsTrigger>
              <TabsTrigger value="comments">Recent Comments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ideas" className="space-y-3">
              {profile.recentIdeas.map((idea) => (
                <Card key={idea.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{idea.title}</h4>
                      <Badge variant="secondary">{idea.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {idea.votes} votes
                      </div>
                      <span>{idea.timeAgo}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="comments" className="space-y-3">
              {profile.recentComments.map((comment) => (
                <Card key={comment.id}>
                  <CardHeader className="pb-2">
                    <h4 className="font-medium text-sm">Re: {comment.ideaTitle}</h4>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm mb-2">{comment.content}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {comment.timeAgo}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}