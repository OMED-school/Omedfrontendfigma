# Migration from Mock Data to Supabase

This document describes the changes made to migrate from mock data to Supabase backend.

## Overview

The application has been fully migrated from using local mock data to a real Supabase backend. This provides:
- **Real-time updates** - Changes appear instantly across all users
- **Persistent storage** - Data is saved in a PostgreSQL database
- **Secure authentication** - User accounts with role-based access
- **Scalability** - Can handle many concurrent users
- **Production-ready** - Enterprise-grade backend infrastructure

## What Changed

### Removed Files
- ❌ `src/lib/mockBackend.ts` - Mock authentication and data storage

### New Files

#### Core Infrastructure
- ✅ `src/lib/supabaseClient.ts` - Supabase client initialization
- ✅ `src/lib/types.ts` - TypeScript types matching database schema
- ✅ `src/lib/supabaseAuth.ts` - Authentication service using Supabase Auth

#### React Hooks
- ✅ `src/hooks/useIdeas.ts` - Fetch ideas with real-time updates
- ✅ `src/hooks/useVote.ts` - Vote on ideas
- ✅ `src/hooks/useIdeaActions.ts` - Create and update ideas
- ✅ `src/hooks/useComments.ts` - Comments with nested replies
- ✅ `src/hooks/useMessages.ts` - Chat and messaging

#### Documentation
- ✅ `SUPABASE_SETUP.md` - Complete setup guide
- ✅ `MIGRATION_GUIDE.md` - This file

### Modified Files

#### `package.json`
Changed from JSR registry package to standard npm package:
```diff
- "@jsr/supabase__supabase-js": "^2.49.8"
+ "@supabase/supabase-js": "^2.49.8"
```

#### `src/contexts/AuthContext.tsx`
Updated to use Supabase authentication instead of mock backend:
```diff
- import { mockBackend, type User } from '../lib/mockBackend';
+ import { authService, type User } from '../lib/supabaseAuth';
```

#### `src/App.tsx`
Major refactor to use Supabase hooks instead of local state:
- Removed all mock data arrays (mockIdeas, mockTeacherIdeas, mockPrincipalIdeas)
- Replaced `useState` with Supabase hooks (`useIdeas`, `useTeacherIdeas`, `usePrincipalIdeas`)
- Updated all handlers to use async Supabase operations
- Added real-time data updates via subscriptions

#### `src/components/ChatModal.tsx`
Updated to use real chat data:
- Removed mock users and messages
- Integrated `useChatUsers` and `useMessages` hooks
- Added real-time message synchronization

## Key Differences in Behavior

### Before (Mock Data)
- Data was stored in browser memory
- Data was lost on page refresh
- Each user saw their own local data
- No user accounts - role switching was just a UI toggle
- Instant operations (no network delay)

### After (Supabase)
- Data is stored in PostgreSQL database
- Data persists across sessions
- All users see the same data in real-time
- Real user authentication with different accounts
- Operations may have slight network delay
- Requires internet connection

## Migration Steps for Developers

If you were working with the previous mock data version:

### 1. Update Dependencies
```bash
npm install
```

### 2. Set Up Supabase
Follow the complete guide in `SUPABASE_SETUP.md`:
1. Create a Supabase project
2. Run database schema SQL
3. Set up Row Level Security policies
4. Create database triggers
5. Configure authentication
6. Update project credentials in `src/utils/supabase/info.tsx`

### 3. Create Test Data
Since the database starts empty, you'll need to:
1. Sign up test users through the app
2. Manually set user roles in Supabase dashboard
3. Create some test ideas and comments

### 4. Test All Features
- ✅ User signup and login
- ✅ Creating ideas
- ✅ Voting on ideas
- ✅ Commenting on ideas
- ✅ Teacher review workflow
- ✅ Principal approval workflow
- ✅ Chat messaging

## Code Changes for Custom Features

### Adding a New Field to Ideas

**Before (Mock):**
Just add the field to the mock data array.

**After (Supabase):**
1. Add column to database:
```sql
ALTER TABLE ideas ADD COLUMN new_field TEXT;
```

2. Update TypeScript types in `src/lib/types.ts`:
```typescript
export interface IdeaRow {
  // ... existing fields
  new_field: string | null;
}
```

