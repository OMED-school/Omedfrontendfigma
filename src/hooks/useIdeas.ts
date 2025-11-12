import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { IdeaRow, Profile } from '../lib/types';

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

export interface TeacherIdea extends Idea {
  status: 'new' | 'under-review' | 'forwarded' | 'approved' | 'rejected';
  teacherNotes?: string;
  forwardedDate?: string;
  reviewedBy?: string;
}

export interface PrincipalIdea extends TeacherIdea {
  principalStatus?: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'implemented';
  principalNotes?: string;
  budget?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  implementationDate?: string;
  assignedTo?: string;
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

export function useIdeas(userId?: string) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIdeas();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('ideas_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideas' },
        () => fetchIdeas()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  async function fetchIdeas() {
    try {
      // Fetch ideas with author information
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select(`
          *,
          author:profiles!ideas_author_id_fkey(username, full_name)
        `)
        .order('created_at', { ascending: false });

      if (ideasError) throw ideasError;

      // If userId is provided, fetch user votes
      let userVotes: any[] = [];
      if (userId) {
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('idea_id, vote_type')
          .eq('user_id', userId);

        if (!votesError && votesData) {
          userVotes = votesData;
        }
      }

      // Map to Idea interface
      const mappedIdeas: Idea[] = (ideasData || []).map((idea: any) => {
        const userVote = userVotes.find(v => v.idea_id === idea.id);
        return {
          id: idea.id,
          title: idea.title,
          description: idea.description,
          author: idea.author?.full_name || idea.author?.username || 'Unknown',
          category: idea.category,
          votes: idea.votes,
          userVote: userVote ? userVote.vote_type : null,
          commentCount: idea.comment_count,
          timeAgo: formatTimeAgo(idea.created_at),
        };
      });

      setIdeas(mappedIdeas);
      setError(null);
    } catch (err) {
      console.error('Error fetching ideas:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ideas');
    } finally {
      setLoading(false);
    }
  }

  return { ideas, loading, error, refetch: fetchIdeas };
}

export function useTeacherIdeas(userId?: string) {
  const [ideas, setIdeas] = useState<TeacherIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIdeas();

    const subscription = supabase
      .channel('teacher_ideas_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideas' },
        () => fetchIdeas()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  async function fetchIdeas() {
    try {
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select(`
          *,
          author:profiles!ideas_author_id_fkey(username, full_name),
          reviewer:profiles!ideas_reviewed_by_fkey(username, full_name)
        `)
        .order('created_at', { ascending: false });

      if (ideasError) throw ideasError;

      let userVotes: any[] = [];
      if (userId) {
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('idea_id, vote_type')
          .eq('user_id', userId);

        if (!votesError && votesData) {
          userVotes = votesData;
        }
      }

      const mappedIdeas: TeacherIdea[] = (ideasData || []).map((idea: any) => {
        const userVote = userVotes.find(v => v.idea_id === idea.id);
        return {
          id: idea.id,
          title: idea.title,
          description: idea.description,
          author: idea.author?.full_name || idea.author?.username || 'Unknown',
          category: idea.category,
          votes: idea.votes,
          userVote: userVote ? userVote.vote_type : null,
          commentCount: idea.comment_count,
          timeAgo: formatTimeAgo(idea.created_at),
          status: idea.status,
          teacherNotes: idea.teacher_notes || undefined,
          forwardedDate: idea.forwarded_date ? formatTimeAgo(idea.forwarded_date) : undefined,
          reviewedBy: idea.reviewer?.full_name || idea.reviewer?.username || undefined,
        };
      });

      setIdeas(mappedIdeas);
      setError(null);
    } catch (err) {
      console.error('Error fetching teacher ideas:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ideas');
    } finally {
      setLoading(false);
    }
  }

  return { ideas, loading, error, refetch: fetchIdeas };
}

export function usePrincipalIdeas(userId?: string) {
  const [ideas, setIdeas] = useState<PrincipalIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIdeas();

    const subscription = supabase
      .channel('principal_ideas_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideas' },
        () => fetchIdeas()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  async function fetchIdeas() {
    try {
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select(`
          *,
          author:profiles!ideas_author_id_fkey(username, full_name),
          reviewer:profiles!ideas_reviewed_by_fkey(username, full_name)
        `)
        .order('created_at', { ascending: false });

      if (ideasError) throw ideasError;

      let userVotes: any[] = [];
      if (userId) {
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('idea_id, vote_type')
          .eq('user_id', userId);

        if (!votesError && votesData) {
          userVotes = votesData;
        }
      }

      const mappedIdeas: PrincipalIdea[] = (ideasData || []).map((idea: any) => {
        const userVote = userVotes.find(v => v.idea_id === idea.id);
        return {
          id: idea.id,
          title: idea.title,
          description: idea.description,
          author: idea.author?.full_name || idea.author?.username || 'Unknown',
          category: idea.category,
          votes: idea.votes,
          userVote: userVote ? userVote.vote_type : null,
          commentCount: idea.comment_count,
          timeAgo: formatTimeAgo(idea.created_at),
          status: idea.status,
          teacherNotes: idea.teacher_notes || undefined,
          forwardedDate: idea.forwarded_date ? formatTimeAgo(idea.forwarded_date) : undefined,
          reviewedBy: idea.reviewer?.full_name || idea.reviewer?.username || undefined,
          principalStatus: idea.principal_status || undefined,
          principalNotes: idea.principal_notes || undefined,
          budget: idea.budget || undefined,
          priority: idea.priority || undefined,
          implementationDate: idea.implementation_date || undefined,
        };
      });

      setIdeas(mappedIdeas);
      setError(null);
    } catch (err) {
      console.error('Error fetching principal ideas:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ideas');
    } finally {
      setLoading(false);
    }
  }

  return { ideas, loading, error, refetch: fetchIdeas };
}
