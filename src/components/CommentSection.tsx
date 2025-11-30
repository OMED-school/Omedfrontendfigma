import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { ChevronUp, ChevronDown, User, Reply } from "lucide-react";
import { cn } from "./ui/utils";

export interface Comment {
  id: string;
  author: string;
  content: string;
  votes: number;
  userVote: 'up' | 'down' | null;
  timeAgo: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  isOpen: boolean;
  onClose: () => void;
  ideaTitle: string;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onVoteComment: (commentId: string, voteType: 'up' | 'down') => void;
}

function CommentItem({ comment, onVote, level = 0 }: { 
  comment: Comment; 
  onVote: (commentId: string, voteType: 'up' | 'down') => void;
  level?: number;
}) {
  const [currentVote, setCurrentVote] = useState(comment.userVote);
  const [voteCount, setVoteCount] = useState(comment.votes);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleVote = (voteType: 'up' | 'down') => {
    let newVoteCount = voteCount;
    let newVote: 'up' | 'down' | null = voteType;

    if (currentVote === 'up') newVoteCount -= 1;
    if (currentVote === 'down') newVoteCount += 1;

    if (voteType === currentVote) {
      newVote = null;
    } else {
      if (voteType === 'up') newVoteCount += 1;
      if (voteType === 'down') newVoteCount -= 1;
    }

    setCurrentVote(newVote);
    setVoteCount(newVoteCount);
    onVote(comment.id, voteType);
  };

  return (
    <div className={cn("space-y-2", level > 0 && "ml-6 border-l-2 border-muted pl-4")}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.author}</span>
                <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
              </div>
              
              <p className="text-sm">{comment.content}</p>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote('up')}
                    className={cn(
                      "h-6 w-6 p-0",
                      currentVote === 'up' && "text-green-600"
                    )}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  
                  <span className={cn(
                    "text-xs font-medium",
                    voteCount > 0 && "text-green-600",
                    voteCount < 0 && "text-red-600"
                  )}>
                    {voteCount}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote('down')}
                    className={cn(
                      "h-6 w-6 p-0",
                      currentVote === 'down' && "text-red-600"
                    )}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="h-6 gap-1 px-2"
                >
                  <Reply className="h-3 w-3" />
                  Reply
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {comment.replies && comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onVote={onVote}
          level={level + 1}
        />
      ))}
    </div>
  );
}

export function CommentSection({ 
  isOpen, 
  onClose, 
  ideaTitle, 
  comments, 
  onAddComment, 
  onVoteComment 
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-left">Comments on "{ideaTitle}"</DialogTitle>
          <DialogDescription className="text-left">
            Join the discussion about this idea. Share your thoughts and vote on comments.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={!newComment.trim()}>
            Post Comment
          </Button>
        </form>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onVote={onVoteComment}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}