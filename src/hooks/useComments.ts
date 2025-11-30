import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Comment {
  id: string;
  author: string;
  content: string;
  votes: number;
  userVote: 'up' | 'down' | null;
  timeAgo: string;
  replies?: Comment[];
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export function useComments(ideaId: string, userId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ideaId) {
      fetchComments();

      // Subscribe to real-time changes
      const subscription = supabase
        .channel(`comments_${ideaId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'comments', filter: `idea_id=eq.${ideaId}` },
          () => fetchComments()
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [ideaId, userId]);

  async function fetchComments() {
    try {
      // Fetch comments with author information
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!comments_author_id_fkey(username, full_name)
        `)
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // If userId is provided, fetch user votes on comments
      let userVotes: any[] = [];
      if (userId) {
        const { data: votesData, error: votesError } = await supabase
          .from('comment_votes')
          .select('comment_id, vote_type')
          .eq('user_id', userId);

        if (!votesError && votesData) {
          userVotes = votesData;
        }
      }

      // Build nested comment structure
      const commentMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];

      (commentsData || []).forEach((comment: any) => {
        const userVote = userVotes.find(v => v.comment_id === comment.id);
        const mappedComment: Comment = {
          id: comment.id,
          author: comment.author?.full_name || comment.author?.username || 'Unknown',
          content: comment.content,
          votes: comment.votes,
          userVote: userVote ? userVote.vote_type : null,
          timeAgo: formatTimeAgo(comment.created_at),
          replies: [],
        };

        commentMap.set(comment.id, mappedComment);

        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies!.push(mappedComment);
          }
        } else {
          topLevelComments.push(mappedComment);
        }
      });

      setComments(topLevelComments);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }

  async function addComment(content: string, authorId: string, parentId?: string) {
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          idea_id: ideaId,
          author_id: authorId,
          content,
          parent_id: parentId || null,
        });

      if (error) throw error;
      
      // Refetch comments to update UI
      await fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }

  async function voteComment(commentId: string, userId: string, voteType: 'up' | 'down') {
    try {
      // Check if user already voted
      const { data: existingVote, error: fetchError } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('user_id', userId)
        .eq('comment_id', commentId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          const { error: deleteError } = await supabase
            .from('comment_votes')
            .delete()
            .eq('id', existingVote.id);

          if (deleteError) throw deleteError;
        } else {
          // Change vote
          const { error: updateError } = await supabase
            .from('comment_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);

          if (updateError) throw updateError;
        }
      } else {
        // Add new vote
        const { error: insertError } = await supabase
          .from('comment_votes')
          .insert({ user_id: userId, comment_id: commentId, vote_type: voteType });

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error voting on comment:', err);
      throw err;
    }
  }

  return { comments, loading, error, addComment, voteComment, refetch: fetchComments };
}