3. Update hook in `src/hooks/useIdeas.ts` to include the new field

### Adding a New Feature

**Before (Mock):**
Add handler function and update local state.

**After (Supabase):**
1. Design database schema
2. Add table/columns
3. Set up RLS policies
4. Create TypeScript types
5. Create React hook
6. Use hook in components

## API Differences

### Authentication

**Before:**
```typescript
// Mock - accepted any password
await mockBackend.login(email, password);
```

**After:**
```typescript
// Supabase - validates credentials
await authService.login(email, password);
```

### Creating an Idea

**Before:**
```typescript
// Local state update
setIdeas([newIdea, ...ideas]);
```

**After:**
```typescript
// Database insert
await createIdea({
  title, description, category, authorId
});
// Hook automatically updates via real-time subscription
```

### Voting

**Before:**
```typescript
// Update local array
setIdeas(ideas.map(idea => 
  idea.id === ideaId ? { ...idea, votes: newVotes } : idea
));
```

**After:**
```typescript
// Database transaction
await vote(ideaId, userId, voteType);
// Hook automatically updates via trigger + subscription
```

## Real-Time Features

One of the major benefits of Supabase is real-time updates:

### Ideas List
```typescript
// Automatically subscribes to changes
const { ideas } = useIdeas(user?.id);

// When any user creates/updates an idea, all users see it instantly
```

### Comments
```typescript
// Real-time comment updates
const { comments } = useComments(ideaId, user?.id);

// New comments appear immediately for all users
```

### Chat Messages
```typescript
// Real-time messaging
const { messages } = useMessages(currentUserId, recipientId);

// Messages appear instantly in both users' chats
```

## Error Handling

### Before (Mock)
Errors were simulated or didn't exist.

### After (Supabase)
Real errors can occur:
- Network errors
- Permission errors (RLS)
- Validation errors
- Database errors

All hooks and functions now include proper error handling:
```typescript
try {
  await createIdea(data);
} catch (error) {
  console.error('Error creating idea:', error);
  alert('Failed to create idea');
}
```

## Performance Considerations

### Database Queries
- Hooks use `.select()` with joins to minimize queries
- Results are cached in component state
- Real-time subscriptions only update when data changes

### Pagination
Currently fetches all ideas. For large datasets, consider:
```typescript
const { data } = await supabase
  .from('ideas')
  .select('*')
  .range(0, 50) // Limit to 50 items
  .order('created_at', { ascending: false });
```

## Testing

### Unit Testing
Mock Supabase in tests:
```typescript
jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    auth: jest.fn(),
  }
}));
```

### Integration Testing
Use a test Supabase project with seeded data.

## Troubleshooting

### "No rows returned" errors
Check Row Level Security policies - they may be too restrictive.

### Real-time updates not working
Ensure Realtime is enabled in Supabase dashboard for all tables.

### Authentication errors
Verify credentials in `src/utils/supabase/info.tsx` match your project.

### Vote counts not updating
Check that database triggers are installed correctly.

## Benefits of This Migration

1. **Production Ready** - No more "this is just demo data" disclaimers
2. **Multi-User** - Multiple people can use the app simultaneously
3. **Persistent** - Data survives browser refresh and app restarts
4. **Real-time** - Changes appear instantly for all users
5. **Secure** - Row Level Security protects user data
6. **Scalable** - Can handle growth from 10 to 10,000+ users
7. **Maintainable** - Structured database schema with migrations
8. **Extensible** - Easy to add new features with database backing

## Next Steps

1. Read `SUPABASE_SETUP.md` for setup instructions
2. Create your Supabase project
3. Run the database migrations
4. Test all features with real data
5. Deploy to production!

## Support

If you encounter issues during migration:
1. Check `SUPABASE_SETUP.md` troubleshooting section
2. Review Supabase logs in dashboard
3. Check browser console for errors
4. Verify database policies and triggers are installed

## Conclusion

This migration transforms the app from a demo with fake data into a production-ready application with real backend infrastructure. While it requires initial setup, the benefits far outweigh the effort.

Welcome to the new Supabase-powered School Ideas Platform! 🚀
