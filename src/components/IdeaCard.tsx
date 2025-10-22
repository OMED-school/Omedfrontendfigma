import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ChevronUp, ChevronDown, MessageCircle, Share, User } from "lucide-react";
import { cn } from "./ui/utils";

export interface Idea {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  votes: number;
  userVote: 'up' | 'down' | null;
  commentCount: number;
  timeAgo: string;
}

interface IdeaCardProps {
  idea: Idea;
  onVote: (ideaId: string, voteType: 'up' | 'down') => void;
  onComment: (ideaId: string) => void;
  onClick?: (ideaId: string) => void;
}

export function IdeaCard({ idea, onVote, onComment, onClick }: IdeaCardProps) {
  const [currentVote, setCurrentVote] = useState(idea.userVote);
  const [voteCount, setVoteCount] = useState(idea.votes);

  const handleVote = (e: React.MouseEvent, voteType: 'up' | 'down') => {
    e.stopPropagation();
    let newVoteCount = voteCount;
    let newVote: 'up' | 'down' | null = voteType;

    // Remove previous vote
    if (currentVote === 'up') newVoteCount -= 1;
    if (currentVote === 'down') newVoteCount += 1;

    // Apply new vote
    if (voteType === currentVote) {
      // Remove vote if clicking same button
      newVote = null;
    } else {
      if (voteType === 'up') newVoteCount += 1;
      if (voteType === 'down') newVoteCount -= 1;
    }

    setCurrentVote(newVote);
    setVoteCount(newVoteCount);
    onVote(idea.id, voteType);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(idea.id);
    }
  };

  return (
    <Card className="w-full cursor-pointer transition-colors hover:bg-accent/50" onClick={handleCardClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{idea.author}</p>
              <p className="text-xs text-muted-foreground">{idea.timeAgo}</p>
            </div>
          </div>
          <Badge variant="secondary">{idea.category}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <h3 className="mb-2 font-semibold">{idea.title}</h3>
        <p className="text-muted-foreground">{idea.description}</p>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleVote(e, 'up')}
            className={cn(
              "h-8 w-8 p-0",
              currentVote === 'up' && "text-green-600 bg-green-50 hover:bg-green-100"
            )}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          
          <span className={cn(
            "min-w-8 text-center text-sm font-medium",
            voteCount > 0 && "text-green-600",
            voteCount < 0 && "text-red-600"
          )}>
            {voteCount}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleVote(e, 'down')}
            className={cn(
              "h-8 w-8 p-0",
              currentVote === 'down' && "text-red-600 bg-red-50 hover:bg-red-100"
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onComment(idea.id);
            }}
            className="gap-1"
          >
            <MessageCircle className="h-4 w-4" />
            {idea.commentCount}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}