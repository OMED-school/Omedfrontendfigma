# 🎓 School Ideas - Complete Project Documentation

**The Ultimate Guide to Building, Deploying, and Running Your School Suggestion Platform**

Version: 1.0  
Last Updated: January 2025  
Author: AI Assistant  
For: School Ideas Project

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Explained](#architecture-explained)
3. [Frontend Deep Dive](#frontend-deep-dive)
4. [Backend Implementation](#backend-implementation)
5. [Database Design](#database-design)
6. [Real-time Chat System](#real-time-chat-system)
7. [Authentication & Security](#authentication--security)
8. [Deployment Options](#deployment-options)
9. [Cloudflare Tunnel Setup](#cloudflare-tunnel-setup)
10. [Mobile Apps (iOS & Android)](#mobile-apps)
11. [Testing & Debugging](#testing--debugging)
12. [Maintenance & Updates](#maintenance--updates)
13. [Troubleshooting Guide](#troubleshooting-guide)
14. [Advanced Features](#advanced-features)

---

## Project Overview

### What Is School Ideas?

School Ideas is a **democratic suggestion platform** for schools where:
- **Students** submit improvement ideas and vote
- **Teachers** review submissions and forward worthy ideas
- **Principals** make final decisions with budget allocation
- **Everyone** can discuss ideas through comments

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS v4
- Shadcn/ui components
- Lucide React icons

**Backend:**
- Node.js + Express
- PostgreSQL database
- WebSocket for real-time chat
- JWT authentication

**Deployment:**
- Docker + Docker Compose
- Cloudflare Tunnel (no port forwarding!)
- Nginx reverse proxy
- Let's Encrypt SSL

**Mobile:**
- PWA (installable web app)
- Capacitor (for app stores)

### Key Features Built

✅ **Student Features:**
- Submit ideas with categories
- Upvote/downvote ideas
- Comment with threaded replies
- Track idea status
- Real-time chat
- User profiles
- Mobile app support

✅ **Teacher Features:**
- Review queue with filters
- Forward to principal with notes
- Approve/reject minor ideas
- Statistics dashboard
- Mark ideas under review

✅ **Principal Features:**
- Executive dashboard
- Budget allocation
- Priority management
- Implementation planning
- Approval workflow
- Analytics

✅ **Technical Features:**
- Responsive design (mobile/tablet/desktop)
- Offline support (PWA)
- Real-time updates
- Secure authentication
- Role-based access control

---

## Architecture Explained

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   CLOUDFLARE TUNNEL                          │
│   (Replaces traditional port forwarding)                     │
│   - No open ports needed                                     │
│   - DDoS protection                                          │
│   - Free SSL/TLS                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    YOUR RASPBERRY PI                         │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │              DOCKER COMPOSE STACK                    │  │
│   │                                                      │  │
│   │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │  │
│   │  │   Nginx    │  │  Cloudflared│  │  PostgreSQL  │  │  │
│   │  │  (Proxy)   │  │  (Tunnel)   │  │  (Database)  │  │  │
│   │  └─────┬──────┘  └──────┬──────┘  └──────┬───────┘  │  │
│   │        │                │                │          │  │
│   │  ┌─────▼─────────────────▼────────────────▼──────┐  │  │
│   │  │                                               │  │  │
│   │  │         Node.js Backend API                   │  │  │
│   │  │    - Express server                           │  │  │
│   │  │    - WebSocket chat                           │  │  │
│   │  │    - JWT authentication                       │  │  │
│   │  │                                               │  │  │
│   │  └───────────────────┬───────────────────────────┘  │  │
│   │                      │                              │  │
│   │  ┌───────────────────▼───────────────────────────┐  │  │
│   │  │                                               │  │  │
│   │  │         React Frontend (Static)               │  │  │
│   │  │    - Built with Vite                          │  │  │
│   │  │    - Served by Nginx                          │  │  │
│   │  │                                               │  │  │
│   │  └───────────────────────────────────────────────┘  │  │
│   │                                                      │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### How It Works

1. **User visits:** `https://schoolideas.yourdomain.com`
2. **Cloudflare Tunnel** receives request (secure tunnel from Cloudflare to your Pi)
3. **Nginx** routes request to frontend or backend API
4. **Backend API** processes request, talks to database
5. **PostgreSQL** stores/retrieves data
6. **Response** flows back through tunnel to user

### Why This Architecture?

**Cloudflare Tunnel Benefits:**
- 🚫 No port forwarding (safer)
- 🚫 No dynamic DNS needed
- ✅ Works behind CGNAT
- ✅ Free DDoS protection
- ✅ Built-in SSL/TLS
- ✅ Access logs and analytics

**Docker Benefits:**
- 📦 Consistent environment
- 🔄 Easy updates
- 💾 Simple backups
- 🔧 Easy rollback

---

## Frontend Deep Dive

### Component Structure

```
App.tsx (Main entry point)
│
├── Header (Navigation bar)
│   ├── Logo
│   ├── New Idea button
│   ├── Chat button
│   └── Profile button
│
├── Role Switcher (Student/Teacher/Principal tabs)
│
├── Main Content (Conditional rendering based on role)
│   │
│   ├── Student View
│   │   ├── Filters (Sort by: Popular/Recent/Comments)
│   │   ├── Category Filter
│   │   ├── IdeaCard[] (List of ideas)
│   │   └── DetailedThreadView (Single idea with comments)
│   │
│   ├── Teacher View
│   │   └── TeacherDashboard
│   │       ├── Statistics Cards
│   │       ├── Filter Controls
│   │       └── Ideas Table with Actions
│   │
│   └── Principal View
│       └── PrincipalDashboard
│           ├── Executive Statistics
│           ├── Budget Overview
│           └── Approval Workflow Table
│
└── Modals (Dialog overlays)
    ├── IdeaSubmissionForm
    ├── CommentSection
    ├── ProfileModal
    ├── ChatModal
    └── InstallPrompt (PWA)
```

### State Management

**Currently:** React useState (simple and effective for this scale)

**Why not Redux/Zustand?**
- App is not complex enough
- Props drilling is minimal
- State is mostly local

**If you need global state later:**
- Use React Context (already set up in AuthContext)
- Or Zustand (lightweight, 1KB)

### Key Components Explained

#### 1. IdeaCard Component

**Purpose:** Displays a single idea in the feed

**Features:**
- Voting buttons (up/down arrows)
- Vote count with color (green for positive, red for negative)
- Author info with avatar
- Category badge
- Comment count
- Click to view details

**State:**
```typescript
const [currentVote, setCurrentVote] = useState<'up' | 'down' | null>()
const [voteCount, setVoteCount] = useState<number>()
```

**Voting Logic:**
```typescript
// If clicking same vote = remove vote
// If clicking opposite = change vote
// Updates both local state and parent via callback
```

#### 2. DetailedThreadView Component

**Purpose:** Reddit-style full thread view

**Features:**
- Large idea post at top
- Voting on main post
- Comment form
- Nested comment threads
- Reply functionality
- Vote on comments

**Comment Nesting:**
```typescript
// Recursive component rendering
<CommentItem>
  <CommentContent />
  {comment.replies?.map(reply => (
    <CommentItem comment={reply} level={level + 1} />
  ))}
</CommentItem>
```

#### 3. TeacherDashboard Component

**Purpose:** Teacher's idea management interface

**Key Features:**
- Status filtering (new, under-review, forwarded, etc.)
- Statistics overview
- Action buttons per idea status
- Review dialog with notes

**Status Flow:**
```
new → [Mark as Review] → under-review
                            ↓
                    [Forward/Approve/Reject]
                            ↓
                    forwarded/approved/rejected
```

#### 4. PrincipalDashboard Component

**Purpose:** Executive decision-making interface

**Key Features:**
- Budget tracking
- Priority assignment (low/medium/high/urgent)
- Implementation date planning
- Teacher recommendation display
- Approval workflow with notes

**Approval Process:**
```
Teacher forwarded idea
       ↓
Principal reviews
       ↓
[Approve with budget] OR [Reject with reason]
       ↓
Status: approved/rejected
       ↓
(If approved) Implementation tracking
```

### Styling Architecture

**Tailwind v4 (Latest):**

**Global Styles** (`/styles/globals.css`):
- CSS variables for theming
- Dark mode support
- Typography defaults
- Color system

**Component Styles:**
- Utility classes (Tailwind)
- No custom CSS needed
- Shadcn/ui for complex components

**Theme Variables:**
```css
:root {
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --primary: #030213;
  --muted: #ececf0;
  /* ... and more */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... dark mode colors */
}
```

**How Theming Works:**
1. CSS variables defined in globals.css
2. Tailwind reads variables via `@theme inline`
3. Components use semantic classes: `bg-background`, `text-foreground`
4. Dark mode: Add `dark` class to `<html>` tag

### Responsive Design

**Breakpoints Used:**
- `sm:` 640px - Small tablets
- `md:` 768px - Tablets
- `lg:` 1024px - Small laptops
- `xl:` 1280px - Desktops

**Strategy:**
- Mobile-first design
- Stack on mobile, grid on desktop
- Hide non-essential elements on mobile
- Touch-friendly tap targets (44px minimum)

**Example:**
```tsx
<div className="
  flex flex-col gap-4          // Mobile: vertical stack
  sm:flex-row sm:items-center  // Tablet+: horizontal
  lg:gap-6                     // Desktop: more spacing
">
```

---

## Backend Implementation

### API Structure

```
/api
├── /auth
│   ├── POST /register    - Create new user
│   ├── POST /login       - Login and get JWT
│   ├── POST /logout      - Invalidate token
│   └── GET  /me          - Get current user
│
├── /ideas
│   ├── GET    /          - List all ideas (with filters)
│   ├── GET    /:id       - Get single idea
│   ├── POST   /          - Create new idea
│   ├── PATCH  /:id       - Update idea
│   └── DELETE /:id       - Delete idea (admin only)
│
├── /votes
│   ├── POST   /          - Vote on idea
│   └── DELETE /:id       - Remove vote
│
├── /comments
│   ├── GET    /idea/:id  - Get comments for idea
│   ├── POST   /          - Create comment
│   ├── PATCH  /:id       - Edit comment
│   └── DELETE /:id       - Delete comment
│
├── /teacher
│   ├── GET    /ideas     - Get ideas for review
│   ├── PATCH  /ideas/:id/status - Update idea status
│   └── POST   /ideas/:id/forward - Forward to principal
│
├── /principal
│   ├── GET    /ideas     - Get forwarded ideas
│   ├── POST   /ideas/:id/approve - Approve with budget
│   └── POST   /ideas/:id/reject  - Reject with reason
│
├── /messages (WebSocket)
│   ├── WS /connect       - Establish WebSocket connection
│   ├── send message      - Send chat message
│   └── receive messages  - Listen for new messages
│
└── /users
    ├── GET  /:id         - Get user profile
    └── PATCH /:id        - Update profile
```

### Authentication Flow

**Registration:**
```javascript
POST /api/auth/register
{
  "email": "student@school.com",
  "username": "johnstudent",
  "password": "SecurePass123!",
  "role": "student"
}

↓

1. Validate input
2. Check if email/username exists
3. Hash password with bcrypt
4. Create user in database
5. Generate JWT token
6. Return token + user data
```

**Login:**
```javascript
POST /api/auth/login
{
  "email": "student@school.com",
  "password": "SecurePass123!"
}

↓

1. Find user by email
2. Compare password hash
3. Generate JWT token
4. Return token + user data
```

**JWT Token Structure:**
```javascript
{
  "userId": "uuid-here",
  "email": "student@school.com",
  "role": "student",
  "iat": 1234567890,  // Issued at
  "exp": 1234654290   // Expires (7 days later)
}
```

**Protected Routes:**
```javascript
// Middleware checks JWT on each request
async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// Use on protected routes
app.get('/api/ideas', authenticateToken, getIdeas);
```

### Real-time Features

**WebSocket vs HTTP Polling:**

| Feature | WebSocket | HTTP Polling |
|---------|-----------|--------------|
| Real-time | ✅ Instant | ⚠️ Delayed |
| Server load | ✅ Low | ❌ High |
| Complexity | ⚠️ Medium | ✅ Simple |
| Chat | ✅ Perfect | ❌ Bad |
| Updates | ✅ Great | ⚠️ OK |

**We use WebSocket for:**
- Real-time chat
- Live idea vote updates
- New comment notifications

**WebSocket Implementation:**
```javascript
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map(); // userId -> WebSocket

wss.on('connection', (ws, req) => {
  // Authenticate WebSocket
  const token = new URL(req.url, 'http://localhost').searchParams.get('token');
  const user = verifyJWT(token);
  
  if (!user) {
    ws.close();
    return;
  }
  
  // Store connection
  clients.set(user.userId, ws);
  
  // Handle messages
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'chat') {
      // Send to recipient
      const recipientWs = clients.get(data.recipientId);
      if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
        recipientWs.send(JSON.stringify({
          type: 'chat',
          from: user.userId,
          message: data.message,
          timestamp: new Date()
        }));
      }
      
      // Save to database
      saveMessageToDB(user.userId, data.recipientId, data.message);
    }
  });
  
  // Clean up on disconnect
  ws.on('close', () => {
    clients.delete(user.userId);
  });
});
```

### Error Handling

**Strategy:**
```javascript
// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak internal errors to client
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ 
      error: err.message,
      stack: err.stack 
    });
  }
});

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Use in routes
app.get('/api/ideas', asyncHandler(async (req, res) => {
  const ideas = await db.query('SELECT * FROM ideas');
  res.json(ideas.rows);
}));
```

**Error Types:**
- 400 - Bad Request (invalid input)
- 401 - Unauthorized (no token)
- 403 - Forbidden (insufficient permissions)
- 404 - Not Found
- 409 - Conflict (duplicate email)
- 500 - Internal Server Error

---

## Database Design

### Complete Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS AND AUTHENTICATION
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'principal')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- ============================================
-- IDEAS SYSTEM
-- ============================================

CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  
  -- Voting
  votes INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  
  -- Engagement
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'new' 
    CHECK (status IN ('new', 'under-review', 'forwarded', 'approved', 'rejected')),
  
  -- Teacher review
  teacher_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  forwarded_date TIMESTAMP,
  
  -- Principal decision
  principal_status VARCHAR(20) 
    CHECK (principal_status IN ('pending', 'in-progress', 'approved', 'rejected', 'implemented')),
  principal_notes TEXT,
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  budget DECIMAL(10, 2),
  implementation_date DATE,
  assigned_to UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Search
  search_vector tsvector
);

-- ============================================
-- VOTING SYSTEM
-- ============================================

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, idea_id)
);

-- ============================================
-- COMMENTS SYSTEM
-- ============================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Voting on comments
  votes INTEGER DEFAULT 0,
  
  -- Moderation
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comment_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, comment_id)
);

-- ============================================
-- MESSAGING/CHAT SYSTEM
-- ============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(participant1_id, participant2_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATIONS SYSTEM
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL 
    CHECK (type IN ('comment', 'vote', 'status_change', 'message', 'mention')),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ANALYTICS/STATS
-- ============================================

CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_ideas INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_votes_received INTEGER DEFAULT 0,
  total_votes_given INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Ideas
CREATE INDEX idx_ideas_author ON ideas(author_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_principal_status ON ideas(principal_status);
CREATE INDEX idx_ideas_category ON ideas(category);
CREATE INDEX idx_ideas_created ON ideas(created_at DESC);
CREATE INDEX idx_ideas_votes ON ideas(votes DESC);
CREATE INDEX idx_ideas_search ON ideas USING gin(search_vector);

-- Votes
CREATE INDEX idx_votes_idea ON votes(idea_id);
CREATE INDEX idx_votes_user ON votes(user_id);

-- Comments
CREATE INDEX idx_comments_idea ON comments(idea_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_unread ON messages(read) WHERE read = FALSE;

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(read) WHERE read = FALSE;

-- ============================================
-- TRIGGERS AND FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ideas_updated_at
BEFORE UPDATE ON ideas
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Automatically update idea vote count
CREATE OR REPLACE FUNCTION update_idea_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ideas 
    SET votes = votes + (CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END),
        upvotes = upvotes + (CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE 0 END),
        downvotes = downvotes + (CASE WHEN NEW.vote_type = 'down' THEN 1 ELSE 0 END)
    WHERE id = NEW.idea_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ideas 
    SET votes = votes - (CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END),
        upvotes = upvotes - (CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE 0 END),
        downvotes = downvotes - (CASE WHEN OLD.vote_type = 'down' THEN 1 ELSE 0 END)
    WHERE id = OLD.idea_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE ideas 
    SET votes = votes + (CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END)
                      - (CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END),
        upvotes = upvotes + (CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE 0 END)
                          - (CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE 0 END),
        downvotes = downvotes + (CASE WHEN NEW.vote_type = 'down' THEN 1 ELSE 0 END)
                              - (CASE WHEN OLD.vote_type = 'down' THEN 1 ELSE 0 END)
    WHERE id = NEW.idea_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_idea_votes_trigger
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_idea_votes();

-- Update comment count
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

CREATE TRIGGER update_comment_count_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Update search vector for full-text search
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_search_vector_trigger
BEFORE INSERT OR UPDATE ON ideas
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- ============================================
-- DEMO DATA
-- ============================================

-- Create demo users
INSERT INTO profiles (email, username, full_name, password_hash, role) VALUES
('principal@school.com', 'principal', 'Dr. Principal', '$2b$10$...hash...', 'principal'),
('teacher@school.com', 'mrsmith', 'Mr. Smith', '$2b$10$...hash...', 'teacher'),
('student@school.com', 'johnstudent', 'John Student', '$2b$10$...hash...', 'student');
```

### Database Relationships

```
profiles (users)
   ↓
   ├── ideas (1:many - user creates ideas)
   ├── votes (1:many - user votes on ideas)
   ├── comments (1:many - user writes comments)
   └── messages (1:many - user sends messages)

ideas
   ├── votes (1:many - idea has votes)
   ├── comments (1:many - idea has comments)
   ├── author → profiles (many:1)
   └── reviewed_by → profiles (many:1)

comments
   ├── author → profiles (many:1)
   ├── idea → ideas (many:1)
   └── parent_id → comments (self-referential for nesting)
```

### Query Examples

**Get ideas with author info:**
```sql
SELECT 
  i.*,
  p.username as author_name,
  p.avatar_url as author_avatar,
  (SELECT COUNT(*) FROM votes WHERE idea_id = i.id AND vote_type = 'up') as upvotes,
  (SELECT COUNT(*) FROM votes WHERE idea_id = i.id AND vote_type = 'down') as downvotes
FROM ideas i
JOIN profiles p ON i.author_id = p.id
WHERE i.status != 'rejected'
ORDER BY i.votes DESC, i.created_at DESC
LIMIT 20;
```

**Get user's vote on ideas:**
```sql
SELECT 
  i.*,
  v.vote_type as user_vote
FROM ideas i
LEFT JOIN votes v ON v.idea_id = i.id AND v.user_id = $1
ORDER BY i.created_at DESC;
```

**Get comments with nested replies:**
```sql
WITH RECURSIVE comment_tree AS (
  -- Base case: top-level comments
  SELECT 
    c.*,
    p.username as author_name,
    0 as depth
  FROM comments c
  JOIN profiles p ON c.author_id = p.id
  WHERE c.idea_id = $1 AND c.parent_id IS NULL
  
  UNION ALL
  
  -- Recursive case: replies
  SELECT 
    c.*,
    p.username as author_name,
    ct.depth + 1
  FROM comments c
  JOIN profiles p ON c.author_id = p.id
  JOIN comment_tree ct ON c.parent_id = ct.id
)
SELECT * FROM comment_tree
ORDER BY depth, created_at;
```

**Full-text search:**
```sql
SELECT 
  i.*,
  ts_rank(i.search_vector, query) as rank
FROM ideas i,
     to_tsquery('english', 'solar & panel') query
WHERE i.search_vector @@ query
ORDER BY rank DESC;
```

---

## Real-time Chat System

### Why Not Matrix?

**Matrix is overkill for school chat because:**
- Complex setup (Synapse server, federation)
- Heavy resource usage (not ideal for Raspberry Pi)
- Over-engineered for 100-500 users
- E2E encryption unnecessary for school context

**Simple WebSocket chat is perfect because:**
- ✅ Real-time (instant messages)
- ✅ Low resource usage
- ✅ Simple to implement
- ✅ Scales to 1000+ users easily
- ✅ Works on Raspberry Pi

### Chat Architecture

```
Client (Browser)
    ↓ WebSocket connection
    ↓
Backend (Node.js + ws library)
    ↓
1. Authenticate user via JWT
2. Store connection in memory Map
3. Route messages to recipients
4. Save to database
    ↓
PostgreSQL (message history)
```

### Implementation

**Backend WebSocket Server:**
```javascript
// backend/chat.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

// Store active connections: userId -> WebSocket
const connections = new Map();

function setupChatServer(server) {
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws/chat'
  });
  
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');
    
    let userId = null;
    
    // Handle incoming messages
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data);
        
        // First message must be authentication
        if (message.type === 'auth') {
          const token = message.token;
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
          
          // Store connection
          connections.set(userId, ws);
          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'auth_success',
            userId: userId
          }));
          
          // Send offline messages
          const offlineMessages = await getOfflineMessages(userId);
          ws.send(JSON.stringify({
            type: 'offline_messages',
            messages: offlineMessages
          }));
          
          return;
        }
        
        // Require authentication for other messages
        if (!userId) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Not authenticated'
          }));
          return;
        }
        
        // Handle chat message
        if (message.type === 'chat') {
          const { recipientId, content } = message;
          
          // Save to database
          const savedMessage = await saveMessage({
            senderId: userId,
            recipientId: recipientId,
            content: content
          });
          
          // Send to recipient if online
          const recipientWs = connections.get(recipientId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'chat',
              messageId: savedMessage.id,
              from: userId,
              content: content,
              timestamp: savedMessage.created_at
            }));
          }
          
          // Confirm to sender
          ws.send(JSON.stringify({
            type: 'sent',
            messageId: savedMessage.id,
            timestamp: savedMessage.created_at
          }));
        }
        
        // Handle typing indicator
        if (message.type === 'typing') {
          const recipientWs = connections.get(message.recipientId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'typing',
              from: userId,
              isTyping: message.isTyping
            }));
          }
        }
        
        // Handle read receipt
        if (message.type === 'read') {
          await markMessagesAsRead(message.messageIds, userId);
          
          // Notify sender
          const senderWs = connections.get(message.senderId);
          if (senderWs && senderWs.readyState === WebSocket.OPEN) {
            senderWs.send(JSON.stringify({
              type: 'read_receipt',
              messageIds: message.messageIds
            }));
          }
        }
        
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });
    
    // Handle disconnect
    ws.on('close', () => {
      if (userId) {
        connections.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // Heartbeat to detect broken connections
  setInterval(() => {
    connections.forEach((ws, userId) => {
      if (ws.readyState !== WebSocket.OPEN) {
        connections.delete(userId);
      }
    });
  }, 30000); // Every 30 seconds
}

// Database functions
async function saveMessage({ senderId, recipientId, content }) {
  const result = await db.query(
    `INSERT INTO messages (sender_id, recipient_id, content) 
     VALUES ($1, $2, $3) RETURNING *`,
    [senderId, recipientId, content]
  );
  return result.rows[0];
}

async function getOfflineMessages(userId) {
  const result = await db.query(
    `SELECT m.*, p.username as sender_name 
     FROM messages m
     JOIN profiles p ON m.sender_id = p.id
     WHERE m.recipient_id = $1 AND m.read = FALSE
     ORDER BY m.created_at`,
    [userId]
  );
  return result.rows;
}

async function markMessagesAsRead(messageIds, userId) {
  await db.query(
    `UPDATE messages 
     SET read = TRUE, read_at = CURRENT_TIMESTAMP 
     WHERE id = ANY($1) AND recipient_id = $2`,
    [messageIds, userId]
  );
}

module.exports = { setupChatServer };
```

**Frontend Chat Hook:**
```typescript
// hooks/useChat.ts
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  from: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export function useChat(token: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const ws = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
    
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onopen = () => {
      console.log('WebSocket connected');
      
      // Authenticate
      ws.current?.send(JSON.stringify({
        type: 'auth',
        token: token
      }));
    };
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'auth_success') {
        setIsConnected(true);
      }
      
      if (data.type === 'offline_messages') {
        setMessages(data.messages);
      }
      
      if (data.type === 'chat') {
        setMessages(prev => [...prev, {
          id: data.messageId,
          from: data.from,
          content: data.content,
          timestamp: new Date(data.timestamp),
          read: false
        }]);
      }
      
      if (data.type === 'typing') {
        setIsTyping(prev => ({
          ...prev,
          [data.from]: data.isTyping
        }));
      }
    };
    
    ws.current.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };
    
    return () => {
      ws.current?.close();
    };
  }, [token]);
  
  const sendMessage = (recipientId: string, content: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'chat',
        recipientId,
        content
      }));
    }
  };
  
  const sendTypingIndicator = (recipientId: string, isTyping: boolean) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'typing',
        recipientId,
        isTyping
      }));
    }
  };
  
  return {
    messages,
    isConnected,
    isTyping,
    sendMessage,
    sendTypingIndicator
  };
}
```

### Performance Considerations

**Memory Usage:**
- Each WebSocket connection: ~10KB
- 100 users = 1MB
- 500 users = 5MB
- Very manageable for Raspberry Pi

**Message Throughput:**
- Raspberry Pi 4 can handle 1000+ messages/second
- School chat rarely exceeds 10 messages/second

**Scaling Strategy:**
If you outgrow single server:
1. Use Redis for message queue
2. Add more backend servers
3. Use Redis Pub/Sub for cross-server messaging

---

*[Part 1 of 2 - Continue in next file...]*

This is getting long! Should I continue with the rest (Cloudflare Tunnel setup, deployment, mobile apps, etc.) in a second file, or would you like me to condense it?
