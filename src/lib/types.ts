// Database types based on Supabase schema

export type UserRole = 'student' | 'teacher' | 'principal' | 'admin';

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  join_date: string;
  reputation: number;
  created_at: string;
  updated_at: string;
}

export type IdeaStatus = 'new' | 'under-review' | 'forwarded' | 'approved' | 'rejected';
export type PrincipalStatus = 'pending' | 'in-progress' | 'approved' | 'rejected' | 'implemented';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface IdeaRow {
  id: string;
  title: string;
  description: string;
  author_id: string;
  category: string;
  votes: number;
  comment_count: number;
  status: IdeaStatus;
  principal_status: PrincipalStatus | null;
  priority: Priority | null;
  budget: number | null;
  implementation_date: string | null;
  teacher_notes: string | null;
  principal_notes: string | null;
  reviewed_by: string | null;
  forwarded_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoteRow {
  id: string;
  user_id: string;
  idea_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface CommentRow {
  id: string;
  idea_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  votes: number;
  created_at: string;
  updated_at: string;
}

export interface CommentVoteRow {
  id: string;
  user_id: string;
  comment_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface MessageRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: 'comment' | 'vote' | 'status_change' | 'message';
  content: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

// Supabase Database schema type
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      ideas: {
        Row: IdeaRow;
        Insert: Omit<IdeaRow, 'id' | 'created_at' | 'updated_at' | 'votes' | 'comment_count'>;
        Update: Partial<Omit<IdeaRow, 'id' | 'created_at'>>;
      };
      votes: {
        Row: VoteRow;
        Insert: Omit<VoteRow, 'id' | 'created_at'>;
        Update: Partial<Omit<VoteRow, 'id' | 'created_at'>>;
      };
      comments: {
        Row: CommentRow;
        Insert: Omit<CommentRow, 'id' | 'created_at' | 'updated_at' | 'votes'>;
        Update: Partial<Omit<CommentRow, 'id' | 'created_at'>>;
      };
      comment_votes: {
        Row: CommentVoteRow;
        Insert: Omit<CommentVoteRow, 'id' | 'created_at'>;
        Update: Partial<Omit<CommentVoteRow, 'id' | 'created_at'>>;
      };
      messages: {
        Row: MessageRow;
        Insert: Omit<MessageRow, 'id' | 'created_at'>;
        Update: Partial<Omit<MessageRow, 'id' | 'created_at'>>;
      };
      notifications: {
        Row: NotificationRow;
        Insert: Omit<NotificationRow, 'id' | 'created_at'>;
        Update: Partial<Omit<NotificationRow, 'id' | 'created_at'>>;
      };
    };
  };
}
