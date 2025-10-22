# Backend Setup Guide for School Ideas App

This guide explains how to set up a production-ready backend for your school idea submission application using Supabase.

## Overview

**Recommended Solution: Supabase**

Supabase is the ideal backend solution for this project because it provides:
- PostgreSQL database with real-time subscriptions
- Built-in authentication (email, OAuth, etc.)
- Row-level security for data protection
- RESTful API and real-time subscriptions
- File storage for attachments/images
- Edge functions for custom logic

## Database Schema

### Tables Structure

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'principal')),
  avatar_url TEXT,
  join_date TIMESTAMP DEFAULT NOW(),
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ideas table
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  category TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'under-review', 'forwarded', 'approved', 'rejected')),
  principal_status TEXT CHECK (principal_status IN ('pending', 'in-progress', 'approved', 'rejected', 'implemented')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  budget NUMERIC(10, 2),
  implementation_date DATE,
  teacher_notes TEXT,
  principal_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  forwarded_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Votes table (for tracking individual user votes)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, idea_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Comment votes table
CREATE TABLE comment_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

-- Messages table (for chat functionality)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  recipient_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment', 'vote', 'status_change', 'message')),
  content TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Ideas: Everyone can read, authenticated users can create
CREATE POLICY "Ideas are viewable by everyone" ON ideas
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create ideas" ON ideas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can update their own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = author_id);

-- Teachers and principals can update status fields
CREATE POLICY "Teachers can update idea status" ON ideas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'principal')
    )
  );

-- Votes: Users can manage their own votes
CREATE POLICY "Users can view all votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON votes
  FOR DELETE USING (auth.uid() = user_id);

-- Comments: Everyone can read, authenticated users can create
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

-- Messages: Users can only see their own messages
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

## Database Functions

```sql
-- Function to automatically update vote count when a vote is added/removed
CREATE OR REPLACE FUNCTION update_idea_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ideas 
    SET votes = votes + (CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END)
    WHERE id = NEW.idea_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ideas 
    SET votes = votes - (CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END)
    WHERE id = OLD.idea_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE ideas 
    SET votes = votes + (CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END)
                      - (CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END)
    WHERE id = NEW.idea_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vote count
CREATE TRIGGER update_idea_votes
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_idea_vote_count();

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ideas SET comment_count = comment_count + 1 WHERE id = NEW.idea_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ideas SET comment_count = comment_count - 1 WHERE id = OLD.idea_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment count
CREATE TRIGGER update_idea_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## React Integration with Supabase

### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Client

```typescript
// /lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. Example: Fetching Ideas

```typescript
// /hooks/useIdeas.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Idea } from '../types'

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIdeas()
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('ideas_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideas' },
        () => fetchIdeas()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchIdeas() {
    const { data, error } = await supabase
      .from('ideas')
      .select(`
        *,
        author:profiles(username, full_name),
        reviewed_by:profiles(username, full_name)
      `)
      .order('created_at', { ascending: false })

    if (!error) setIdeas(data || [])
    setLoading(false)
  }

  return { ideas, loading }
}
```

### 4. Example: Voting on Ideas

```typescript
// /hooks/useVote.ts
import { supabase } from '../lib/supabase'

export function useVote() {
  async function vote(ideaId: string, voteType: 'up' | 'down') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select()
      .eq('user_id', user.id)
      .eq('idea_id', ideaId)
      .single()

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote
        await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id)
      } else {
        // Change vote
        await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id)
      }
    } else {
      // Add new vote
      await supabase
        .from('votes')
        .insert({ user_id: user.id, idea_id: ideaId, vote_type: voteType })
    }
  }

  return { vote }
}
```

### 5. Example: Authentication

```typescript
// /hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select()
      .eq('id', userId)
      .single()
    
    setProfile(data)
  }

  async function signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  async function signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    
    if (data.user && !error) {
      // Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        ...userData
      })
    }
    
    return { data, error }
  }

  async function signOut() {
    return await supabase.auth.signOut()
  }

  return { user, profile, signIn, signUp, signOut }
}
```

## Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setup Steps

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Run Database Migrations**
   - Go to SQL Editor in Supabase dashboard
   - Copy and run the schema SQL above
   - Copy and run the RLS policies
   - Copy and run the functions and triggers

3. **Configure Authentication**
   - Enable Email/Password authentication
   - Optionally enable OAuth providers (Google, GitHub, etc.)
   - Set up email templates

4. **Test Your Setup**
   - Create a test user
   - Try creating an idea
   - Test voting and commenting

## Best Practices

1. **Security**
   - Always use RLS policies
   - Never expose service role key on client
   - Validate data on backend with database constraints

2. **Performance**
   - Use database indexes on frequently queried columns
   - Implement pagination for large lists
   - Use real-time subscriptions wisely (unsubscribe when not needed)

3. **Data Validation**
   - Add CHECK constraints in database
   - Validate on client-side for better UX
   - Validate on backend for security

4. **Error Handling**
   - Handle network errors gracefully
   - Show user-friendly error messages
   - Log errors for debugging

## Next Steps

Once you have Supabase set up:
1. Replace mock data in App.tsx with Supabase queries
2. Add authentication flow (login/signup)
3. Implement real-time updates
4. Add file upload for idea attachments
5. Set up email notifications using Supabase Edge Functions

For production deployment, consider:
- Setting up proper backup policies
- Monitoring database performance
- Implementing rate limiting
- Adding comprehensive logging
