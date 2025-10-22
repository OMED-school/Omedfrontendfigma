// Mock Backend API - Simulates a real backend
// Replace this with actual API calls when you set up Supabase or another backend

export type UserRole = 'student' | 'teacher' | 'principal';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: UserRole;
  avatar?: string;
  joinDate: string;
}

// Mock user database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'student@school.edu',
    name: 'John Student',
    username: 'johnstudent',
    role: 'student',
    joinDate: '2024-09-01',
  },
  {
    id: '2',
    email: 'teacher@school.edu',
    name: 'Ms. Johnson',
    username: 'mjohnson',
    role: 'teacher',
    joinDate: '2020-08-15',
  },
  {
    id: '3',
    email: 'principal@school.edu',
    name: 'Dr. Smith',
    username: 'drsmith',
    role: 'principal',
    joinDate: '2015-07-01',
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth token storage
const TOKEN_KEY = 'school_ideas_auth_token';

class MockBackendAPI {
  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(500); // Simulate network delay

    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // In a real backend, you'd verify the password here
    // For demo, we accept any password for existing users
    
    const token = `mock_token_${user.id}_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('user_id', user.id);

    return { user, token };
  }

  async signup(data: {
    email: string;
    password: string;
    name: string;
    username: string;
  }): Promise<{ user: User; token: string }> {
    await delay(500);

    // Check if email already exists
    if (mockUsers.find(u => u.email === data.email)) {
      throw new Error('Email already registered');
    }

    // Check if username already exists
    if (mockUsers.find(u => u.username === data.username)) {
      throw new Error('Username already taken');
    }

    // Create new user (always as student by default)
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      username: data.username,
      role: 'student', // New users are students by default
      joinDate: new Date().toISOString().split('T')[0],
    };

    mockUsers.push(newUser);

    const token = `mock_token_${newUser.id}_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('user_id', newUser.id);

    return { user: newUser, token };
  }

  async getCurrentUser(): Promise<User | null> {
    await delay(200);

    const token = localStorage.getItem(TOKEN_KEY);
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      return null;
    }

    const user = mockUsers.find(u => u.id === userId);
    return user || null;
  }

  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('user_id');
  }

  // Helper to get current user synchronously (for testing)
  getCurrentUserSync(): User | null {
    const userId = localStorage.getItem('user_id');
    if (!userId) return null;
    return mockUsers.find(u => u.id === userId) || null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  // Get demo credentials (for login screen)
  getDemoCredentials() {
    return {
      student: { email: 'student@school.edu', password: 'password' },
      teacher: { email: 'teacher@school.edu', password: 'password' },
      principal: { email: 'principal@school.edu', password: 'password' },
    };
  }
}

export const mockBackend = new MockBackendAPI();
