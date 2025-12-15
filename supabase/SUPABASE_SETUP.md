# Supabase Setup Instructions

This application now uses Supabase for backend services instead of mock data. Follow these steps to configure your Supabase integration.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed

## Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned (this may take a few minutes)

### 2. Configure Database Schema

Run the following SQL scripts in the Supabase SQL Editor (found in the Supabase dashboard):

#### Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
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

-- Votes table
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

-- Messages table (for chat)
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

#### Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Ideas policies
CREATE POLICY "Ideas are viewable by everyone" ON ideas
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create ideas" ON ideas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can update their own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Teachers and principals can update idea status" ON ideas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'principal')
    )
  );

-- Votes policies
CREATE POLICY "Users can view all votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON votes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

-- Comment votes policies
CREATE POLICY "Users can view all comment votes" ON comment_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comment votes" ON comment_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment votes" ON comment_votes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own comment votes" ON comment_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

#### Create Database Functions and Triggers

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

-- Function to update comment vote count
CREATE OR REPLACE FUNCTION update_comment_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments 
    SET votes = votes + (CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END)
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments 
    SET votes = votes - (CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END)
    WHERE id = OLD.comment_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE comments 
    SET votes = votes + (CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END)
                      - (CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END)
    WHERE id = NEW.comment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment vote count
CREATE TRIGGER update_comment_votes
AFTER INSERT OR UPDATE OR DELETE ON comment_votes
FOR EACH ROW EXECUTE FUNCTION update_comment_vote_count();

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

### 3. Update Supabase Configuration

The application is configured to use the Supabase project credentials from `src/utils/supabase/info.tsx`. 

Update this file with your project details:

```tsx
export const projectId = "your-project-id"
export const publicAnonKey = "your-anon-key"
```

You can find these values in your Supabase project settings:
- Project ID: Settings → General → Reference ID
- Anon Key: Settings → API → Project API keys → anon public

### 4. Enable Authentication

1. Go to Authentication → Providers in your Supabase dashboard
2. Enable Email provider
3. Optionally configure email templates for better user experience
4. (Optional) Enable additional OAuth providers (Google, GitHub, etc.)

### 5. Create Test Users

You can create test users through the Supabase Authentication dashboard or by signing up through the app.

For testing purposes, you may want to create users with different roles:
- Student user
- Teacher user
- Principal user

**Note:** After creating a user through the auth system, you'll need to manually create a profile record or set up a database trigger to auto-create profiles.

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the Application

```bash
npm run dev
```

## Features Now Using Supabase

- ✅ User authentication (login/signup)
- ✅ Ideas creation and management
- ✅ Voting on ideas
- ✅ Comments and nested replies
- ✅ Vote on comments
- ✅ Real-time updates (via Supabase Realtime)
- ✅ Chat/messaging system
- ✅ Role-based access (student, teacher, principal)

## Troubleshooting

### "Row Level Security" errors
Make sure you've run all the RLS policies in the setup steps above.

### Users can't create profiles
You may need to create a database trigger to automatically create a profile when a user signs up. Add this trigger:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Real-time updates not working
Make sure Realtime is enabled for your tables in Supabase:
1. Go to Database → Replication
2. Enable replication for all tables

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
