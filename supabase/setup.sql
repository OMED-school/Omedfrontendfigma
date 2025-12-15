-- Supabase setup script
-- Paste the entire contents into the Supabase SQL Editor and run.
-- Note: Do NOT wrap everything in a transaction. Run as-is.

-- 1) Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2) Tables
-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS ideas (
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
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, idea_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
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
CREATE TABLE IF NOT EXISTS comment_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

-- Messages table (for chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  recipient_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment', 'vote', 'status_change', 'message')),
  content TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3) Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Ideas policies
DROP POLICY IF EXISTS "Ideas are viewable by everyone" ON ideas;
CREATE POLICY "Ideas are viewable by everyone" ON ideas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create ideas" ON ideas;
CREATE POLICY "Authenticated users can create ideas" ON ideas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authors can update their own ideas" ON ideas;
CREATE POLICY "Authors can update their own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Teachers and principals can update idea status" ON ideas;
CREATE POLICY "Teachers and principals can update idea status" ON ideas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'principal')
    )
  );

-- Votes policies
DROP POLICY IF EXISTS "Users can view all votes" ON votes;
CREATE POLICY "Users can view all votes" ON votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own votes" ON votes;
CREATE POLICY "Users can insert their own votes" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own votes" ON votes;
CREATE POLICY "Users can delete their own votes" ON votes
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own votes" ON votes;
CREATE POLICY "Users can update their own votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Comments policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authors can update own comments" ON comments;
CREATE POLICY "Authors can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

-- Comment votes policies
DROP POLICY IF EXISTS "Users can view all comment votes" ON comment_votes;
CREATE POLICY "Users can view all comment votes" ON comment_votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own comment votes" ON comment_votes;
CREATE POLICY "Users can insert their own comment votes" ON comment_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comment votes" ON comment_votes;
CREATE POLICY "Users can delete their own comment votes" ON comment_votes
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comment votes" ON comment_votes;
CREATE POLICY "Users can update their own comment votes" ON comment_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages policies
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 4) Functions and Triggers
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

DROP TRIGGER IF EXISTS update_idea_votes ON votes;
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

DROP TRIGGER IF EXISTS update_idea_comment_count ON comments;
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

DROP TRIGGER IF EXISTS update_comment_votes ON comment_votes;
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

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Optional: Create profile automatically when auth user is created
-- (Requires proper privileges; if it fails, create profiles manually or run via a DB admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'student')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
