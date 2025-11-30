import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { ChevronUp, ChevronDown, ArrowLeft, User, Share, Reply, MessageCircle } from "lucide-react";
import { cn } from "./ui/utils";
import type { Idea } from "./IdeaCard";
import type { Comment } from "./CommentSection";

interface DetailedThreadViewProps {
  idea: Idea;
  comments: Comment[];
  onBack: () => void;
  onVote: (ideaId: string, voteType: 'up' | 'down') => void;
  onAddComment: (content: string) => void;
  onVoteComment: (commentId: string, voteType: 'up' | 'down') => void;
}

function CommentItem({ 
  comment, 
  onVote, 
  level = 0 
}: { 
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
    <div className={cn("flex gap-2", level > 0 && "ml-8 border-l-2 border-muted pl-4")}>
      {/* Vote column */}
      <div className="flex flex-col items-center gap-1 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote('up')}
          className={cn(
            "h-6 w-6 p-0",
            currentVote === 'up' && "text-green-600"
          )}
        >
          <ChevronUp className="h-4 w-4" />
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
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Comment content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              <User className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{comment.author}</span>
          <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
        </div>
        
        <p className="text-sm mb-2">{comment.content}</p>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="h-7 gap-1 px-2 text-xs"
        >
          <Reply className="h-3 w-3" />
          Reply
        </Button>

        {showReplyForm && (
          <div className="mt-2">
            <Textarea
              placeholder="Write a reply..."
              rows={2}
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs">Post</Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={() => setShowReplyForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-0">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onVote={onVote}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DetailedThreadView({ 
  idea, 
  comments, 
  onBack, 
  onVote,
  onAddComment,
  onVoteComment 
}: DetailedThreadViewProps) {
  const [currentVote, setCurrentVote] = useState(idea.userVote);
  const [voteCount, setVoteCount] = useState(idea.votes);
  const [newComment, setNewComment] = useState("");

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
    onVote(idea.id, voteType);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to ideas
      </Button>

      {/* Main post card */}
      <Card>
        <CardContent className="p-0">
          <div className="flex gap-4 p-6">
            {/* Vote column */}
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('up')}
                className={cn(
                  "h-8 w-8 p-0",
                  currentVote === 'up' && "text-green-600 bg-green-50 hover:bg-green-100"
                )}
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
              
              <span className={cn(
                "font-medium",
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
                  "h-8 w-8 p-0",
                  currentVote === 'down' && "text-red-600 bg-red-50 hover:bg-red-100"
                )}
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>

            {/* Post content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{idea.author}</p>
                  <p className="text-xs text-muted-foreground">{idea.timeAgo}</p>
                </div>
                <Badge variant="secondary" className="ml-auto">{idea.category}</Badge>
              </div>

              <h1 className="mb-4">{idea.title}</h1>
              <p className="text-muted-foreground mb-4">{idea.description}</p>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {idea.commentCount} {idea.commentCount === 1 ? 'comment' : 'comments'}
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment form */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <p className="text-sm font-medium">Comment as John Student</p>
            <Textarea
              placeholder="What are your thoughts?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!newComment.trim()}>
                Comment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments section */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <h3>Comments ({comments.length})</h3>
        </div>

        {comments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-0">
            {comments.map((comment) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  onVote={onVoteComment}
                />
                <Separator />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}